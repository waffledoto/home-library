import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status, current_page, total_pages } = body;

    const existingBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE books 
      SET title = COALESCE(?, title),
          author = COALESCE(?, author),
          description = COALESCE(?, description),
          cover_image = COALESCE(?, cover_image),
          file_path = COALESCE(?, file_path),
          status = COALESCE(?, status),
          current_page = COALESCE(?, current_page),
          total_pages = COALESCE(?, total_pages),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || null,
      author || null,
      description || null,
      cover_image || null,
      file_path || null,
      status || null,
      current_page !== undefined ? current_page : null,
      total_pages !== undefined ? total_pages : null,
      id
    );

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
