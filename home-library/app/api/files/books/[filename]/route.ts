import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', 'books', filename);

    // Безопасность: проверяем, что путь в пределах uploads/books
    if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads', 'books'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();

    // Определяем Content-Type по расширению
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      epub: 'application/epub+zip',
      fb2: 'application/x-fictionbook+xml',
      mobi: 'application/x-mobipocket-ebook',
      djvu: 'image/vnd.djvu',
      txt: 'text/plain',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
