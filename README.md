# punto-zero

Volunteer scheduling platform for organic waste collection program.

## Stack

- **Frontend:** React 19 + Vite 8 + MUI 6
- **Backend:** Express 5 + Prisma 6 + MySQL 8
- **Infrastructure:** Docker + Nginx + VPS Linux

## Quick Start

```bash
# Install dependencies
npm install              # root (concurrently)
npm install --prefix client
npm install --prefix server

# Start dev (client + server)
npm run dev

# Or with Docker
docker compose up -d
```

## Environment

Copy `.env.example` to `server/.env` and adjust:

```bash
cp .env.example server/.env
```

## Database

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

## Project Structure

```
punto-zero/
├── client/          # React SPA (Vite)
│   ├── src/
│   │   ├── context/     # React contexts
│   │   ├── layouts/     # Volunteer & Admin layouts
│   │   ├── pages/       # Route pages
│   │   └── theme.js     # MUI theme
│   └── vite.config.js
├── server/          # Express API + Prisma
│   ├── config/          # Prisma client, logger
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, validation, errors
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   └── prisma/          # Schema + migrations
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
└── nginx.conf
```
