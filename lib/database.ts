import { Pool, QueryResult, QueryResultRow, types } from 'pg';

// ✅ Custom parsers (prevent unwanted Date conversions)
types.setTypeParser(1082, (value) => value); // DATE
types.setTypeParser(types.builtins.DATE, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMP, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => value);

// ✅ Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not defined in environment variables');
}

// ✅ Create a global pooled connection (for hot reloads in Next.js)
let globalPool: Pool;

if (!(global as any).pgPool) {
  globalPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // adjust for your Neon plan
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false, // Neon requires SSL
    },
  });
  (global as any).pgPool = globalPool;
} else {
  globalPool = (global as any).pgPool;
}

export const pool = globalPool;

/**
 * 🔹 Generic query executor with built-in error handling
 */
async function executeQuery<T extends QueryResultRow>(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    const result = await client.query<T>({ text: query, values: params });
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw new Error('Database query failed');
  } finally {
    client.release();
  }
}

/**
 * 🔹 SELECT Query
 */
export async function SelectQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const result = await executeQuery<T>(text, params);
  return result.rows;
}

/**
 * 🔹 INSERT Query
 */
export async function InsertQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}

/**
 * 🔹 UPDATE Query
 */
export async function UpdateQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}

/**
 * 🔹 DELETE Query
 */
export async function DeleteQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}

/**
 * 🔹 Direct client access (for transactions)
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}
