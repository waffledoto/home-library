'use client';

import { useState } from 'react';
import { Book } from '@/app/page';

interface RightSidebarProps {
  books: Book[];
  onUpdateBook: (bookId: string, updates: Partial<Book>) => void;
}

export default function RightSidebar({ books, onUpdateBook }: RightSidebarProps) {
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);

  const readingBooks = books.filter(b => b.status === 'reading');
  const recentBooks = [...books].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5);

  const handleQuickStatusChange = (bookId: string, newStatus: Book['status']) => {
    onUpdateBook(bookId, { status: newStatus });
    setOpenStatusMenu(null);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm('Удалить эту книгу?')) {
      try {
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const statusOptions: { value: Book['status']; label: string; icon: string; color: string; bg: string }[] = [
    { value: 'not_started', label: 'Не начатые', icon: '📚', color: 'text-blue-300', bg: 'bg-blue-900/40 hover:bg-blue-900/60' },
    { value: 'reading', label: 'Читаю', icon: '📖', color: 'text-yellow-300', bg: 'bg-yellow-900/40 hover:bg-yellow-900/60' },
    { value: 'finished', label: 'Прочитанные', icon: '✅', color: 'text-green-300', bg: 'bg-green-900/40 hover:bg-green-900/60' },
  ];

  return (
    <div className="fixed right-0 top-0 bottom-0 w-40 z-[1000] flex flex-col overflow-y-auto" style={{ background: '#1e1410' }}>
      <div className="p-3 space-y-4">
        {/* Текущее чтение */}
        <div>
          <h3 className="text-xs font-semibold text-[#a0937d] uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-days-one)' }}>Читаю сейчас</h3>

          {readingBooks.length === 0 ? (
            <div className="text-center py-4 bg-white/5 rounded-lg">
              <div className="text-2xl mb-1 opacity-30">📖</div>
              <p className="text-xs text-[#a0937d]">Нет книг в процессе</p>
            </div>
          ) : (
            readingBooks.map(book => (
              <div key={book.id} className="bg-white/5 rounded-lg p-2.5 mb-2">
                <div className="text-sm text-[#d4c8ba] mb-1 truncate font-medium">{book.title}</div>
                <div className="text-xs text-[#a0937d] mb-2 truncate">{book.author}</div>
                {book.total_pages > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-[#a0937d] mb-1">
                      <span>Стр. {book.current_page}/{book.total_pages}</span>
                      <span>{Math.round((book.current_page / book.total_pages) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-[#a0937d] transition-all"
                        style={{ width: `${(book.current_page / book.total_pages) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#a0937d]">Страница не указана</div>
                )}
                <button
                  onClick={() => handleQuickStatusChange(book.id, 'finished')}
                  className="mt-2 w-full px-2 py-1.5 rounded text-xs bg-green-900/40 text-green-300 hover:bg-green-900/60 transition-colors cursor-pointer"
                >
                  ✅ Завершить
                </button>
              </div>
            ))
          )}
        </div>

        {/* Все книги */}
        {recentBooks.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-[#a0937d] uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-days-one)' }}>Все книги</h3>
            {recentBooks.map(book => {
              const currentStatus = statusOptions.find(s => s.value === book.status);
              const isOpen = openStatusMenu === book.id;

              return (
                <div key={book.id} className="bg-white/5 rounded-lg p-2 mb-2">
                  <div className="text-sm text-[#d4c8ba] truncate">{book.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    {/* Статус — кликабельный */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenStatusMenu(isOpen ? null : book.id)}
                        className={`text-xs px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                          currentStatus?.bg
                        } ${currentStatus?.color}`}
                      >
                        {currentStatus?.icon} {currentStatus?.label}
                      </button>

                      {/* Выпадающее меню смены статуса */}
                      {isOpen && (
                        <div className="absolute bottom-full left-0 mb-1 bg-[#2a1e18] border border-[#3d2e24] rounded-lg shadow-xl z-50 overflow-hidden">
                          {statusOptions.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => handleQuickStatusChange(book.id, opt.value)}
                              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 transition-colors ${
                                book.status === opt.value
                                  ? 'bg-white/10 text-[#d4c8ba]'
                                  : 'text-[#a0937d] hover:bg-white/5 hover:text-[#d4c8ba]'
                              }`}
                            >
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
