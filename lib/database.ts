import { Pool, QueryResult, QueryResultRow, types } from 'pg';

// Custom parsing for PostgreSQL types
types.setTypeParser(1082, (value) => value);
types.setTypeParser(types.builtins.DATE, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMP, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => value);

// Database connection setup using environment variables
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ connectionString });

// Helper function to execute queries
async function executeQuery<T extends QueryResultRow>(
  query: string,
  params?: (string | number | boolean)[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    const result = await client.query<T>({ text: query, values: params });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  } finally {
    client.release();
  }
}

// Query functions (select, insert, update, delete) using the helper function

export async function SelectQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean)[]
): Promise<T[]> {
  const result = await executeQuery<T>(text, params);
  return result.rows;
}

export async function InsertQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}

export async function UpdateQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}

export async function DeleteQuery<T extends QueryResultRow>(
  text: string,
  params?: (string | number | boolean)[]
): Promise<QueryResult<T>> {
  return executeQuery<T>(text, params);
}
export async function getClient() {
  const client = await pool.connect();
  return client;
}
