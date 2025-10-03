# DOMAINFORGE

## Project Overview

DomainForge is a platform for creating landing pages for Doma-tokenized domains with integrated on-chain negotiation via real-time chat and a marketplace. The project works on Doma testnet for now. The chat is implemented using RLS enabled PostgreSQL database instead of using XMTP. 

The app is live at [Domain Forge](https://domainforge-eub1.vercel.app/)

To use this app you'll need to be on the Doma testnet. You'll also need some ETH and
WETH (if you plan to make any offers).

## Doma Protocol Integration

DomainForge now features enhanced integration with Doma Protocol including:
- Comprehensive Subgraph API queries with rich domain data
- Pagination support for large datasets
- In-memory caching for improved performance
- Real-time event streaming via Poll API
- Orderbook API integration for marketplace operations

## Real-time Chat Features

DomainForge now includes enhanced real-time chat functionality:
- Offer integration with Doma's Orderbook API
- Real-time offer status tracking using Poll API
- Persistent conversations with database storage
- Message history across sessions
- Chat-based offer creation and acceptance - Buyers can make offers directly through the chat interface, and sellers can accept/reject them with on-chain transaction execution

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Set up your database URL in the `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/domainforge
   ```

### Database Setup

1. Install Prisma CLI globally (if not already installed):
   ```bash
   npm install -g prisma
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

### Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.