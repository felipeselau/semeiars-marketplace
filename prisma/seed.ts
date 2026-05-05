import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed...')

  // Limpar dados existentes (ordem respeitando foreign keys)
  console.log('Limpando dados existentes...')
  await prisma.payout.deleteMany()
  await prisma.paymentSplit.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.sellerOrder.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.sellerPayment.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  console.log('Dados limpos.')

  // Criar categorias agrícolas
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Grãos e Cereais' },
      update: {},
      create: { name: 'Grãos e Cereais' },
    }),
    prisma.category.upsert({
      where: { name: 'Hortifruti' },
      update: {},
      create: { name: 'Hortifruti' },
    }),
    prisma.category.upsert({
      where: { name: 'Laticínios' },
      update: {},
      create: { name: 'Laticínios' },
    }),
    prisma.category.upsert({
      where: { name: 'Carnes e Ovos' },
      update: {},
      create: { name: 'Carnes e Ovos' },
    }),
    prisma.category.upsert({
      where: { name: 'Mudas e Sementes' },
      update: {},
      create: { name: 'Mudas e Sementes' },
    }),
    prisma.category.upsert({
      where: { name: 'Equipamentos' },
      update: {},
      create: { name: 'Equipamentos' },
    }),
  ])

  console.log('Categorias criadas:', categories.length)

  // Criar vendedores (agricultores do RS)
  const hashedPassword = await hash('senha123', 12)

  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'joao.silva@email.com' },
      update: {},
      create: {
        name: 'João Carlos Silva',
        email: 'joao.silva@email.com',
        password: hashedPassword,
        phone: '(51) 99999-0001',
        address: 'Rua das Flores, 100 - Pelotas, RS',
        role: 'SELLER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.santos@email.com' },
      update: {},
      create: {
        name: 'Maria Helena Santos',
        email: 'maria.santos@email.com',
        password: hashedPassword,
        phone: '(54) 99999-0002',
        address: 'Av. Principal, 500 - Caxias do Sul, RS',
        role: 'SELLER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'pedro.oliveira@email.com' },
      update: {},
      create: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        password: hashedPassword,
        phone: '(53) 99999-0003',
        address: 'Estrada do Campo, 200 - Bagé, RS',
        role: 'SELLER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana.ferreira@email.com' },
      update: {},
      create: {
        name: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
        password: hashedPassword,
        phone: '(51) 99999-0004',
        address: 'Rua dos Pássaros, 50 - Canela, RS',
        role: 'SELLER',
      },
    }),
  ])

  console.log('Vendedores criados:', sellers.length)

  // Criar produtos agrícolas
  const products = await Promise.all([
    // Produtos do João (Pelotas) - Grãos
    prisma.product.create({
      data: {
        name: 'Arroz Integral Orgânico',
        description:
          'Arroz integral cultivado de forma sustentável na região de Pelotas. Rico em fibras e nutrientes.',
        basePrice: 8.5,
        currentPrice: 7.9,
        quantity: 500,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        sellerId: sellers[0].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Feijão Preto Tipo 1',
        description: 'Feijão preto de alta qualidade, plantado e colhido na região Sul.',
        basePrice: 12.0,
        currentPrice: 10.5,
        quantity: 300,
        imageUrl: 'https://images.unsplash.com/photo-1515543904323-de27c9fad2d7?w=400',
        sellerId: sellers[0].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Trigo Branco',
        description: 'Trigo branco de excelente qualidade para moinho.',
        basePrice: 2.8,
        currentPrice: 2.5,
        quantity: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        sellerId: sellers[0].id,
        categoryId: categories[0].id,
      },
    }),

    // Produtos da Maria (Caxias do Sul) - Hortifruti
    prisma.product.create({
      data: {
        name: 'Maçã Fuji Orgânica',
        description: 'Maçãs Fuji frescas, cultivadas sem agrotóxicos na Serra Gaúcha.',
        basePrice: 15.0,
        currentPrice: 13.9,
        quantity: 200,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        sellerId: sellers[1].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Uva Niagara',
        description: 'Uvas Niagara frescas, direto da vineyard na Serra do RS.',
        basePrice: 18.0,
        currentPrice: 16.5,
        quantity: 150,
        imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400',
        sellerId: sellers[1].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Alface Americana',
        description: 'Alface americana crocante, cultivada em estufa.',
        basePrice: 4.5,
        currentPrice: 3.9,
        quantity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
        sellerId: sellers[1].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Tomate Cereja',
        description: 'Tomate cereja doce e suculento.',
        basePrice: 8.0,
        currentPrice: 7.2,
        quantity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1546470427-227c7b3f8fc2?w=400',
        sellerId: sellers[1].id,
        categoryId: categories[1].id,
      },
    }),

    // Produtos do Pedro (Bagé) - Laticínios e Carnes
    prisma.product.create({
      data: {
        name: 'Queijo Artesanal Colonial',
        description: 'Queijo colonial feito com leite fresco de nossas próprias vacas.',
        basePrice: 45.0,
        currentPrice: 42.0,
        quantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        sellerId: sellers[2].id,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Leite Fresco Natural',
        description: 'Leite fresco pasteurizado, sem conservantes.',
        basePrice: 6.5,
        currentPrice: 5.9,
        quantity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
        sellerId: sellers[2].id,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ovos de Galinha Caipira',
        description: 'Ovos de galinhas criadas soltas, alimentação natural.',
        basePrice: 12.0,
        currentPrice: 10.9,
        quantity: 200,
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
        sellerId: sellers[2].id,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mel Silvestre Puro',
        description: 'Mel puro de abelhas silvestres da Campanha Gaúcha.',
        basePrice: 35.0,
        currentPrice: 32.0,
        quantity: 40,
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        sellerId: sellers[2].id,
        categoryId: categories[1].id,
      },
    }),

    // Produtos da Ana (Canela) - Mudas e Sementes
    prisma.product.create({
      data: {
        name: 'Muda de Videira',
        description: 'Mudas de videira para uva, variedade Niágara e Isabel.',
        basePrice: 15.0,
        currentPrice: 12.9,
        quantity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        sellerId: sellers[3].id,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Semente de Grama Bermuda',
        description: 'Sementes de grama Bermuda para pastagem.',
        basePrice: 25.0,
        currentPrice: 22.5,
        quantity: 60,
        imageUrl: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400',
        sellerId: sellers[3].id,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Muda de Macieira',
        description: 'Mudas de macieira variedade Fuji e Gala.',
        basePrice: 45.0,
        currentPrice: 40.0,
        quantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1567306295427-94503f8300d7?w=400',
        sellerId: sellers[3].id,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Semente de Soja',
        description: 'Sementes de soja transgênica variedade bm310.',
        basePrice: 180.0,
        currentPrice: 165.0,
        quantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400',
        sellerId: sellers[3].id,
        categoryId: categories[4].id,
      },
    }),
  ])

  console.log('Produtos criados:', products.length)

  // Criar comprador de teste
  const buyer = await prisma.user.upsert({
    where: { email: 'comprador@email.com' },
    update: {},
    create: {
      name: 'Comprador Teste',
      email: 'comprador@email.com',
      password: hashedPassword,
      phone: '(51) 99999-9999',
      address: 'Av. Borges de Medeiros, 1000 - Porto Alegre, RS',
      role: 'BUYER',
    },
  })

  // Criar carrinho para o comprador
  await prisma.cart.upsert({
    where: { userId: buyer.id },
    update: {},
    create: { userId: buyer.id },
  })

  console.log('Comprador de teste criado:', buyer.email)

  // Criar configurações de pagamento PIX para vendedores
  const pixSettings = await Promise.all([
    prisma.sellerPayment.upsert({
      where: { sellerId: sellers[0].id },
      update: {},
      create: {
        sellerId: sellers[0].id,
        cpfCnpj: '12345678901',
        pixKey: 'encrypted:joao.silva@email.com',
        pixKeyType: 'EMAIL',
        pixBank: 'Banrisul',
        isActive: true,
        isVerified: false,
        termsAccepted: true,
      },
    }),
    prisma.sellerPayment.upsert({
      where: { sellerId: sellers[1].id },
      update: {},
      create: {
        sellerId: sellers[1].id,
        cpfCnpj: '98765432100',
        pixKey: 'encrypted:maria.santos@email.com',
        pixKeyType: 'EMAIL',
        pixBank: 'Sicredi',
        isActive: true,
        isVerified: false,
        termsAccepted: true,
      },
    }),
    prisma.sellerPayment.upsert({
      where: { sellerId: sellers[2].id },
      update: {},
      create: {
        sellerId: sellers[2].id,
        cpfCnpj: '45678912300',
        pixKey: 'encrypted:pedro.oliveira@email.com',
        pixKeyType: 'EMAIL',
        pixBank: 'Bradesco',
        isActive: true,
        isVerified: false,
        termsAccepted: true,
      },
    }),
    prisma.sellerPayment.upsert({
      where: { sellerId: sellers[3].id },
      update: {},
      create: {
        sellerId: sellers[3].id,
        cpfCnpj: '78912345600',
        pixKey: 'encrypted:ana.ferreira@email.com',
        pixKeyType: 'EMAIL',
        pixBank: 'Itaú',
        isActive: true,
        isVerified: false,
        termsAccepted: true,
      },
    }),
  ])

  console.log('Configurações PIX criadas:', pixSettings.length)

  // Criar pedidos de exemplo com pagamentos
  const allProducts = await prisma.product.findMany()

  // Pedido 1: Completed com pagamento confirmado
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      totalAmount: 89.5,
      status: 'COMPLETED',
      items: {
        create: [
          {
            productId: allProducts[0].id,
            quantity: 5,
            price: allProducts[0].currentPrice,
          },
          {
            productId: allProducts[6].id,
            quantity: 3,
            price: allProducts[6].currentPrice,
          },
        ],
      },
    },
  })

  // SellerOrder para pedido 1
  await prisma.sellerOrder.createMany({
    data: [
      { orderId: order1.id, sellerId: sellers[0].id, status: 'COMPLETED' },
      { orderId: order1.id, sellerId: sellers[2].id, status: 'COMPLETED' },
    ],
    skipDuplicates: true,
  })

  // Payment para pedido 1 (confirmado)
  const payment1 = await prisma.payment.create({
    data: {
      orderId: order1.id,
      buyerId: buyer.id,
      amount: 89.5,
      status: 'CONFIRMED',
      abacatePayId: 'charge_example_001',
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  // PaymentSplits para pedido 1
  await prisma.paymentSplit.createMany({
    data: [
      {
        paymentId: payment1.id,
        sellerId: sellers[0].id,
        grossAmount: 39.5,
        commission: 3.95,
        netAmount: 35.55,
        payoutStatus: 'SUCCESS',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        paymentId: payment1.id,
        sellerId: sellers[2].id,
        grossAmount: 50.0,
        commission: 5.0,
        netAmount: 45.0,
        payoutStatus: 'SUCCESS',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // Payouts para pedido 1
  const payouts1 = await prisma.payout.createMany({
    data: [
      {
        sellerId: sellers[0].id,
        paymentSplitId: (await prisma.paymentSplit.findFirst({
          where: { paymentId: payment1.id, sellerId: sellers[0].id },
        }))!.id,
        amount: 35.55,
        pagseguroId: 'payout_001',
        status: 'SUCCESS',
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        sellerId: sellers[2].id,
        paymentSplitId: (await prisma.paymentSplit.findFirst({
          where: { paymentId: payment1.id, sellerId: sellers[2].id },
        }))!.id,
        amount: 45.0,
        pagseguroId: 'payout_002',
        status: 'SUCCESS',
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // Pedido 2: Em andamento (confirmado, preparando)
  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      totalAmount: 62.8,
      status: 'PREPARING',
      items: {
        create: [
          {
            productId: allProducts[3].id,
            quantity: 2,
            price: allProducts[3].currentPrice,
          },
          {
            productId: allProducts[4].id,
            quantity: 2,
            price: allProducts[4].currentPrice,
          },
        ],
      },
    },
  })

  await prisma.sellerOrder.createMany({
    data: [{ orderId: order2.id, sellerId: sellers[1].id, status: 'PREPARING' }],
    skipDuplicates: true,
  })

  const payment2 = await prisma.payment.create({
    data: {
      orderId: order2.id,
      buyerId: buyer.id,
      amount: 62.8,
      status: 'CONFIRMED',
      abacatePayId: 'charge_example_002',
      paidAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  })

  await prisma.paymentSplit.create({
    data: {
      paymentId: payment2.id,
      sellerId: sellers[1].id,
      grossAmount: 62.8,
      commission: 6.28,
      netAmount: 56.52,
      payoutStatus: 'PENDING',
    },
  })

  // Pedido 3: Pago, aguardando preparo
  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      totalAmount: 42.0,
      status: 'CONFIRMED',
      items: {
        create: [
          {
            productId: allProducts[7].id,
            quantity: 1,
            price: allProducts[7].currentPrice,
          },
        ],
      },
    },
  })

  await prisma.sellerOrder.createMany({
    data: [{ orderId: order3.id, sellerId: sellers[2].id, status: 'CONFIRMED' }],
    skipDuplicates: true,
  })

  const payment3 = await prisma.payment.create({
    data: {
      orderId: order3.id,
      buyerId: buyer.id,
      amount: 42.0,
      status: 'CONFIRMED',
      abacatePayId: 'charge_example_003',
      paidAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  })

  await prisma.paymentSplit.create({
    data: {
      paymentId: payment3.id,
      sellerId: sellers[2].id,
      grossAmount: 42.0,
      commission: 4.2,
      netAmount: 37.8,
      payoutStatus: 'PENDING',
    },
  })

  console.log('Pedidos de exemplo criados: 3')
  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
