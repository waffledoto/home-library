import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM books ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const { rows } = await sql`
      INSERT INTO books (id, title, author, description, cover_image, file_path, status)
      VALUES (${id}, ${title}, ${author}, ${description || null}, ${cover_image || null}, ${file_path || null}, ${status || 'not_started'})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
