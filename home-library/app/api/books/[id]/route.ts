import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

// Инициализируем БД при старте
initDb().catch((err) => {
  console.error('Initial DB init failed:', err);
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();
    
    // Для больших данных (Data URL) ограничиваем длину
    let { title, author, description, cover_image, file_path, file_name, file_size, status, current_page, total_pages } = body;
    
    // Если file_path слишком большой (Data URL), обрезаем до первых 2000 символов для метаданных
    if (file_path && file_path.length > 2000) {
      file_path = file_path.substring(0, 2000) + '...[truncated]';
    }

    // Проверяем существование книги
    const existing = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Обновляем книгу
    const updatedBook = await sql`
      UPDATE books SET
        title = COALESCE(${title || null}, title),
        author = COALESCE(${author || null}, author),
        description = COALESCE(${description || null}, description),
        cover_image = COALESCE(${cover_image || null}, cover_image),
        file_path = COALESCE(${file_path || null}, file_path),
        file_name = COALESCE(${file_name || null}, file_name),
        file_size = COALESCE(${file_size || null}, file_size),
        status = COALESCE(${status || null}, status),
        current_page = COALESCE(${current_page || null}, current_page),
        total_pages = COALESCE(${total_pages || null}, total_pages),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(updatedBook[0]);
  } catch (error: any) {
    console.error('Error updating book:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: 'Failed to update book', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    // Получаем книгу
    const existing = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Удаляем запись из БД
    await sql`DELETE FROM books WHERE id = ${id}`;

    return NextResponse.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
