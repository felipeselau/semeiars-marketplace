# 🌾 SemeiaRS - Marketplace C2C para Agricultura Familiar

<p align="center">
  <a href="https://semeiars.com">
    <img src="https://img.shields.io/badge/Versão-0.1.0-blue?style=for-the-badge">
  </a>
  <a href="https://github.com/felipeselau/semeiars-marketplace/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge">
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Framework-Next.js 16-black?style=for-the-badge">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/Linguagem-TypeScript-blue?style=for-the-badge">
  </a>
</p>

## 📖 Sobre o Projeto

O **SemeiaRS** é uma plataforma de marketplace C2C (Consumer-to-Consumer) desenvolvida em Next.js, projetada inicialmente como um MVP genérico de e-commerce e que evoluirá para atender especificamente agricultores familiares do Rio Grande do Sul, Brasil.

### ✨ Funcionalidades Atuais

- ✅ **Autenticação Completa**: Registro, login, logout com NextAuth.js
- ✅ **Catálogo de Produtos**: Listagem, busca, filtros por categoria
- ✅ **Gerenciamento de Produtos**: CRUD completo para vendedores
- ✅ **Carrinho de Compras**: Persistente no banco de dados
- ✅ **Gestão de Pedidos**: Para compradores e vendedores
- ✅ **Sistema de Status**: Timeline completa de pedidos (7 status)
- ✅ **Design System**: Interface responsiva com Tailwind CSS
- ✅ **Localização**: Interface completa em Português Brasileiro
- ⏳ **Upload de Imagens**: Em desenvolvimento
- 📋 **Pagamentos**: Planejado (AbacatePay + PagSeguro)

---

## 🛠️ Tecnologias

### Stack Principal

| Tecnologia | Descrição |
|------------|------------|
| **Next.js 16** | Framework React fullstack com App Router |
| **TypeScript** | Tipagem estática para confiabilidade |
| **Prisma** | ORM para PostgreSQL |
| **NextAuth.js** | Sistema de autenticação |
| **Tailwind CSS** | Framework de estilização |
| **Zod** | Validação de dados |

### Banco de Dados

- **PostgreSQL**
- **Prisma ORM** para modelagem e acesso

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou cloud)
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/felipeselau/semeiars-marketplace.git
cd semeiars-marketplace
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Gere o Prisma Client
npx prisma generate

# Rode as migrações
npx prisma migrate dev

# (Opcional) Seed com dados de teste
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse**
```
http://localhost:3000
```

### Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/semeiars"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📱 Cuentas de Teste

Após rodar o seed, você terá acesso a:

### Vendedores
| Email | Senha | Cidade |
|-------|-------|---------|
| joao.silva@email.com | senha123 | Pelotas |
| maria.santos@email.com | senha123 | Caxias do Sul |
| pedro.oliveira@email.com | senha123 | Bagé |
| ana.ferreira@email.com | senha123 | Canela |

### Comprador
| Email | Senha |
|-------|-------|
| comprador@email.com | senha123 |

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── seller/       # Seller API
│   ├── cart/             # Carrinho
│   ├── login/            # Login
│   ├── orders/           # Pedidos (comprador)
│   ├── products/         # Catálogo de produtos
│   ├── profile/          # Perfil do usuário
│   ├── register/        # Registro
│   └── seller/           # Área do vendedor
│       └── orders/       # Pedidos recebidos
├── actions/              # Server Actions
├── components/           # Componentes React
├── lib/                  # Utilitários
│   ├── auth.ts          # Configuração NextAuth
│   ├── messages.ts      # Mensagens localized
│   └── prisma.ts       # Cliente Prisma
└── types/               # Definições TypeScript
```

---

## 🗺️ Roadmap

### v0.1.0 - MVP (Atual)
- [x] Autenticação
- [x] Catálogo de produtos
- [x] Carrinho de compras
- [x] Gestão de pedidos
- [x] Design system
- [x] Localização pt-BR
- [ ] Upload de imagens

### v1.0 - Agricultura Familiar
- [ ] Integração de pagamentos (AbacatePay + PagSeguro)
- [ ] Sistema de split entre vendedores
- [ ] Validação de agricultores
- [ ] Dashboard para produtores
- [ ] Relatórios de vendas

### v2.0 - Expansão
- [ ] Sistema de avaliações
- [ ] Chat entre comprador/vendedor
- [ ] Sistema de mensagens
- [ ] Nota fiscal

---

## 📄 Documentação Adicional

- [Project Overview](./project-overview.md) - Visão geral do projeto
- [Checkout Integration Plan](./checkout-integration-plan.md) - Plano de integração de pagamentos
- [Design System](./design-system.md) - Sistema de design

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Felipe Selau**
- GitHub: [@felipeselau](https://github.com/felipeselau)

---

<p align="center">
  Desenvolvido com ❤️ para a agricultura familiar do Rio Grande do Sul
</p>
