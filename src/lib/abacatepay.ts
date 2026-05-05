import crypto from 'crypto'

const ABACATEPAY_BASE_URL =
  process.env.ABACATEPAY_ENV === 'production'
    ? 'https://api.abacatepay.com/v1'
    : 'https://sandbox.abacatepay.com/v1'

interface AbacatePayCustomer {
  name: string
  email: string
  document: string
}

interface AbacatePayProduct {
  name: string
  value: number
  amount: number
}

interface CreateChargeRequest {
  frequency: 'ONE_TIME' | 'RECURRENT'
  methods: ['PIX']
  products: AbacatePayProduct[]
  customer: AbacatePayCustomer
  returnUrl?: string
  completionUrl?: string
}

interface CreateChargeResponse {
  id: string
  status: 'PENDING' | 'WAITING' | 'CONFIRMED' | 'FAILED' | 'CANCELED'
  createdAt: string
  updatedAt: string
  expiresAt: string
  frequency: string
  methods: string[]
  products: Array<{
    name: string
    value: number
    amount: number
  }>
  customer: {
    name: string
    email: string
    document: string
  }
  paidAt?: string
  pix?: {
    qrCode: string
    copyPaste: string
    expiresAt: string
  }
}

interface GetChargeResponse {
  id: string
  status: 'PENDING' | 'WAITING' | 'CONFIRMED' | 'FAILED' | 'CANCELED'
  paidAt?: string
  pix?: {
    qrCode: string
    copyPaste: string
  }
}

function getApiKey(): string {
  return process.env.ABACATEPAY_API_KEY || ''
}

function isMockMode(): boolean {
  return process.env.MOCK_PAYMENTS === 'true'
}

export async function createPixCharge(request: CreateChargeRequest): Promise<CreateChargeResponse> {
  if (isMockMode() || !getApiKey()) {
    console.log('[AbacatePay Mock] Creating PIX charge:', request)
    return createMockCharge(request)
  }

  const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AbacatePay error: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function getChargeStatus(chargeId: string): Promise<GetChargeResponse> {
  if (isMockMode() || !getApiKey()) {
    console.log('[AbacatePay Mock] Getting charge status:', chargeId)
    return getMockChargeStatus(chargeId)
  }

  const response = await fetch(`${ABACATEPAY_BASE_URL}/billing/${chargeId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AbacatePay error: ${response.status} - ${error}`)
  }

  return response.json()
}

export function validateWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[AbacatePay] Webhook secret not configured')
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (sigBuffer.length !== expectedBuffer.length) return false
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
}

const mockCharges = new Map<string, CreateChargeResponse>()

function createMockCharge(request: CreateChargeRequest): CreateChargeResponse {
  const chargeId = `mock_charge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  const mockCharge: CreateChargeResponse = {
    id: chargeId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    frequency: request.frequency,
    methods: ['PIX'],
    products: request.products,
    customer: request.customer,
    pix: {
      qrCode: `00020101021226360014br.gov.bcb.pix0136${chargeId}5204000053039865802BR5925MOCK MERCHANT6009SAO_PAULO61080540000162070503***6304`,
      copyPaste: `00020101021226360014br.gov.bcb.pix0136${chargeId}5204000053039865802BR5925MOCK MERCHANT6009SAO_PAULO61080540000162070503***6304`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }

  mockCharges.set(chargeId, mockCharge)
  console.log('[AbacatePay Mock] Created charge:', chargeId)

  setTimeout(() => {
    const charge = mockCharges.get(chargeId)
    if (charge && charge.status === 'PENDING') {
      charge.status = 'WAITING'
      charge.updatedAt = new Date().toISOString()
      console.log('[AbacatePay Mock] Charge waiting:', chargeId)
    }
  }, 2000)

  return mockCharge
}

function getMockChargeStatus(chargeId: string): GetChargeResponse {
  const mock = mockCharges.get(chargeId)

  if (!mock) {
    return {
      id: chargeId,
      status: 'FAILED',
    }
  }

  return {
    id: mock.id,
    status: mock.status,
    paidAt: mock.status === 'CONFIRMED' ? mock.updatedAt : undefined,
    pix: mock.pix,
  }
}

export function simulateMockPaymentConfirmation(chargeId: string): void {
  const charge = mockCharges.get(chargeId)
  if (charge) {
    charge.status = 'CONFIRMED'
    charge.paidAt = new Date().toISOString()
    charge.updatedAt = new Date().toISOString()
    console.log('[AbacatePay Mock] Payment confirmed:', chargeId)
  }
}

export function getMockCharge(chargeId: string): CreateChargeResponse | undefined {
  return mockCharges.get(chargeId)
}
