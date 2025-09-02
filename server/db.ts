import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;

// Configure postgres with better error handling and connection pooling
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idle_timeout: 30,
  connect_timeout: 60,
  max_lifetime: 60 * 30,
  connection: {
    application_name: 'guardportal_app',
  },
  onnotice: (notice) => {
    console.log('Database notice:', notice.message);
  },
  onparameter: (key, value) => {
    console.log('Database parameter:', key, value);
  }
});

// The postgres client handles errors internally
// No need for manual error handlers with the postgres package

export const db = drizzle(client, { schema });