import postgres from 'postgres';

let sql: ReturnType<typeof postgres>;
let isInitialized = false;

export const getDb = () => {
  if (!sql) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
    }

    sql = postgres(connectionString, {
      ssl: 'require', // Required for Neon and most cloud PostgreSQL providers
    });
  }
  return sql;
};

export const initDb = async () => {
  if (isInitialized) return;
  
  try {
    const db = getDb();
    await db`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        file_path TEXT,
        status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'reading', 'finished')),
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Database initialized');
    isInitialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export default getDb;
