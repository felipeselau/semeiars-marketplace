# Plano de Integração: AbacatePay + PagSeguro Payout

## Visão Geral

O marketplace opera com pagamento centralizado:
1. Comprador paga via AbacatePay
2. Valor total entra na conta do marketplace
3. Backend calcula comissão e valor de cada vendedor
4. Backend executa PIX automático via PagSeguro Payout API

---

## Taxas e Comissões

| Item | Valor |
|------|-------|
| Taxa AbacatePay | R$ 0,80 por transação |
| Taxa Plataforma | R$ 0,20 por transação |
| Comissão Marketplace | 10% do valor do vendedor |
| **Total Taxa** | **R$ 1,00 por venda** |

### Exemplo de Cálculo

Pedido: R$ 200,00 (2 vendedores)

| Vendedor | Valor Items | Comissão (10%) | Recebe |
|----------|-------------|----------------|--------|
| Vendedor A | R$ 80,00 | R$ 8,00 | R$ 72,00 |
| Vendedor B | R$ 120,00 | R$ 12,00 | R$ 108,00 |
| **Total** | R$ 200,00 | R$ 20,00 | R$ 180,00 |

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        SemeiaRS Backend                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐     │
│  │  Checkout    │   │  Webhook     │   │  Rotina Split    │     │
│  │  AbacatePay  │──▶│  AbacatePay  │──▶│  + Payout        │     │
│  └──────────────┘   └──────────────┘   │  PagSeguro       │     │
│                                        └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │                      │                    │
         ▼                      ▼                    ▼
   ┌───────────┐        ┌───────────┐         ┌───────────┐
   │ Comprador │        │ AbacatePay│         │ PagSeguro │
   │   (PIX)   │        │  (recebe) │         │  (payout) │
   └───────────┘        └───────────┘         └───────────┘
```

---

## Regras de Negócio

### 1. Pagamento do Cliente
- Cliente sempre paga uma única vez, mesmo com produtos de vários vendedores
- Pagamento via PIX da AbacatePay
- Pedido só é válido quando pagamento está **CONFIRMADO**

### 2. Cálculo de Split
Para cada pedido:
- Cada item pertence a um vendedor
- Sistema calcula: `valor_vendedor = soma_itens_vendedor - comissão`

### 3. Regras de Repasse (Payout)
- Payout ocorre se:
  - Pagamento = CONFIRMADO
  - Pedido não cancelado
- Pode ser imediato (T+0) ou após X dias
- Cada vendedor recebe via PIX

### 4. Estornos / Cancelamentos
- Se pedido cancelado antes do payout: valor não é enviado
- Se payout já occurred: marcar como reversão pendente

---

## Fluxo Completo

### Fase 1: Vendedor Configura Recebimento
```
/seller/payment-settings
  → CPF/CNPJ + Chave PIX + Banco
  → Aceita termos
  → Salvar (criptografar PIX)
  → Pronto para vender
```

### Fase 2: Comprador Paga
```
Carrinho → Checkout
  → Identificar vendedores únicos do pedido
  → Criar Payment (status: PENDING)
  → Criar PaymentSplit para cada vendedor
  
  → Chamar AbacatePay billing/create
    {
      amount: 20000 (centavos),
      customer: { name, email, document },
      returnUrl, completionUrl
    }
  
  → Receber: pix.qrCode, pix.copyPaste
  → Redirecionar para /checkout/waiting/[id]
```

### Fase 3: Confirmação (Webhook + Polling)
```
Webhook AbacatePay → /api/webhooks/abacatepay
  → Validar assinatura
  → Atualizar Payment.status = CONFIRMED
  → Disparar rotina de split

OU

Polling (cliente verifica) → /api/payment/[id]/status
  → Se CONFIRMED → mesma rotina
```

### Fase 4: Split e Payout
```
Rotina: processPaymentSplit(paymentId)
  Para cada PaymentSplit:
    → Calcular: grossAmount × 0.90 = netAmount
    → Status: PENDING
    
  → Para cada vendedor (automático):
    → Chamar PagSeguro Payout API
      {
        pixKey: seller.pixKey,
        amount: netAmount,
        referenceId: paymentSplit.id
      }
    → Salvar Payout
    → Atualizar PaymentSplit.payoutStatus
```

### Fase 5: Confirmação Payout
```
Webhook PagSeguro → /api/webhooks/pagseguro
  → Validar assinatura
  → Atualizar Payout.status
  → Enviar notificação
