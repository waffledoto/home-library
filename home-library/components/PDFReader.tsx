'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { Book } from '@/app/page';

interface PDFReaderProps {
  book: Book;
  allBooks: Book[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function PDFReader({ book, allBooks, onClose, onUpdate }: PDFReaderProps) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(book.current_page || 1);
  const [totalPages, setTotalPages] = useState(book.total_pages || 0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Sidebar states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Если у книги есть файл (Data URL или путь), используем его
    if (book.file_path && !book.file_path.startsWith('upload:')) {
      setPdfFile(book.file_path);
    }
    // Иначе оставляем null — пользователь загрузит файл вручную
  }, [book]);

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    // Сохраняем только метаданные файла в БД
    try {
      await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: file.name,
          file_size: file.size,
          status: book.status === 'not_started' ? 'reading' : book.status
        }),
      });

      // Устанавливаем PDF файл как временный URL (работает до перезагрузки)
      const dataUrl = URL.createObjectURL(file);
      setPdfFile(dataUrl);

      // Получаем количество страниц
      const loadingTask = (window as any).pdfjsLib?.getDocument(dataUrl);
      if (loadingTask) {
        loadingTask.promise.then((pdf: any) => {
          setTotalPages(pdf.numPages);
          // Сохраняем количество страниц в БД
          fetch(`/api/books/${book.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              total_pages: pdf.numPages
            }),
          });
        });
      }

      // Обновляем список книг
      onUpdate();
    } catch (error) {
      console.error('Error saving PDF metadata:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleStatusChange = async (newStatus: 'not_started' | 'reading' | 'finished') => {
    try {
      await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          current_page: currentPage,
          total_pages: totalPages
        }),
      });
      onUpdate();
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveProgress = async () => {
    try {
      // Если статус "not_started", меняем на "reading"
      const newStatus = book.status === 'not_started' ? 'reading' : book.status;
      
      await fetch(`/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          current_page: currentPage,
          total_pages: totalPages
        }),
      });
      onUpdate();
      alert('Прогресс сохранён!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Ошибка сохранения');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Не начата';
      case 'reading': return 'Читаю';
      case 'finished': return 'Прочитана';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xl flex items-center justify-center z-50">
      {/* Боковые панели в режиме чтения */}
      <LeftSidebar 
        books={allBooks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <RightSidebar 
        books={allBooks}
        onUpdateBook={async (bookId, updates) => {
          await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          onUpdate();
        }}
      />
      
      <div className="bg-white w-full h-full flex flex-col mx-40">
        {/* Header с hero-изображением */}
        <div className="relative px-5 py-5 flex items-center justify-between border-b border-stone-200 overflow-hidden min-h-[120px]">
          {/* Фоновое изображение */}
          <div className="absolute inset-0">
            <Image
              src="/assets/images/hero.jpg"
              alt=""
              fill
              className="object-cover brightness-[0.45] blur-[4px] scale-110"
              priority
            />
            {/* Тёплый оверлей */}
            <div className="absolute inset-0 bg-stone-900/30" />
          </div>

          {/* Контент поверх фона */}
          <div className="relative z-10 flex-1">
            <h2 className="text-lg font-medium text-white drop-shadow-md">{book.title}</h2>
            <p className="text-xs text-white/75 drop-shadow">{book.author}</p>
          </div>

          <div className="relative z-10 flex items-center space-x-2">
            {/* Статус книги */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-3 py-1.5 rounded text-sm text-white font-medium transition-all hover:bg-white/20 backdrop-blur-sm"
                style={{ background: 'rgba(255, 255, 255, 0.12)' }}
              >
                {getStatusLabel(book.status)}
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-stone-200">
                  <button
                    onClick={() => handleStatusChange('not_started')}
                    className="w-full px-3 py-2.5 text-left hover:bg-stone-50 transition-colors text-stone-700 text-sm"
                  >
                    📚 Не начата
                  </button>
                  <button
                    onClick={() => handleStatusChange('reading')}
                    className="w-full px-3 py-2.5 text-left hover:bg-stone-50 transition-colors text-stone-700 text-sm"
                  >
                    📖 Читаю
                  </button>
                  <button
                    onClick={() => handleStatusChange('finished')}
                    className="w-full px-3 py-2.5 text-left hover:bg-stone-50 transition-colors text-stone-700 text-sm"
                  >
                    ✅ Прочитана
                  </button>
                </div>
              )}
            </div>

            {/* Сохранить прогресс */}
            <button
              onClick={handleSaveProgress}
              className="px-3 py-1.5 rounded text-sm text-white font-medium hover:bg-white/20 transition-all backdrop-blur-sm"
              style={{ background: 'rgba(255, 255, 255, 0.12)' }}
            >
              Сохранить
            </button>

            {/* Загрузить локальный файл */}
            <label className="px-3 py-1.5 rounded text-sm text-white font-medium hover:bg-white/20 transition-all backdrop-blur-sm cursor-pointer" style={{ background: 'rgba(255, 255, 255, 0.12)' }}>
              Открыть PDF
              <input
                type="file"
                accept=".pdf"
                onChange={handleLocalFileUpload}
                className="hidden"
              />
            </label>

            {/* Закрыть */}
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white text-2xl hover:scale-110 transition-all px-2 drop-shadow"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-stone-100 overflow-auto">
          {pdfFile ? (
            <iframe
              src={pdfFile}
              className="w-full h-full border-0"
              title={book.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="text-6xl mb-4 text-stone-300">📖</div>
                <h3 className="text-xl font-medium text-stone-600 mb-2">
                  Файл книги не найден
                </h3>
                <p className="text-stone-400 mb-6 text-sm">
                  Вы можете загрузить PDF файл для чтения
                </p>
                <label className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'var(--coffee-600)' }}>
                  Выбрать PDF файл
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleLocalFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-5 py-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200 bg-white"
        >
          <div>
            <span className="font-medium">Страница:</span> {currentPage} / {totalPages || '—'}
          </div>
          <div>
            <span className="font-medium">Статус:</span> {getStatusLabel(book.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
