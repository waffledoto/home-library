import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

/**
 * Получить экземпляр подключения к базе данных
 * Создаётся новое подключение для каждого запроса (для Vercel Serverless)
 */
export const getDb = () => {
  if (!sql) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Database URL not found. Set POSTGRES_URL or DATABASE_URL in environment variables.'
      );
    }

    sql = postgres(connectionString, {
      ssl: {
        rejectUnauthorized: false,
      },
      max: 1,
      idle_timeout: 10,
      max_lifetime: 60,
      connect_timeout: 10,
    });
  }
  return sql;
};

/**
 * Закрыть подключение (для очистки ресурсов)
 */
export const closeDb = async () => {
  if (sql) {
    try {
      await sql.end();
    } catch (e) {
      // Игнорируем ошибки
    }
    sql = null;
  }
};

/**
 * Инициализировать базу данных (создать таблицы)
 */
export const initDb = async (): Promise<void> => {
  const db = getDb();

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
};

export default getDb;
