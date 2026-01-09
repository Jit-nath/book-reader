"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Fuse from "fuse.js";

const BookCover = dynamic(() => import("./BookCover"), {
  ssr: false,
});

// Color palettes for book covers
const colorPalettes = [
  { bg: "from-violet-600 to-purple-700", accent: "violet" },
  { bg: "from-blue-600 to-indigo-700", accent: "blue" },
  { bg: "from-emerald-600 to-teal-700", accent: "emerald" },
  { bg: "from-orange-500 to-red-600", accent: "orange" },
  { bg: "from-pink-500 to-rose-600", accent: "pink" },
  { bg: "from-cyan-500 to-blue-600", accent: "cyan" },
  { bg: "from-amber-500 to-orange-600", accent: "amber" },
  { bg: "from-fuchsia-500 to-purple-600", accent: "fuchsia" },
];

function getBookColor(index: number) {
  return colorPalettes[index % colorPalettes.length];
}

function getBookTitle(filename: string) {
  return filename.replace(".pdf", "").replace(/ \(z-lib\.org\)/g, "");
}

function BookCard({ book, index }: { book: string; index: number }) {
  const color = getBookColor(index);
  const title = getBookTitle(book);

  return (
    <Link
      href={`/read?file=${encodeURIComponent(book)}`}
      className="group relative block"
    >
      <div
        className={`relative aspect-[3/4] rounded-xl bg-zinc-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-${color.accent}-500/20 overflow-hidden`}
      >
        <BookCover file={`/${book}`} fallbackColor={color} title={title} />

        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 pointer-events-none z-10" />

        {/* Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300" />

        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20" />

        {/* Title */}
        <div className="relative z-10 flex flex-col justify-end h-full">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-4 drop-shadow-md">
            {title}
          </h3>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-xl" />
      </div>
    </Link>
  );
}

interface BookGridProps {
  books: string[];
}

export default function BookGrid({ books }: BookGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;

    const fuse = new Fuse(books, {
      threshold: 0.3,
    });

    return fuse.search(searchQuery).map((result) => result.item);
  }, [books, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                📚 Book Library
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {filteredBooks.length} of {books.length} books
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder-zinc-500"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Book Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-semibold mb-2">No books found</h2>
            <p className="text-zinc-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBooks.map((book, index) => (
              <BookCard key={book} book={book} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
