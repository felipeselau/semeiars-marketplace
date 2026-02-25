import { Prisma } from '@prisma/client'

export type Category = Prisma.CategoryGetPayload<{
  select: { id: true; name: true; createdAt: true }
}>

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    seller: { select: { id: true; name: true } }
    category: true
  }
}>

export type ProductWithSeller = Prisma.ProductGetPayload<{
  include: {
    seller: { select: { id: true; name: true; email: true } }
    category: true
  }
}>

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true }
}>

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            seller: { select: { name: true } }
          }
        }
      }
    }
  }
}>

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            seller: { select: { name: true } }
          }
        }
      }
    }
  }
}>

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        seller: { select: { name: true } }
      }
    }
  }
}>
