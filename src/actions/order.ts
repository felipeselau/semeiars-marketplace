'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

export async function createOrder(userId: string, items: { productId: string; quantity: number; price: number }[]) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { 
      items: {
        include: {
          product: {
            select: { sellerId: true },
          },
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    return { error: 'Carrinho vazio' }
  }

  // Get unique sellers from the cart items
  const sellerIds = [...new Set(cart.items.map(item => item.product.sellerId))]

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
      sellerOrders: {
        create: sellerIds.map(sellerId => ({
          sellerId,
          status: 'PENDING',
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
  revalidatePath('/seller/orders')
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

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  })

  revalidatePath('/orders')
  return { success: true }
}

// Seller Orders Functions

export async function getSellerOrders(sellerId: string, statusFilter?: string) {
  const where: Record<string, unknown> = {
    sellerId,
  }

  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter.toUpperCase()
  }

  const orders = await prisma.sellerOrder.findMany({
    where,
    include: {
      order: {
        include: {
          buyer: {
            select: { name: true, email: true, phone: true, address: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true, sellerId: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
}

export async function getSellerOrderCounts(sellerId: string) {
  const orders = await prisma.sellerOrder.findMany({
    where: { sellerId },
    select: { status: true },
  })

  const counts = {
    all: orders.length,
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    SHIPPED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  }

  orders.forEach(order => {
    counts[order.status]++
  })

  return counts
}

export async function getSellerOrderById(orderId: string, sellerId: string) {
  return prisma.sellerOrder.findFirst({
    where: {
      orderId,
      sellerId,
    },
    include: {
      order: {
        include: {
          buyer: {
            select: { id: true, name: true, email: true, phone: true, address: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true, sellerId: true },
              },
            },
          },
        },
      },
    },
  })
}

export async function getOrderItemsForSeller(orderId: string, sellerId: string) {
  const sellerOrder = await prisma.sellerOrder.findFirst({
    where: { orderId, sellerId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true, sellerId: true },
              },
            },
          },
        },
      },
    },
  })

  if (!sellerOrder) return null

  // Filter items that belong to this seller
  const items = sellerOrder.order.items.filter(item => item.product.sellerId === sellerId)

  // Calculate total for this seller
  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)

  return {
    ...sellerOrder,
    items,
    total,
  }
}

export async function updateSellerOrderStatus(
  sellerOrderId: string,
  status: OrderStatus,
  estimatedPickupDate?: string
) {
  const data: Record<string, unknown> = { status }

  if (estimatedPickupDate) {
    data.estimatedPickupDate = new Date(estimatedPickupDate)
  }

  await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data,
  })

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
    select: { orderId: true },
  })

  revalidatePath('/seller/orders')
  if (sellerOrder) {
    revalidatePath(`/seller/orders/${sellerOrder.orderId}`)
  }
  return { success: true }
}

export async function updateSellerOrderNote(sellerOrderId: string, note: string) {
  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
  })

  await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: { note },
  })

  revalidatePath('/seller/orders')
  if (sellerOrder) {
    revalidatePath(`/seller/orders/${sellerOrder.orderId}`)
  }
  return { success: true }
}

export async function updatePickupInstructions(sellerOrderId: string, instructions: string) {
  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
  })

  await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: { pickupInstructions: instructions },
  })

  revalidatePath('/seller/orders')
  if (sellerOrder) {
    revalidatePath(`/seller/orders/${sellerOrder.orderId}`)
  }
  return { success: true }
}
