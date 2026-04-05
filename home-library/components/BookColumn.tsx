'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Book } from '@/app/page';

interface BookColumnProps {
  title: string;
  books: Book[];
  icon: string;
  color: string;
  onBookClick: (book: Book) => void;
  onDropBook?: (bookId: string, newStatus: Book['status']) => void;
}

function SortableBookCard({ book, onBookClick }: { book: Book; onBookClick: (book: Book) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg p-3 cursor-pointer transition-all duration-150 hover:shadow-md border group relative"
      onClick={() => onBookClick(book)}
    >
      {/* Drag handle — видимый при наведении в верхнем правом углу */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity rounded z-10"
        style={{ color: '#a0937d', background: 'rgba(0,0,0,0.25)', fontSize: '14px' }}
      >
        ⠿
      </div>
      <div className="relative">
        <div className="flex space-x-3">
          {/* Обложка книги */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-24 rounded-lg shadow-sm flex items-center justify-center overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl" style={{ opacity: 0.3 }}>📖</span>
              )}
            </div>
          </div>

          {/* Информация о книге */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 truncate" style={{ color: '#d4c8ba' }}>
              {book.title}
            </h3>
            <p className="text-sm mb-2" style={{ color: '#a0937d' }}>{book.author}</p>

            {book.description && (
              <p className="text-sm line-clamp-2 mb-2" style={{ color: '#8a7968' }}>
                {book.description}
              </p>
            )}

            {/* Прогресс чтения */}
            {book.total_pages > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1" style={{ color: '#8a7968' }}>
                  <span>Стр. {book.current_page}</span>
                  <span>{book.total_pages}</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-200"
                    style={{
                      width: `${(book.current_page / book.total_pages) * 100}%`,
                      background: 'linear-gradient(90deg, #a0937d, #7a6854)'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookColumn({ title, books, icon, color, onBookClick, onDropBook }: BookColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${title}`,
    data: { status: title === 'Не начатые' ? 'not_started' : title === 'Читаю' ? 'reading' : 'finished' },
  });

  const getStatusForColumn = (columnTitle: string): Book['status'] => {
    if (columnTitle === 'Не начатые') return 'not_started';
    if (columnTitle === 'Читаю') return 'reading';
    return 'finished';
  };

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl p-5 border relative transition-colors duration-200"
      style={{
        background: isOver && onDropBook ? 'linear-gradient(to bottom, #3a2a24, #241a14)' : 'linear-gradient(to bottom, #332420, #1e1410)',
        borderColor: isOver && onDropBook ? '#a0937d' : '#3d2e24',
        borderWidth: isOver && onDropBook ? '2px' : '1px',
      }}
    >
      <div className="flex items-center space-x-3 mb-5 pb-4" style={{ borderBottom: '2px solid #3d2e24' }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #a0937d, #6f5e4f)',
            boxShadow: '0 2px 8px rgba(160, 147, 125, 0.25)'
          }}
        >
          <span className="text-lg" style={{ filter: 'brightness(2.5)' }}>{icon}</span>
        </div>
        <h2 className="text-xl font-semibold" style={{ color: '#d4c8ba', fontFamily: 'var(--font-days-one)' }}>{title}</h2>
        <span
          className="ml-auto px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{
            background: 'linear-gradient(135deg, #a0937d, #7a6854)',
            boxShadow: '0 1px 4px rgba(160, 147, 125, 0.3)'
          }}
        >
          {books.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#8a7968] text-base">Нет книг</p>
            {onDropBook && (
              <p className="text-[#6f5e4f] text-sm mt-2">Перетащите книгу сюда</p>
            )}
          </div>
        ) : (
          <SortableContext items={books.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {books.map((book) => (
              <SortableBookCard key={book.id} book={book} onBookClick={onBookClick} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