```

---

## Schema do Banco de Dados (Prisma)

### Modelo: SellerPayment
Dados PIX e verificação do vendedor

```prisma
model SellerPayment {
  id              String   @id @default(cuid())
  sellerId       String   @unique
  cpfCnpj        String
  pixKey         String   // criptografar!
  pixKeyType     String   // CPF, CNPJ, EMAIL, TELEFONE
  pixBank        String?
  isVerified     Boolean  @default(false)
  isActive       Boolean  @default(true)
  termsAccepted  Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Modelo: Payment
Pagamento principal

```prisma
model Payment {
  id              String    @id @default(cuid())
  orderId         String    @unique
  buyerId        String
  abacatePayId   String?
  amount         Float
  status         String    // PENDING, WAITING, CONFIRMED, FAILED
  pixCopyPaste   String?
  pixQrCode      String?
  paymentUrl     String?
  paidAt         DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  splits         PaymentSplit[]
}
```

### Modelo: PaymentSplit
Divisão entre vendedores

```prisma
model PaymentSplit {
  id            String    @id @default(cuid())
  paymentId     String
  payment       Payment   @relation(fields: [paymentId], references: [id])
  sellerId      String
  grossAmount  Float     // valor bruto (sem comissão)
  commission   Float     // 10%
  netAmount     Float     // valor líquido para vendedor
  payoutId      String?
  payoutStatus String?   // PENDING, SENT, SUCCESS, FAILED
  paidAt        DateTime?
  createdAt     DateTime  @default(now())
}
```

### Modelo: Payout
Histórico de repasses

```prisma
model Payout {
  id              String    @id @default(cuid())
  sellerId        String
  paymentSplitId  String
  amount         Float
  pagseguroId    String?
  status         String    // PENDING, PROCESSING, SUCCESS, FAILED
  errorMessage    String?
  processedAt     DateTime?
  createdAt      DateTime  @default(now())
}
```

---

## Páginas a Criar/Atualizar

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/seller/payment-settings` | Nova | Cadastro PIX + aceite termos |
| `/seller/payouts` | Nova | Histórico de repasses |
| `/seller/balance` | Nova | Saldo e extrato |
| `/checkout` | Atualizar | Escolher método PIX |
| `/checkout/waiting/[id]` | Nova | Espera pagamento PIX |
| `/api/webhooks/abacatepay` | Nova | Confirmação pagamento |
| `/api/webhooks/pagseguro` | Nova | Confirmação payout |

---

## Server Actions

```typescript
// === CONFIGURAÇÃO ===
setupSellerPayment(sellerId: string, data: SellerPaymentData)
getSellerPayment(sellerId: string)
validatePixKey(key: string, type: string)

// === PAGAMENTO ===
createPixCharge(orderId: string, amount: number, customer: CustomerData)
checkPaymentStatus(paymentId: string)

// === SPLIT & PAYOUT ===
processPaymentSplit(paymentId: string) // automático após confirmação
requestPayout(paymentSplitId: string)
getPayoutHistory(sellerId: string)
getSellerBalance(sellerId: string)

// === ADMIN ===
retryPayout(payoutId: string)
getAllPayouts()
```

---

## APIs Externas

### AbacatePay (Entrada de Dinheiro)

**Criar Cobrança:**
```
POST /billing/create
{
  frequency: "ONE_TIME",
  methods: ["PIX"],
  products: [...],
  customer: { name, email, document },
  returnUrl,
  completionUrl
}
```

**Resposta:**
```
{
  id: "charge_xxx",
  status: "PENDING",
  pix: {
    qrCode: "...",
    copyPaste: "..."
  }
}
```

### PagSeguro Payout API (Saída de Dinheiro)

**Criar Transferência PIX:**
```
POST /payouts
{
  pixKey: "email@pix.com",
  amount: 72.00,
  referenceId: "paymentSplit_xxx"
}
```

---

## Segurança

| Item | Implementação |
|------|---------------|
| Assinatura webhook | Validar `x-abacate-signature` |
| Chave PIX | Criptografar (AES-256) no banco |
| Tokens API | Variáveis de ambiente apenas |
| Rate limiting | Next.js middleware |
| Retry | Exponential backoff para payout |

---

## Fases de Implementação

| Fase | Descrição | Prioridade |
|------|-----------|------------|
| 1 | Schema + Migration | Alta |
| 2 | Configuração PIX vendedor | Alta |
| 3 | Checkout + AbacatePay | Alta |
| 4 | Webhook AbacatePay | Alta |
| 5 | Waiting page + Split | Alta |
| 6 | PagSeguro Payout | Alta |
| 7 | Webhook PagSeguro | Média |
| 8 | Histórico/Extrato | Média |
| 9 | Termos legais | Baixa |

---

## Pré-requisitos

- [ ] Conta AbacatePay criada
- [ ] Conta PagSeguro Business criada
- [ ] Acesso Payout API solicitado
- [ ] Comissão definida (10%)
- [ ] Termos legais redigidos

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Payout falhar | Retry automático |
| Vendedor cadastra PIX errado | Validação + teste PIX |
| Chargeback | Reter payout por X dias |
| Fraude | KYC vendedor |

---

## Resumo

- **AbacatePay**: entrada simples e barata (R$ 0,80)
- **PagSeguro Payout**: saída automática via PIX
- **Split**: feito no backend
- **Usuário paga uma vez**
- **Vendedores recebem automaticamente**
- **Marketplace controla comissão**
