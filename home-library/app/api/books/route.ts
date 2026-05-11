import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Инициализируем БД при старте
initDb().catch((err) => {
  console.error('Initial DB init failed:', err);
});

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const books = await sql`SELECT * FROM books ORDER BY created_at DESC`;
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { title, author, description, cover_image, file_path, file_name, file_size, status } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const newBook = await sql`
      INSERT INTO books (
        id, title, author, description, cover_image,
        file_path, file_name, file_size, status
      )
      VALUES (${id}, ${title}, ${author}, ${description || null},
              ${cover_image || null}, ${file_path || null},
              ${file_name || null}, ${file_size || 0}, ${status || 'not_started'})
      RETURNING *
    `;

    return NextResponse.json(newBook[0], { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
