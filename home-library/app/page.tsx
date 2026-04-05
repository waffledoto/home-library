'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import BookColumn from '@/components/BookColumn';
import AddBookModal from '@/components/AddBookModal';
import PDFReader from '@/components/PDFReader';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image: string | null;
  file_path: string | null;
  status: 'not_started' | 'reading' | 'finished';
  current_page: number;
  total_pages: number;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Left sidebar states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    
    // Fallback: force loading to false after 5 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleAddBook = () => {
    setIsModalOpen(true);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const closePDFReader = () => {
    setSelectedBook(null);
  };

  const filterAndSortBooks = (books: Book[]) => {
    let filtered = books;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query)
      );
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return sorted;
  };

  const sortedBooks = filterAndSortBooks(books);
  const notStartedBooks = sortedBooks.filter(b => b.status === 'not_started');
  const readingBooks = sortedBooks.filter(b => b.status === 'reading');
  const finishedBooks = sortedBooks.filter(b => b.status === 'finished');

  const handleUpdateBook = async (bookId: string, updates: Partial<Book>) => {
    await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchBooks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const bookId = active.id as string;
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const dropZoneId = over.id as string;

    // Определяем статус по зоне drop
    let newStatus: Book['status'];
    if (dropZoneId === 'column-Не начатые') {
      newStatus = 'not_started';
    } else if (dropZoneId === 'column-Читаю') {
      newStatus = 'reading';
    } else if (dropZoneId === 'column-Прочитанные') {
      newStatus = 'finished';
    } else {
      return; // Drop не в колонку
    }

    if (book.status === newStatus) return; // Тот же статус

    await handleUpdateBook(bookId, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--coffee-50)]">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">☕</div>
          <p className="text-stone-500 text-sm">Загрузка библиотеки...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Фоновое изображение */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/back.jpg"
          alt=""
          fill
          className="object-cover brightness-[0.35] blur-[8px] scale-110"
          priority
        />
        {/* Затемняющий оверлей */}
        <div className="absolute inset-0 bg-stone-900/50 pointer-events-none" />
      </div>

      {/* Левая боковая панель - Статистика и Поиск */}
      <LeftSidebar 
        books={books}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Правая боковая панель - Прогресс */}
      <RightSidebar 
        books={books}
        onUpdateBook={async (bookId, updates) => {
          await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          await fetchBooks();
        }}
      />

      {/* Контент поверх фона */}
      <div className="relative">
        <Header onAddBook={handleAddBook} />

        <DndContext onDragEnd={handleDragEnd}>
          <main className="px-48 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <BookColumn
              title="Не начатые"
              books={notStartedBooks}
              icon="📚"
              color="#a0937d"
              onBookClick={handleBookClick}
              onDropBook={(bookId, newStatus) => handleUpdateBook(bookId, { status: newStatus })}
            />
            <BookColumn
              title="Читаю"
              books={readingBooks}
              icon="📖"
              color="#8a7968"
              onBookClick={handleBookClick}
              onDropBook={(bookId, newStatus) => handleUpdateBook(bookId, { status: newStatus })}
            />
            <BookColumn
              title="Прочитанные"
              books={finishedBooks}
              icon="✅"
              color="#6f5e4f"
              onBookClick={handleBookClick}
              onDropBook={(bookId, newStatus) => handleUpdateBook(bookId, { status: newStatus })}
            />
          </div>
        </main>
        </DndContext>

      <AddBookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookAdded={fetchBooks}
      />

      {selectedBook && (
        <PDFReader
          book={selectedBook}
          allBooks={books}
          onClose={closePDFReader}
          onUpdate={fetchBooks}
        />
      )}
      </div>
    </div>
  );
}
