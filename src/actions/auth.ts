'use server'

import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function registerUser(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
  }

  try {
    const validated = registerSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: 'Email already registered' }
    }

    const hashedPassword = await hash(validated.password, 12)

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        phone: validated.phone,
        address: validated.address,
      },
    })

    revalidatePath('/login')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Failed to register user' }
  }
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER']).optional(),
})

export async function updateProfile(userId: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
    role: formData.get('role') || undefined,
  }

  try {
    const validated = profileSchema.parse(data)

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        address: validated.address,
        role: validated.role,
      },
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: 'Failed to update profile' }
  }
}
