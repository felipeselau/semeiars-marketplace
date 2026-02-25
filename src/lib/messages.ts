export const messages = {
  brand: {
    name: 'SemeiaRS',
    slogan: 'Conectando quem planta a quem consome',
    tagline: 'O marketplace dos produtores locais do Rio Grande do Sul'
  },

  hero: {
    title: 'Valorize quem produz. Consuma local.',
    subtitle: 'Compre direto de pequenos produtores do Rio Grande do Sul, sem intermediários.',
    description: 'No SemeiaRS você encontra alimentos frescos, artesanais e de origem confiável.',
    cta_primary: 'Explorar produtos',
    cta_secondary: 'Quero vender no SemeiaRS'
  },

  about: {
    title: 'O que é o SemeiaRS?',
    text: 'O SemeiaRS é uma plataforma que conecta produtores locais a consumidores que valorizam qualidade, sustentabilidade e economia regional.',
    mission: 'Nossa missão é fortalecer a agricultura familiar e aproximar o campo da cidade.',
    vision: 'Ser referência em comércio local digital no Rio Grande do Sul.'
  },

  benefits: {
    consumer: [
      'Produtos frescos e artesanais',
      'Compra direta do produtor',
      'Apoio à economia local',
      'Origem transparente'
    ],
    producer: [
      'Venda sem intermediários',
      'Mais visibilidade',
      'Gestão simples de pedidos',
      'Contato direto com clientes'
    ]
  },

  cta: {
    buy: 'Comprar agora',
    sell: 'Começar a vender',
    register: 'Criar minha conta',
    login: 'Entrar',
    see_more: 'Ver mais',
    learn_more: 'Saiba mais'
  },

  product: {
    list_title: 'Produtos disponíveis',
    price_label: 'Preço',
    unit_label: 'Unidade',
    producer_label: 'Produtor',
    location_label: 'Local de produção',
    add_to_cart: 'Adicionar ao carrinho',
    out_of_stock: 'Produto indisponível',
    details: 'Detalhes do produto',
    description: 'Descrição',
    category: 'Categoria'
  },

  cart: {
    title: 'Meu carrinho',
    empty: 'Seu carrinho está vazio.',
    continue_shopping: 'Continuar comprando',
    checkout: 'Finalizar compra',
    remove: 'Remover',
    total: 'Total',
    subtotal: 'Subtotal'
  },

  checkout: {
    title: 'Finalizar pedido',
    delivery: 'Entrega',
    payment: 'Pagamento',
    confirm: 'Confirmar pedido',
    success: 'Pedido realizado com sucesso!',
    error: 'Não foi possível finalizar seu pedido. Tente novamente.'
  },

  auth: {
    login_title: 'Entrar no SemeiaRS',
    register_title: 'Criar conta',
    email: 'E-mail',
    password: 'Senha',
    confirm_password: 'Confirmar senha',
    forgot_password: 'Esqueci minha senha',
    logout: 'Sair'
  },

  profile: {
    title: 'Meu perfil',
    my_orders: 'Meus pedidos',
    my_products: 'Meus produtos',
    edit_profile: 'Editar perfil',
    become_seller: 'Quero ser vendedor',
    seller_dashboard: 'Painel do produtor'
  },

  seller: {
    title: 'Perfil do produtor',
    description: 'Conheça quem está por trás deste produto',
    products: 'Produtos deste produtor',
    contact: 'Entrar em contato',
    rating: 'Avaliação'
  },

  empty_states: {
    no_products: 'Nenhum produto encontrado.',
    no_orders: 'Você ainda não fez nenhum pedido.',
    no_sales: 'Você ainda não realizou nenhuma venda.'
  },

  messages: {
    success_generic: 'Operação realizada com sucesso.',
    error_generic: 'Algo deu errado. Tente novamente.',
    loading: 'Carregando...',
    saving: 'Salvando informações...'
  },

  trust: {
    title: 'Por que confiar no SemeiaRS?',
    items: [
      'Produtores verificados',
      'Compra segura',
      'Transparência na origem',
      'Impacto social positivo'
    ]
  },

  impact: {
    title: 'Impacto que gera valor',
    text: 'Cada compra no SemeiaRS fortalece a agricultura familiar e a economia local.'
  },

  faq: [
    {
      question: 'Quem pode vender no SemeiaRS?',
      answer: 'Pequenos produtores e agricultores familiares do Rio Grande do Sul.'
    },
    {
      question: 'Como funciona a entrega?',
      answer: 'A entrega é combinada diretamente entre produtor e comprador.'
    },
    {
      question: 'Preciso pagar para me cadastrar?',
      answer: 'Não, o cadastro é gratuito.'
    }
  ],

  footer: {
    about: 'Sobre o SemeiaRS',
    contact: 'Contato',
    privacy: 'Política de privacidade',
    terms: 'Termos de uso',
    rights: 'Todos os direitos reservados.'
  }
}

type MessageKey = keyof typeof messages

export function t(key: string): string {
  const keys = key.split('.')
  let result: unknown = messages
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  
  return typeof result === 'string' ? result : key
}

export function getMessage(key: string): string {
  return t(key)
}
