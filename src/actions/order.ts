'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createOrder(userId: string, items: { productId: string; quantity: number; price: number }[]) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  })

  if (!cart || cart.items.length === 0) {
    return { error: 'Carrinho vazio' }
  }

  const order = await prisma.order.create({
    data: {
      buyerId: userId,
      totalAmount,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  })

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  })

  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    })
  }

  revalidatePath('/orders')
  revalidatePath('/cart')
  return { success: true, orderId: order.id }
}

export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { buyerId: userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderById(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, buyerId: userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: { select: { name: true } },
            },
          },
        },
      },
    },
  })
}

export async function updateOrderStatus(orderId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  })

  revalidatePath('/orders')
  return { success: true }
}
