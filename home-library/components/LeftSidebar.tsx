'use client';

import { useState } from 'react';
import { Book } from '@/app/page';

interface LeftSidebarProps {
  books: Book[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function LeftSidebar({ 
  books, 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'search'>('stats');

  const totalBooks = books.length;
  const finishedBooks = books.filter(b => b.status === 'finished').length;
  const readingBooks = books.filter(b => b.status === 'reading').length;
  const notStartedBooks = books.filter(b => b.status === 'not_started').length;
  const totalPagesRead = books.reduce((sum, b) => sum + (b.current_page || 0), 0);

  const filteredBooks = searchQuery 
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'author': return a.author.localeCompare(b.author);
      case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="fixed top-0 bottom-0 left-0 w-40 z-[1000] flex flex-col overflow-y-auto" style={{ background: '#1e1410' }}>
      {/* Табы */}
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`p-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'stats' 
                ? 'bg-white/15 text-[#d4c8ba]' 
                : 'text-[#a0937d]/60 hover:bg-white/5 hover:text-[#a0937d]'
            }`}
          >
            <div className="text-base mb-0.5">📊</div>
            <div className="text-[9px] leading-tight">Статистика</div>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`p-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'search' 
                ? 'bg-white/15 text-[#d4c8ba]' 
                : 'text-[#a0937d]/60 hover:bg-white/5 hover:text-[#a0937d]'
            }`}
          >
            <div className="text-base mb-0.5">🔍</div>
            <div className="text-[9px] leading-tight">Поиск</div>
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 p-3 space-y-3">
        {activeTab === 'stats' && (
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-[#a0937d] mb-1">Всего книг</div>
              <div className="text-2xl font-bold text-[#d4c8ba]">{totalBooks}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-900/30 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-green-400 mb-1">✅ Прочитано</div>
                <div className="text-lg font-bold text-green-300">{finishedBooks}</div>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-yellow-400 mb-1">📖 Читаю</div>
                <div className="text-lg font-bold text-yellow-300">{readingBooks}</div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-blue-400 mb-1">📚 Не начато</div>
              <div className="text-lg font-bold text-blue-300">{notStartedBooks}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-[#a0937d] mb-1">Страниц прочитано</div>
              <div className="text-xl font-bold text-[#d4c8ba]">{totalPagesRead}</div>
            </div>

            {totalBooks > 0 && finishedBooks > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-[#a0937d] mb-2">Процент прочитанного</div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                  <div 
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${(finishedBooks / totalBooks) * 100}%` }}
                  />
                </div>
                <div className="text-center text-sm text-[#d4c8ba] font-medium">
                  {Math.round((finishedBooks / totalBooks) * 100)}%
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Название или автор..."
                className="w-full px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[#d4c8ba] placeholder-[#a0937d]/50 text-xs focus:outline-none focus:border-[#a0937d]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#a0937d] mb-1.5 block">Сортировка</label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[#d4c8ba] text-xs focus:outline-none focus:border-[#a0937d]/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="newest" className="bg-[#1e1410]">Новые сначала</option>
                <option value="oldest" className="bg-[#1e1410]">Старые сначала</option>
                <option value="title" className="bg-[#1e1410]">По названию</option>
                <option value="author" className="bg-[#1e1410]">По автору</option>
              </select>
            </div>

            {searchQuery && (
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-[10px] text-[#a0937d]">
                  Найдено: <span className="text-[#d4c8ba] font-medium">{filteredBooks.length}</span>
                </div>
              </div>
            )}

            {/* Результаты поиска */}
            {searchQuery && sortedBooks.length > 0 && (
              <div className="space-y-2 mt-2">
                {sortedBooks.slice(0, 5).map(book => (
                  <div key={book.id} className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-[#d4c8ba] truncate font-medium">{book.title}</div>
                    <div className="text-[10px] text-[#a0937d] truncate">{book.author}</div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && sortedBooks.length === 0 && (
              <div className="text-center py-4">
                <div className="text-2xl mb-1 opacity-30">🔍</div>
                <p className="text-[10px] text-[#a0937d]">Ничего не найдено</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
