'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { encryptPIXKey, decryptPIXKey, validatePixKey } from '@/lib/encryption'
import { createPixCharge, getChargeStatus, getMockCharge } from '@/lib/abacatepay'
import { createPayout, simulateMockPayoutSuccess, getMockPayout } from '@/lib/pagseguro'
import { OrderStatus, PaymentStatus, PaymentSplitStatus, PayoutStatus, PixKeyType } from '@prisma/client'
import { z } from 'zod'

const COMMISSION_RATE = 0.10

const SellerPaymentSchema = z.object({
  cpfCnpj: z.string().min(11).max(14),
  pixKey: z.string().min(3).max(100),
  pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'TELEFONE']),
  pixBank: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Termos devem ser aceitos'),
})

export async function setupSellerPayment(
  sellerId: string,
  data: z.infer<typeof SellerPaymentSchema>
) {
  const validation = SellerPaymentSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  if (!validatePixKey(data.pixKey, data.pixKeyType)) {
    return { error: 'Chave PIX inválida para o tipo selecionado' }
  }

  const encryptedPixKey = encryptPIXKey(data.pixKey)

  const sellerPayment = await prisma.sellerPayment.upsert({
    where: { sellerId },
    create: {
      sellerId,
      cpfCnpj: data.cpfCnpj,
      pixKey: encryptedPixKey,
      pixKeyType: data.pixKeyType as PixKeyType,
      pixBank: data.pixBank,
      termsAccepted: data.termsAccepted,
      isVerified: false,
    },
    update: {
      cpfCnpj: data.cpfCnpj,
      pixKey: encryptedPixKey,
      pixKeyType: data.pixKeyType as PixKeyType,
      pixBank: data.pixBank,
      termsAccepted: data.termsAccepted,
    },
  })

  revalidatePath('/seller/payment-settings')
  return { success: true, sellerPayment }
}

export async function getSellerPayment(sellerId: string) {
  const payment = await prisma.sellerPayment.findUnique({
    where: { sellerId },
  })

  if (!payment) {
    return null
  }

  return {
    ...payment,
    pixKey: '••••••••••••••••',
    pixKeyMasked: maskPixKey(decryptPIXKey(payment.pixKey), payment.pixKeyType),
  }
}

function maskPixKey(key: string, type: string): string {
  switch (type) {
    case 'CPF':
      return key.replace(/(\d{3})\d{3}(\d{4})/, '$1.***.$2')
    case 'CNPJ':
      return key.replace(/(\d{2})\d{3}(\d{4})(\d{2})/, '$1.***.$3-$4')
    case 'EMAIL':
      const [local, domain] = key.split('@')
      return `${local.substring(0, 2)}***@${domain}`
    case 'TELEFONE':
      return key.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')
    default:
      return '••••••••'
  }
}

export async function hasPaymentSettings(sellerId: string): Promise<boolean> {
  const payment = await prisma.sellerPayment.findUnique({
    where: { sellerId },
  })
  return !!payment && payment.isActive
}

export async function getSellerPaymentForPayout(sellerId: string) {
  const payment = await prisma.sellerPayment.findUnique({
    where: { sellerId },
  })

  if (!payment || !payment.isActive) {
    return null
  }

  return {
    ...payment,
    pixKey: decryptPIXKey(payment.pixKey),
  }
}

