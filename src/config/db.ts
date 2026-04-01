// src/config/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase external connections
  },
  max: 10,                     // Safe to bump up with Supabase connection pooling
  idleTimeoutMillis: 30000,    // Release idle connections after 30s
  connectionTimeoutMillis: 10000, // 10s — pooler connections can be slow to establish
});

pool.on('error', (err) => {
  // Prevent idle client drops from crashing the Node process
  console.error('Unexpected error on idle database client', err);
});

export default pool;
