import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool with production-ready settings
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'emr_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'emr_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
export const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds for idle connections before being released back to the pool
  const setReleaseTimeout = () => {
    client.releaseTimeout = setTimeout(() => {
      console.error('Client released without being properly used');
      release();
    }, 5000);
  };
  
  client.query = (...args) => {
    clearTimeout(client.releaseTimeout);
    return originalQuery(...args);
  };
  
  client.release = () => {
    clearTimeout(client.releaseTimeout);
    return release();
  };
  
  setReleaseTimeout();
  
  return client;
};

// Health check function
export const checkDatabaseConnection = async () => {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
};

export default pool;