const CreatePaymentSchema = z.object({
  orderId: z.string(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerDocument: z.string().min(11).max(14),
})

export async function createPixPayment(
  userId: string,
  data: z.infer<typeof CreatePaymentSchema>
) {
  const validation = CreatePaymentSchema.safeParse(data)
  
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: {
                include: {
                  sellerPayment: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!order || order.buyerId !== userId) {
    return { error: 'Pedido não encontrado' }
  }

  if (order.status !== OrderStatus.PENDING) {
    return { error: 'Pedido já processado' }
  }

  const sellersWithPayment = new Set<string>()
  for (const item of order.items) {
    if (item.product.seller.sellerPayment?.isActive) {
      sellersWithPayment.add(item.product.sellerId)
    }
  }

  if (sellersWithPayment.size === 0) {
    return { error: 'Nenhum vendedor possui configuração de pagamento ativa' }
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      buyerId: userId,
      amount: order.totalAmount,
      status: PaymentStatus.PENDING,
    },
  })

  const sellerTotals = new Map<string, number>()
  for (const item of order.items) {
    const current = sellerTotals.get(item.product.sellerId) || 0
    sellerTotals.set(item.product.sellerId, current + item.price * item.quantity)
  }

  for (const [sellerId, grossAmount] of sellerTotals) {
    const commission = grossAmount * COMMISSION_RATE
    const netAmount = grossAmount - commission

    await prisma.paymentSplit.create({
      data: {
        paymentId: payment.id,
        sellerId,
        grossAmount,
        commission,
        netAmount,
        payoutStatus: PaymentSplitStatus.PENDING,
      },
    })
  }

  const products = order.items.map((item) => ({
    name: `${item.product.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`,
    value: Math.round(item.price * 100),
    amount: 1,
  }))

  try {
    const charge = await createPixCharge({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products,
      customer: {
        name: data.customerName,
        email: data.customerEmail,
        document: data.customerDocument,
      },
      returnUrl: `${process.env.NEXTAUTH_URL}/checkout/waiting/${payment.id}`,
      completionUrl: `${process.env.NEXTAUTH_URL}/checkout/waiting/${payment.id}`,
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        abacatePayId: charge.id,
        status: charge.pix ? PaymentStatus.WAITING : PaymentStatus.PENDING,
        pixQrCode: charge.pix?.qrCode,
        pixCopyPaste: charge.pix?.copyPaste,
        paymentUrl: charge.pix ? `${process.env.NEXTAUTH_URL}/checkout/waiting/${payment.id}` : null,
      },
    })

    revalidatePath('/cart')
    revalidatePath('/orders')
    
    return {
      success: true,
      paymentId: payment.id,
      pixQrCode: charge.pix?.qrCode,
      pixCopyPaste: charge.pix?.copyPaste,
    }
  } catch (error) {
    await prisma.$transaction([
      prisma.paymentSplit.deleteMany({ where: { paymentId: payment.id } }),
      prisma.payment.delete({ where: { id: payment.id } }),
    ])
    
    console.error('Payment creation error:', error)
    return { error: 'Erro ao criar pagamento. Tente novamente.' }
  }
}

export async function checkPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: true,
    },
  })

  if (!payment) {
    return { error: 'Pagamento não encontrado' }
  }

  if (payment.status === PaymentStatus.CONFIRMED) {
    return {
      success: true,
      status: payment.status,
      orderId: payment.orderId,
    }
  }

  if (!payment.abacatePayId) {
    return { error: 'ID de pagamento não encontrado' }
  }

  try {
    const charge = await getChargeStatus(payment.abacatePayId)

    let newStatus: PaymentStatus = payment.status as PaymentStatus
    if (charge.status === 'CONFIRMED') {
      newStatus = PaymentStatus.CONFIRMED
    } else if (charge.status === 'FAILED' || charge.status === 'CANCELED') {
      newStatus = PaymentStatus.FAILED
    }

    if (newStatus !== payment.status) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          paidAt: newStatus === PaymentStatus.CONFIRMED ? new Date() : null,
        },
      })

      if (newStatus === PaymentStatus.CONFIRMED) {
        await processPaymentSplit(paymentId)
        
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CONFIRMED },
        })
      } else if (newStatus === PaymentStatus.FAILED) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        })
      }

      revalidatePath('/orders')
      revalidatePath(`/checkout/waiting/${paymentId}`)
    }

    return {
      success: true,
      status: newStatus,
      orderId: payment.orderId,
    }
  } catch (error) {
    console.error('Payment status check error:', error)
    return { error: 'Erro ao verificar status do pagamento' }
  }
}

export async function getPaymentById(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: true,
                },
              },
            },
          },
        },
      },
      splits: {
        include: {
          payout: true,
        },
      },
    },
  })
}

