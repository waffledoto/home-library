import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        file_path TEXT,
        status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'reading', 'finished')),
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    dbInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    const sql = getDb();
    const books = await sql`SELECT * FROM books ORDER BY created_at DESC`;
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const sql = getDb();
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const newBook = await sql`
      INSERT INTO books (id, title, author, description, cover_image, file_path, status)
      VALUES (${id}, ${title}, ${author}, ${description || null}, ${cover_image || null}, ${file_path || null}, ${status || 'not_started'})
      RETURNING *
    `;

    return NextResponse.json(newBook[0], { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
