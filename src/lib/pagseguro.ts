import crypto from 'crypto'

const PAGSEGURO_BASE_URL = process.env.PAGSEGURO_ENV === 'production'
  ? 'https://ws.pagseguro.uol.com.br/v2'
  : 'https://ws.sandbox.pagseguro.uol.com.br/v2'

interface PayoutRequest {
  pixKey: string
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE'
  amount: number
  referenceId: string
  description?: string
}

interface PayoutResponse {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  referenceId: string
  amount: number
  createdAt: string
  processedAt?: string
  errorMessage?: string
}

function getCredentials(): { email: string; token: string } {
  return {
    email: process.env.PAGSEGURO_EMAIL || '',
    token: process.env.PAGSEGURO_TOKEN || '',
  }
}

function isMockMode(): boolean {
  return process.env.MOCK_PAYMENTS === 'true'
}

export async function createPayout(request: PayoutRequest): Promise<PayoutResponse> {
  if (isMockMode() || !getCredentials().token) {
    console.log('[PagSeguro Mock] Creating payout:', request)
    return createMockPayout(request)
  }

  const { email, token } = getCredentials()
  const params = new URLSearchParams({
    email,
    token,
    pixKey: request.pixKey,
    pixKeyType: request.pixKeyType,
    amount: request.amount.toFixed(2),
    referenceId: request.referenceId,
  })

  if (request.description) {
    params.append('description', request.description)
  }

  const response = await fetch(`${PAGSEGURO_BASE_URL}/payouts?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PagSeguro error: ${response.status} - ${error}`)
  }

  return response.json()
}

export async function getPayoutStatus(payoutId: string): Promise<PayoutResponse> {
  if (isMockMode() || !getCredentials().token) {
    console.log('[PagSeguro Mock] Getting payout status:', payoutId)
    return getMockPayoutStatus(payoutId)
  }

  const { email, token } = getCredentials()
  const params = new URLSearchParams({
    email,
    token,
  })

  const response = await fetch(`${PAGSEGURO_BASE_URL}/payouts/${payoutId}?${params}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PagSeguro error: ${response.status} - ${error}`)
  }

  return response.json()
}

export function validateWebhookSignature(payload: string, signature: string): boolean {
  const token = process.env.PAGSEGURO_WEBHOOK_SECRET
  if (!token) {
    console.warn('[PagSeguro] Webhook token not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', token)
    .update(payload)
    .digest('hex')

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (sigBuffer.length !== expectedBuffer.length) return false
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
}

const mockPayouts = new Map<string, PayoutResponse>()

function createMockPayout(request: PayoutRequest): PayoutResponse {
  const payoutId = `mock_payout_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  
  const mockPayout: PayoutResponse = {
    id: payoutId,
    status: 'PENDING',
    referenceId: request.referenceId,
    amount: request.amount,
    createdAt: new Date().toISOString(),
  }

  mockPayouts.set(payoutId, mockPayout)
  console.log('[PagSeguro Mock] Created payout:', payoutId)

  setTimeout(() => {
    const payout = mockPayouts.get(payoutId)
    if (payout && payout.status === 'PENDING') {
      payout.status = 'PROCESSING'
      console.log('[PagSeguro Mock] Payout processing:', payoutId)
    }
  }, 1500)

  setTimeout(() => {
    const payout = mockPayouts.get(payoutId)
    if (payout && payout.status === 'PROCESSING') {
      payout.status = 'SUCCESS'
      payout.processedAt = new Date().toISOString()
      console.log('[PagSeguro Mock] Payout success:', payoutId)
    }
  }, 3000)

  return mockPayout
}

function getMockPayoutStatus(payoutId: string): PayoutResponse {
  return mockPayouts.get(payoutId) || {
    id: payoutId,
    status: 'FAILED',
    referenceId: '',
    amount: 0,
    createdAt: new Date().toISOString(),
    errorMessage: 'Payout not found',
  }
}

export function simulateMockPayoutSuccess(payoutId: string): void {
  const payout = mockPayouts.get(payoutId)
  if (payout) {
    payout.status = 'SUCCESS'
    payout.processedAt = new Date().toISOString()
    console.log('[PagSeguro Mock] Payout confirmed:', payoutId)
  }
}

export function getMockPayout(payoutId: string): PayoutResponse | undefined {
  return mockPayouts.get(payoutId)
}
