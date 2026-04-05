import { initDb } from '@/lib/db';

// Инициализация БД при запуске сервера
if (process.env.NODE_ENV !== 'production') {
  initDb().catch(console.error);
}

export { initDb };
