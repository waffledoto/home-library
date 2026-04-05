import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rows } = await sql`SELECT * FROM books WHERE id = ${id}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
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
    const { id } = await params;
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status, current_page, total_pages } = body;

    const { rows: existingBook } = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (existingBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const { rows } = await sql`
      UPDATE books
      SET title = COALESCE(${title}, title),
          author = COALESCE(${author}, author),
          description = COALESCE(${description}, description),
          cover_image = COALESCE(${cover_image}, cover_image),
          file_path = COALESCE(${file_path}, file_path),
          status = COALESCE(${status}, status),
          current_page = COALESCE(${current_page}, current_page),
          total_pages = COALESCE(${total_pages}, total_pages),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(rows[0]);
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
    const { id } = await params;
    const { rowCount } = await sql`DELETE FROM books WHERE id = ${id}`;

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
