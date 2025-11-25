# SR Module Setup Guide

Quick setup guide for getting the Spaced Repetition module up and running.

## Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (for development) or PostgreSQL (for production)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `express` - API server
- `@prisma/client` - Database client
- `prisma` - Database toolkit
- `jest`, `supertest` - Testing framework

### 2. Configure Database

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

For PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sr_module?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run sr:db:generate
```

This reads `src/sr-module/prisma/schema.prisma` and generates the Prisma Client.

### 4. Create Database Tables

```bash
npm run sr:db:push
```

This creates the database file and all tables (Cards and Reviews).

**Alternative (with migrations):**
```bash
npm run sr:db:migrate
```

### 5. (Optional) Seed Sample Data

```bash
npm run sr:db:seed
```

### 6. Start the API Server

```bash
npm run sr:dev
```

The API will be available at `http://localhost:3001`

### 7. Test the Setup

In another terminal, run:

```bash
npm run sr:test
```

## Quick Test

Test the API is working:

```bash
# Health check
curl http://localhost:3001/health

# Create a card
curl -X POST http://localhost:3001/cards \
  -H "Content-Type: application/json" \
  -d '{"front": "Test", "back": "Test", "userId": "test-123"}'

# Get due cards
curl "http://localhost:3001/cards/due?userId=test-123"
```

## Troubleshooting

### Prisma Client Not Found

If you see "Cannot find module '@prisma/client'", run:

```bash
npm run sr:db:generate
```

### Database Connection Error

1. Check your `.env` file has `DATABASE_URL` set
2. For SQLite, ensure the directory is writable
3. For PostgreSQL, verify connection credentials

### Port Already in Use

Change the port in `.env`:

```env
PORT=3002
```

Or stop the process using port 3001.

## Next Steps

- Read the [README.md](./README.md) for detailed documentation
- Check [example-sequences.md](./tests/example-sequences.md) for algorithm examples
- Explore the test files to see usage examples


