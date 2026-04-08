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
      process.env.DATABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_DB_URL;

    if (!connectionString) {
      throw new Error(
        'Database URL not found. Set POSTGRES_URL, DATABASE_URL, or NEXT_PUBLIC_SUPABASE_DB_URL in your environment variables.'
      );
    }

    // Supabase и другие облачные провайдеры требуют SSL
    const isDev = process.env.NODE_ENV === 'development';

    sql = postgres(connectionString, {
      ssl: isDev ? 'prefer' : 'require',
      max: 10,
      idle_timeout: 20,
    });

    console.log('✅ Database connection established');
  }
  return sql;
};

/**
 * Инициализировать базу данных (создать таблицы)
 * Вызывается автоматически при первом запросе
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
      initPromise = null; // Сбросить при ошибке для повторной попытки
      throw error;
    }
  })();

  return initPromise;
};

export default getDb;
