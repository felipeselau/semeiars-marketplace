'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive('O preço deve ser positivo'),
  currentPrice: z.coerce.number().positive('O preço deve ser positivo'),
  quantity: z.coerce.number().int().min(0, 'A quantidade deve ser 0 ou mais'),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function createProduct(sellerId: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    basePrice: formData.get('basePrice'),
    currentPrice: formData.get('currentPrice') || formData.get('basePrice'),
    quantity: formData.get('quantity'),
    categoryId: formData.get('categoryId') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
  }

  try {
    const validated = productSchema.parse(data)

    await prisma.product.create({
      data: {
        ...validated,
        sellerId,
        imageUrl: validated.imageUrl || null,
      },
    })

    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Falha ao criar produto' }
  }
}

export async function updateProduct(productId: string, sellerId: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    basePrice: formData.get('basePrice'),
    currentPrice: formData.get('currentPrice') || formData.get('basePrice'),
    quantity: formData.get('quantity'),
    categoryId: formData.get('categoryId') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
  }

  try {
    const validated = productSchema.parse(data)

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || product.sellerId !== sellerId) {
      return { error: 'Não autorizado a atualizar este produto' }
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        ...validated,
        imageUrl: validated.imageUrl || null,
      },
    })

    revalidatePath('/products')
    revalidatePath(`/products/${productId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Falha ao atualizar produto' }
  }
}

export async function deleteProduct(productId: string, sellerId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || product.sellerId !== sellerId) {
    return { error: 'Não autorizado a excluir este produto' }
  }

  await prisma.product.delete({
    where: { id: productId },
  })

  revalidatePath('/products')
  return { success: true }
}

export async function getProducts(search?: string, categoryId?: string) {
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  return prisma.product.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      category: true,
    },
  })
}

export async function getProductsBySeller(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
}
