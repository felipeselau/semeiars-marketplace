'use server'

import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function initiateCheckout(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
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

  if (!cart || cart.items.length === 0) {
    return { error: 'Carrinho vazio' }
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.currentPrice * item.quantity,
    0
  )

  const sellersWithPayment = new Set<string>()
  const sellersWithoutPayment = new Set<string>()

  for (const item of cart.items) {
    if (item.product.seller.sellerPayment?.isActive) {
      sellersWithPayment.add(item.product.seller.name)
    } else {
      sellersWithoutPayment.add(item.product.seller.name)
    }
  }

  if (sellersWithoutPayment.size > 0) {
    const sellerList = Array.from(sellersWithoutPayment).join(', ')
    return { 
      error: `Os seguintes vendedores ainda não configuraram pagamento: ${sellerList}. Aguarde até que todos configurem o PIX.`,
      sellersWithoutPayment: Array.from(sellersWithoutPayment)
    }
  }

  const order = await prisma.order.create({
    data: {
      buyerId: userId,
      totalAmount,
      status: OrderStatus.PENDING,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.currentPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  const uniqueSellerIds = [...new Set(cart.items.map((item) => item.product.sellerId))]
  
  for (const sellerId of uniqueSellerIds) {
    await prisma.sellerOrder.create({
      data: {
        orderId: order.id,
        sellerId,
        status: OrderStatus.PENDING,
      },
    })
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    }),
    ...cart.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })
    ),
  ])

  return { success: true, orderId: order.id, totalAmount }
}
