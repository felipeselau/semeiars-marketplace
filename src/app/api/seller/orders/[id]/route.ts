import { auth } from '@/lib/auth'
import { getSellerOrderById } from '@/actions/order'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await getSellerOrderById(id, session.user.id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching seller order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
