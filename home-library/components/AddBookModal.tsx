'use client';

import { useState } from 'react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export default function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let coverImageUrl = null;
      let bookFileUrl = null;

      // Обрабатываем обложку если есть
      if (coverImage) {
        const formData = new FormData();
        formData.append('file', coverImage);
        formData.append('type', 'cover');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        // Для обложек используем Data URL
        coverImageUrl = data.dataUrl || data.path;
      }

      // Для PDF файлов на Vercel — только метаданные (файлы не сохраняются)
      // Пользователь загрузит PDF при чтении
      if (bookFile) {
        bookFileUrl = `upload:${bookFile.name}:${bookFile.size}`;
      }

      // Создаём книгу
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          description,
          cover_image: coverImageUrl,
          file_path: bookFileUrl,
          status: 'not_started'
        }),
      });

      if (response.ok) {
        setTitle('');
        setAuthor('');
        setDescription('');
        setCoverImage(null);
        setBookFile(null);
        onBookAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
            <h2 className="text-2xl font-semibold text-stone-800">Добавить книгу</h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-3xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Название книги *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all"
                placeholder="Введите название книги"
              />
            </div>

            {/* Автор */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Автор *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all"
                placeholder="Введите автора"
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all resize-none"
                placeholder="Краткое описание книги"
              />
            </div>

            {/* Обложка */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Обложка книги
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:bg-stone-100 file:text-stone-600 file:text-sm file:font-medium hover:file:bg-stone-200 transition-colors"
              />
            </div>

            {/* Файл книги */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Файл книги (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:bg-stone-100 file:text-stone-600 file:text-sm file:font-medium hover:file:bg-stone-200 transition-colors"
              />
            </div>

            {/* Кнопки */}
            <div className="flex space-x-3 pt-3 border-t border-stone-100">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-2.5 rounded-lg font-medium transition-all duration-150 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'var(--coffee-700)',
                  color: 'white'
                }}
              >
                {uploading ? 'Загрузка...' : 'Добавить книгу'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg font-medium transition-all duration-150 hover:bg-stone-100 text-stone-600"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
