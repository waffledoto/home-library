import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const db = getDb();
    const books = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO books (id, title, author, description, cover_image, file_path, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, author, description || null, cover_image || null, file_path || null, status || 'not_started');

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
