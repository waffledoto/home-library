import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { del } from '@vercel/blob';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();
    const { title, author, description, cover_image, file_path, status, current_page, total_pages } = body;

    // Проверяем существование книги
    const existing = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Старые значения файлов (для удаления если заменяются)
    const oldBook = existing[0];
    const oldCover = oldBook.cover_image;
    const oldFile = oldBook.file_path;

    // Обновляем книгу
    const updatedBook = await sql`
      UPDATE books SET
        title = COALESCE(${title}, title),
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

    // Удаляем старые файлы из Vercel Blob если они были заменены
    if (cover_image && oldCover && oldCover !== cover_image) {
      try {
        // Извлекаем pathname из URL Vercel Blob
        const oldPathname = extractPathnameFromUrl(oldCover);
        if (oldPathname) await del(oldPathname);
      } catch (e) {
        console.warn('Failed to delete old cover:', e);
      }
    }
    if (file_path && oldFile && oldFile !== file_path) {
      try {
        const oldPathname = extractPathnameFromUrl(oldFile);
        if (oldPathname) await del(oldPathname);
      } catch (e) {
        console.warn('Failed to delete old file:', e);
      }
    }

    return NextResponse.json(updatedBook[0]);
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
    await ensureDbInitialized();
    const sql = getDb();
    const { id } = await params;

    // Получаем книгу для удаления файлов
    const existing = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = existing[0];

    // Удаляем файлы из Vercel Blob
    if (book.cover_image) {
      try {
        const pathname = extractPathnameFromUrl(book.cover_image);
        if (pathname) await del(pathname);
      } catch (e) {
        console.warn('Failed to delete cover file:', e);
      }
    }
    if (book.file_path) {
      try {
        const pathname = extractPathnameFromUrl(book.file_path);
        if (pathname) await del(pathname);
      } catch (e) {
        console.warn('Failed to delete book file:', e);
      }
    }

    // Удаляем запись из БД
    await sql`DELETE FROM books WHERE id = ${id}`;

    return NextResponse.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}

// Вспомогательная функция для извлечения pathname из URL Vercel Blob
function extractPathnameFromUrl(url: string): string | null {
  try {
    // URL Vercel Blob имеет вид: https://<storeId>.public.blob.vercel-storage.com/<pathname>
    const parsed = new URL(url);
    // pathname начинается с /, убираем его
    return parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
  } catch {
    // Если это не URL, возможно это уже pathname
    return url.startsWith('/') ? url.slice(1) : url;
  }
}
