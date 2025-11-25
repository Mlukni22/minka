/**
 * Server entry point for SR module API
 * Run with: npx tsx src/sr-module/server.ts
 * Or: npm run dev:sr (if configured in package.json)
 */

import app from './api/app';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 SR Module API server running on http://${HOST}:${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   POST /cards`);
  console.log(`   GET  /cards`);
  console.log(`   GET  /cards/due`);
  console.log(`   GET  /cards/:id`);
  console.log(`   POST /cards/:id/review`);
  console.log(`   POST /cards/:id/reset-leech`);
  console.log(`   GET  /cards/:id/reviews`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;


