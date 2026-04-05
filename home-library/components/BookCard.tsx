'use client';

import { Book } from '@/app/page';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div
      onClick={() => onClick(book)}
      className="rounded-lg p-3 cursor-pointer transition-all duration-150 hover:shadow-md border border-stone-200 hover:border-stone-300 bg-white"
    >
      <div className="flex space-x-3">
        {/* Обложка книги */}
        <div className="flex-shrink-0">
          <div 
            className="w-14 h-20 rounded shadow-sm flex items-center justify-center overflow-hidden bg-stone-200"
          >
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-stone-400">📖</span>
            )}
          </div>
        </div>

        {/* Информация о книге */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-800 text-sm mb-0.5 truncate">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 mb-1.5">{book.author}</p>
          
          {book.description && (
            <p className="text-xs text-stone-400 line-clamp-2 mb-1.5">
              {book.description}
            </p>
          )}

          {/* Прогресс чтения */}
          {book.total_pages > 0 && (
            <div className="mt-1.5">
              <div className="flex justify-between text-xs text-stone-400 mb-0.5">
                <span>Стр. {book.current_page}</span>
                <span>{book.total_pages}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-200 bg-stone-400"
                  style={{ 
                    width: `${(book.current_page / book.total_pages) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
