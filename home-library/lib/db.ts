import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Получить экземпляр подключения к базе данных (Singleton)
 */
export const getDb = () => {
  if (!sql) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Database URL not found. Set POSTGRES_URL or DATABASE_URL in your environment variables.'
      );
    }

    // Neon PostgreSQL требует SSL-соединение
    const isServerless = !!process.env.VERCEL;
    sql = postgres(connectionString, {
      ssl: {
        rejectUnauthorized: false, // Для Neon
      },
      max: isServerless ? 1 : 10,
      idle_timeout: isServerless ? 5 : 20,
      max_lifetime: isServerless ? 60 : 600,
      connect_timeout: 30,
    });

    console.log('✅ PostgreSQL connection established');
  }
  return sql;
};

/**
 * Сбросить подключение (для переподключения при ошибке)
 */
export const resetDb = async () => {
  if (sql) {
    try {
      await sql.end();
    } catch (e) {
      // Игнорируем ошибки при закрытии
    }
    sql = null;
    initPromise = null;
  }
};

/**
 * Инициализировать базу данных (создать таблицы)
 */
export const initDb = async (): Promise<void> => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = getDb();

      // Таблица книг
      await db`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          description TEXT,
          cover_image TEXT,
          file_path TEXT,
          file_name TEXT,
          file_size INTEGER DEFAULT 0,
          status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'reading', 'finished')),
          current_page INTEGER DEFAULT 0,
          total_pages INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      console.log('✅ Database tables initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
};

export default getDb;
