import { getDb, initDb } from './lib/db.js';

async function testConnection() {
  try {
    console.log('🔄 Проверка подключения к базе данных...');
    
    // Проверяем переменные окружения
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_DB_URL;
    
    if (!url) {
      console.error('❌ Ошибка: Переменные окружения не найдены!');
      console.error('Создайте файл .env.local и добавьте:');
      console.error('POSTGRES_URL=postgresql://postgres.xxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres');
      process.exit(1);
    }

    console.log('✅ Переменная окружения найдена');
    
    // Подключение
    const db = getDb();
    console.log('✅ Подключение к БД успешно');

    // Проверка соединения простым запросом
    const result = await db`SELECT NOW() as current_time`;
    console.log('✅ Запрос выполнен, текущее время БД:', result[0].current_time);

    // Инициализация таблиц
    await initDb();
    console.log('✅ Таблицы созданы/проверены');

    console.log('\n🎉 Всё работает! База данных подключена.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка подключения:', error.message);
    console.error('\nПроверьте:');
    console.error('1. Файл .env.local существует');
    console.error('2. Строка подключения правильная (из Supabase Dashboard)');
    console.error('3. Проект Supabase активен (не приостановлен)');
    process.exit(1);
  }
}

testConnection();
