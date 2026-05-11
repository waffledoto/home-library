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
    const { title, author, description, cover_image, file_path, file_name, file_size, status, current_page, total_pages } = body;

    // Обновляем книгу
    const updatedBook = await sql`
      UPDATE books SET
        title = COALESCE(${title}, title),
        author = COALESCE(${author}, author),
        description = COALESCE(${description}, description),
        cover_image = COALESCE(${cover_image}, cover_image),
        file_path = COALESCE(${file_path}, file_path),
        file_name = COALESCE(${file_name}, file_name),
        file_size = COALESCE(${file_size}, file_size),
        status = COALESCE(${status}, status),
        current_page = COALESCE(${current_page}, current_page),
        total_pages = COALESCE(${total_pages}, total_pages),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBook[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
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
