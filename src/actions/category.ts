'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export async function createCategory(formData: FormData) {
  const data = {
    name: formData.get('name'),
  }

  const validated = categorySchema.parse(data)

  const existing = await prisma.category.findUnique({
    where: { name: validated.name },
  })

  if (existing) {
    return { error: 'Category already exists' }
  }

  await prisma.category.create({
    data: validated,
  })

  revalidatePath('/products')
  return { success: true }
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getCategoryById(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
  })
}
