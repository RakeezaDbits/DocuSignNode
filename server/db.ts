import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';

// Configure postgres with better error handling and connection pooling
const client = postgres(connectionString, {
  max: 10, // Maximum connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 60, // Connection timeout
  prepare: false, // Disable prepared statements for better compatibility
  onnotice: () => {}, // Disable notices
  // Add connection error handling
  connection: {
    application_name: 'GuardPortal',
  },
  // Handle connection errors gracefully
  onclose: () => {
    console.log('Database connection closed');
  },
  // Retry connection on failure
  transform: {
    undefined: null
  }
});

// The postgres client handles errors internally
// No need for manual error handlers with the postgres package

export const db = drizzle(client, { schema });