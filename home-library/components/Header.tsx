'use client';

import Image from 'next/image';

interface HeaderProps {
  onAddBook: () => void;
}

export default function Header({ onAddBook }: HeaderProps) {
  return (
    <header>
      <div className="mx-[160px]">
        {/* Hero секция с фоновым изображением */}
        <div className="pt-6">
          <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/assets/images/hero.jpg"
              alt="Библиотека"
              fill
              className="object-cover brightness-[0.55] blur-[6px] scale-110"
              priority
            />

            {/* Контент поверх изображения */}
            <div className="absolute inset-0 flex items-center justify-center text-white px-8">
              <div className="flex items-center space-x-6">
                {/* Лого в круге */}
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-2xl">☕</span>
                </div>

                <div className="text-left">
                  <h1 className="text-4xl font-bold mb-2 tracking-tight drop-shadow-lg" style={{ fontFamily: 'var(--font-days-one)' }}>
                    Домашняя Библиотека
                  </h1>
                  <p className="text-base text-white/80 font-light">
                    Ваше персональное пространство для управления книгами
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Навигационная панель */}
        <div className="mt-6" style={{ background: 'linear-gradient(to bottom, #2a1e18, #1a120e)' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <nav className="text-sm">
                <span style={{ color: '#a0937d' }}>Главная</span>
                <span style={{ color: '#5c4d3c' }} className="mx-2">/</span>
                <span style={{ color: '#d4c8ba' }} className="font-medium">Моя библиотека</span>
              </nav>

              <button
                onClick={onAddBook}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                style={{
                  background: 'var(--coffee-500)',
                  color: 'white'
                }}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg leading-none">+</span>
                  <span>Добавить книгу</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
