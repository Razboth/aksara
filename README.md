# AKSARA - Aplikasi Kontrol & Sistem Anggaran Realisasi

Aplikasi web untuk mengelola anggaran, pembayaran tagihan vendor, dan monitoring arus kas Divisi Teknologi Informasi Bank SulutGo.

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite, Zod, ExcelJS, PDFKit
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query, Recharts

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Charcoal | `#504746` | Primary dark, sidebar |
| Taupe | `#B89685` | Secondary, neutral |
| Sand | `#BFADA3` | Backgrounds, borders |
| Blush | `#FBB7C0` | Highlights, accents |
| Rose | `#B6244F` | Primary accent, CTAs |

## Quick Start

```bash
# Install all dependencies (root, server, client)
npm run install:all

# Initialize database with seed data
npm run db:init

# Start development (both server and client)
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
aksara/
├── server/                 # Backend (Express.js API)
│   ├── src/
│   │   ├── db/            # Database schema & seed data
│   │   ├── routes/        # API route handlers
│   │   └── index.js       # Entry point
│   └── anggaran.db        # SQLite database
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Layout components
│   │   ├── pages/         # Route pages
│   │   └── utils/         # Formatting utilities
│   └── index.html
├── package.json           # Root scripts (runs both)
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for root, server, and client |
| `npm run dev` | Start both server and client in development mode |
| `npm run server` | Start only the backend server |
| `npm run client` | Start only the frontend client |
| `npm run db:init` | Initialize database with schema and seed data |
| `npm run build` | Build frontend for production |
| `npm run start` | Start server in production mode |

## Features

- **Dashboard**: Summary cards, charts (pie, bar), budget progress
- **Transactions**: CRUD, filtering, search, bulk actions, exports
- **Budgets**: Annual budget per vendor, visual comparison
- **Vendors/Services**: Master data management
- **Notifications**: Due soon and overdue alerts
- **Exports**: CSV, Excel, PDF

## Seed Data

Pre-loaded with Bank SulutGo data:
- 9 vendors (Collega, Artajasa, Lintasarta, etc.)
- 33 services
- 63 transactions (2025)
- Total budget: Rp 27.5 Billion

## Indonesian Localization

- All UI in Bahasa Indonesia
- Currency: `Rp 1.234.567.890`
- Date: `DD MMM YYYY`
