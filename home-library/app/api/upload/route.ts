import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Директория для хранения файлов
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB для книг

// Гарантируем существование директории
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Безопасное имя файла
function sanitizeFileName(name: string): string {
  const timestamp = Date.now();
  const ext = name.split('.').pop() || '';
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_')
    .substring(0, 50);
  return `${timestamp}_${baseName}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cover' или 'book'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['cover', 'book'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "cover" or "book"' },
        { status: 400 }
      );
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Для обложек — только изображения
    if (type === 'cover') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Cover must be an image (JPEG, PNG, WebP, GIF)' },
          { status: 400 }
        );
      }
    }

    const fileName = sanitizeFileName(file.name);
    const subDir = type === 'cover' ? 'covers' : 'books';
    const uploadPath = join(UPLOAD_DIR, subDir);

    // Создаём поддиректорию
    await mkdir(uploadPath, { recursive: true });

    const filePath = join(uploadPath, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Возвращаем путь относительно public
    const publicPath = `/uploads/${subDir}/${fileName}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      path: publicPath,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Удаление файла
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Безопасность: проверяем, что путь в пределах uploads
    const fullPath = join(process.cwd(), 'public', filePath);
    if (!fullPath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    return NextResponse.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
