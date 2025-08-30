import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for Replit environment
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false // Disable SSL for Replit environment
});
export const db = drizzle({ client: pool, schema });

