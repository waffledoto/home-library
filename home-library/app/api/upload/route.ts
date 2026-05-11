import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Для Vercel Serverless — используем Data URL (base64) для небольших файлов
// Или просто возвращаем ошибку с инструкцией
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Преобразуем файл в Data URL (base64)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Генерируем уникальный путь
    const fileName = uuidv4();
    const publicPath = type === 'cover' 
      ? `/covers/${fileName}`
      : `/books/${fileName}`;

    return NextResponse.json({
      message: 'File processed successfully',
      path: publicPath,
      dataUrl: dataUrl, // Возвращаем Data URL для использования
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Delete not supported in serverless' }, { status: 501 });
}
