import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export const getDb = () => {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'data', 'library.db');

  // Создаём директорию data если её нет
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  try {
    db = new Database(dbPath);
    
    // Включаем внешние ключи
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Инициализация таблиц
    db.exec(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized');
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default getDb;

