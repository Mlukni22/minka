/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

// Increase timeout for database operations
jest.setTimeout(30000);


