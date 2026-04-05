import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'cover' or 'book'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Определяем префикс папки в зависимости от типа файла
    const prefix = fileType === 'cover' ? 'covers' : 'books';
    const ext = file.name.split('.').pop();
    const filename = `${prefix}/${uuidv4()}.${ext}`;

    // Загружаем файл в Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Возвращаем публичный URL
    return NextResponse.json({ url: blob.url, filename: blob.pathname });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
