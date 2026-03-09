// src/config/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB
  },
  max: 5,                      // Respect Neon free-tier connection limits
  idleTimeoutMillis: 30000,    // Release idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if connection takes > 2s
});

pool.on('error', (err) => {
  // Prevent idle client drops from crashing the Node process
  console.error('Unexpected error on idle database client', err);
});

export default pool;
