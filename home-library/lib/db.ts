import { sql } from '@vercel/postgres';

let isInitialized = false;

export const getDb = () => {
  return sql;
};

export const initDb = async () => {
  if (isInitialized) return;
  
  try {
    await sql`
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
