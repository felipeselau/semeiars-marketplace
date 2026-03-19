'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

export async function createCategory(formData: FormData) {
  const data = {
    name: formData.get('name'),
  }

  try {
    const validated = categorySchema.parse(data)

    const existing = await prisma.category.findUnique({
      where: { name: validated.name },
    })

    if (existing) {
      return { error: 'Categoria já existe' }
    }

    await prisma.category.create({
      data: validated,
    })

    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Falha ao criar categoria' }
  }
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
