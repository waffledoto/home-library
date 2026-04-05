import type { Metadata } from "next";
import { Days_One, Neucha } from "next/font/google";
import "./globals.css";

const daysOne = Days_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-days-one",
});

const neucha = Neucha({
  weight: "400",
  subsets: ["cyrillic", "latin"],
  variable: "--font-neucha",
});

export const metadata: Metadata = {
  title: "Домашняя Библиотека",
  description: "Управление вашей личной коллекцией книг",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`antialiased ${daysOne.variable} ${neucha.variable}`} style={{ fontFamily: 'var(--font-neucha)' }}>
        {children}
      </body>
    </html>
  );
}
