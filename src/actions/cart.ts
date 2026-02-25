'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
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

  return cart
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  const cart = await getOrCreateCart(userId)

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  })

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })
  }

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })
  }

  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  })

  revalidatePath('/cart')
  return { success: true }
}

export async function getCart(userId: string) {
  return getOrCreateCart(userId)
}
