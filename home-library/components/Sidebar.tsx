'use client';

import { useState } from 'react';
import { Book } from '@/app/page';

interface SidebarProps {
  books: Book[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export default function Sidebar({ 
  books, 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'search' | 'progress' | 'settings'>('stats');

  const notStartedBooks = books.filter(b => b.status === 'not_started');
  const readingBooks = books.filter(b => b.status === 'reading');
  const finishedBooks = books.filter(b => b.status === 'finished');
  const totalPagesRead = books.reduce((sum, b) => sum + (b.current_page || 0), 0);

  const tabs = [
    { id: 'stats' as const, icon: '📊', label: 'Статистика' },
    { id: 'search' as const, icon: '🔍', label: 'Поиск' },
    { id: 'progress' as const, icon: '📖', label: 'Прогресс' },
    { id: 'settings' as const, icon: '⚙️', label: 'Настройки' },
  ];

  const tabContent = {
    stats: (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#d4c8ba] mb-3 uppercase tracking-wider">Общая статистика</h3>
        
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-[#a0937d] mb-1">Всего книг</div>
            <div className="text-2xl font-bold text-[#d4c8ba]">{books.length}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-900/30 rounded-lg p-2.5 text-center">
              <div className="text-xs text-green-400 mb-1">✅ Прочитано</div>
              <div className="text-lg font-bold text-green-300">{finishedBooks.length}</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-2.5 text-center">
              <div className="text-xs text-yellow-400 mb-1">📖 Читаю</div>
              <div className="text-lg font-bold text-yellow-300">{readingBooks.length}</div>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-2.5 text-center col-span-2">
              <div className="text-xs text-blue-400 mb-1">📚 Не начато</div>
              <div className="text-lg font-bold text-blue-300">{notStartedBooks.length}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-[#a0937d] mb-1">Страниц прочитано</div>
            <div className="text-xl font-bold text-[#d4c8ba]">{totalPagesRead}</div>
          </div>
        </div>
      </div>
    ),

    search: (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#d4c8ba] mb-3 uppercase tracking-wider">Поиск и фильтры</h3>
        
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по названию или автору..."
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-[#d4c8ba] placeholder-[#a0937d]/50 text-sm focus:outline-none focus:border-[#a0937d]/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-[#a0937d] mb-2 block">Сортировка</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-[#d4c8ba] text-sm focus:outline-none focus:border-[#a0937d]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="newest" className="bg-[#1e1410]">Сначала новые</option>
            <option value="oldest" className="bg-[#1e1410]">Сначала старые</option>
            <option value="title" className="bg-[#1e1410]">По названию</option>
            <option value="author" className="bg-[#1e1410]">По автору</option>
          </select>
        </div>
      </div>
    ),

    progress: (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#d4c8ba] mb-3 uppercase tracking-wider">Текущее чтение</h3>
        
        {readingBooks.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-30">📖</div>
            <p className="text-xs text-[#a0937d]">Нет книг в процессе чтения</p>
          </div>
        ) : (
          readingBooks.slice(0, 3).map(book => (
            <div key={book.id} className="bg-white/5 rounded-lg p-3">
              <div className="text-sm font-medium text-[#d4c8ba] mb-1 truncate">{book.title}</div>
              <div className="text-xs text-[#a0937d] mb-2">{book.author}</div>
              {book.total_pages > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-[#a0937d] mb-1">
                    <span>Стр. {book.current_page}</span>
                    <span>{Math.round((book.current_page / book.total_pages) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-[#a0937d] transition-all"
                      style={{ width: `${(book.current_page / book.total_pages) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    ),

    settings: (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#d4c8ba] mb-3 uppercase tracking-wider">Настройки</h3>
        
        <div>
          <label className="text-xs text-[#a0937d] mb-2 block">Размер шрифта в PDF</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="px-2 py-1 rounded bg-white/10 text-[#d4c8ba] hover:bg-white/20 transition-colors text-sm"
            >
              -
            </button>
            <span className="text-sm text-[#d4c8ba] flex-1 text-center">{fontSize}px</span>
            <button
              onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
              className="px-2 py-1 rounded bg-white/10 text-[#d4c8ba] hover:bg-white/20 transition-colors text-sm"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#a0937d] mb-2 block">Тема оформления</label>
          <div className="space-y-2">
            {['coffee', 'dark', 'light'].map(t => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className={`w-full px-3 py-2 rounded-lg text-xs transition-all ${
                  theme === t 
                    ? 'bg-[#a0937d] text-white' 
                    : 'bg-white/10 text-[#a0937d] hover:bg-white/20'
                }`}
              >
                {t === 'coffee' ? '☕ Кофейная' : t === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="fixed top-0 bottom-0 w-40 z-[5] flex flex-col" style={{ background: '#1e1410' }}>
      {/* Табы навигации */}
      <div className="p-3 border-b border-white/10">
        <div className="grid grid-cols-2 gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2 rounded-lg transition-all text-center ${
                activeTab === tab.id 
                  ? 'bg-white/15 text-[#d4c8ba]' 
                  : 'text-[#a0937d]/60 hover:bg-white/5 hover:text-[#a0937d]'
              }`}
            >
              <div className="text-base mb-0.5">{tab.icon}</div>
              <div className="text-[9px] leading-tight">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Контент таба */}
      <div className="flex-1 overflow-y-auto p-3">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