export async function processPaymentSplit(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      splits: true,
    },
  })

  if (!payment || payment.status !== PaymentStatus.CONFIRMED) {
    return { error: 'Pagamento não confirmado' }
  }

  for (const split of payment.splits) {
    if (split.payoutStatus !== PaymentSplitStatus.PENDING) {
      continue
    }

    const sellerPayment = await getSellerPaymentForPayout(split.sellerId)
    
    if (!sellerPayment) {
      console.log(`No payment settings for seller ${split.sellerId}, skipping payout`)
      continue
    }

    await prisma.paymentSplit.update({
      where: { id: split.id },
      data: { payoutStatus: PaymentSplitStatus.PROCESSING },
    })

    try {
      const payout = await createPayout({
        pixKey: sellerPayment.pixKey,
        pixKeyType: sellerPayment.pixKeyType,
        amount: split.netAmount,
        referenceId: split.id,
        description: `Pagamento pedido ${payment.orderId}`,
      })

      await prisma.payout.create({
        data: {
          sellerId: split.sellerId,
          paymentSplitId: split.id,
          amount: split.netAmount,
          pagseguroId: payout.id,
          status: PayoutStatus.PROCESSING,
        },
      })

      await prisma.paymentSplit.update({
        where: { id: split.id },
        data: {
          payoutStatus: PaymentSplitStatus.SENT,
        },
      })

      revalidatePath('/seller/balance')
      revalidatePath('/seller/payouts')
    } catch (error) {
      console.error(`Payout error for split ${split.id}:`, error)
      
      await prisma.paymentSplit.update({
        where: { id: split.id },
        data: { payoutStatus: PaymentSplitStatus.FAILED },
      })
    }
  }

  return { success: true }
}

export async function getSellerBalance(sellerId: string) {
  const splits = await prisma.paymentSplit.findMany({
    where: {
      sellerId,
    },
    include: {
      payment: {
        include: {
          order: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  let pending = 0
  let inTransit = 0
  let available = 0
  let totalPaid = 0

  for (const split of splits) {
    if (split.payoutStatus === PaymentSplitStatus.PENDING) {
      pending += split.netAmount
    } else if (split.payoutStatus === PaymentSplitStatus.SENT || 
               split.payoutStatus === PaymentSplitStatus.PROCESSING) {
      inTransit += split.netAmount
    } else if (split.payoutStatus === PaymentSplitStatus.SUCCESS) {
      available += split.netAmount
      totalPaid += split.netAmount
    }
  }

  return {
    pending,
    inTransit,
    available,
    totalPaid,
    transactionCount: splits.length,
  }
}

export async function getPayoutHistory(sellerId: string, limit = 20) {
  const payouts = await prisma.payout.findMany({
    where: { sellerId },
    include: {
      paymentSplit: {
        include: {
          payment: {
            include: {
              order: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return payouts
}

export async function retryPayout(payoutId: string) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      paymentSplit: true,
    },
  })

  if (!payout) {
    return { error: 'Repasse não encontrado' }
  }

  if (payout.status === PayoutStatus.SUCCESS) {
    return { error: 'Repasse já confirmado' }
  }

  const sellerPayment = await getSellerPaymentForPayout(payout.sellerId)
  
  if (!sellerPayment) {
    return { error: 'Configuração de pagamento não encontrada' }
  }

  try {
    const result = await createPayout({
      pixKey: sellerPayment.pixKey,
      pixKeyType: sellerPayment.pixKeyType,
      amount: payout.amount,
      referenceId: payout.paymentSplitId,
      description: `Retry - Pagamento ${payout.paymentSplitId}`,
    })

    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        pagseguroId: result.id,
        status: PayoutStatus.PROCESSING,
        errorMessage: null,
      },
    })

    revalidatePath('/seller/payouts')
    return { success: true }
  } catch (error) {
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    })
    
    return { error: 'Erro ao tentar novamente. Entre em contato com o suporte.' }
  }
}

export async function getAllPayouts(status?: string) {
  const where: Record<string, unknown> = {}
  
  if (status && status !== 'all') {
    where.status = status.toUpperCase()
  }

  return prisma.payout.findMany({
    where,
    include: {
      seller: {
        select: { name: true, email: true },
      },
      paymentSplit: {
        include: {
          payment: {
            include: {
              order: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}
