"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// List of all books in the public folder
const books = [
  "A Philosophy of Software Design.pdf",
  "Algorithhms .pdf",
  "Building Microservices.pdf",
  "Clean Code.pdf",
  "Cloud Native Patterns Designing change-tolerant software by Cornelia Davis (z-lib.org).pdf",
  "Compilers.pdf",
  "Computer Networking.pdf",
  "Computer Systems.pdf",
  "Database System Concepts.pdf",
  "Debugging.pdf",
  "Designing Data-Intensive Applications.pdf",
  "Designing Distributed Systems.pdf",
  "Distributed Systems Observability.pdf",
  "Distributed Systems.pdf",
  "Effective Java.pdf",
  "Empowered.pdf",
  "Escaping the Build Trap.pdf",
  "FastAPI Modern Python Web Development.pdf",
  "Fluent Python.pdf",
  "Good Strategy Bad Strategy.pdf",
  "High Output Management.pdf",
  "High Performance Browser Networkng.pdf",
  "Infrastructure as Code.pdf",
  "Inspired - Marty Cagan.pdf",
  "Introduction to Algorithms.pdf",
  "Is Parallel Programming Hard, And, If So, What Can You Do About It.pdf",
  "Java Concurrency in Practice.pdf",
  "Kafka The Definitive Guide.pdf",
  "Lean Analytics.pdf",
  "Measure What Matters.pdf",
  "Operating Systems - Three Easy Pieces.pdf",
  "Patterns of Enterprise Application Architecture.pdf",
  "Playing to Win.pdf",
  "Pragmatic Programmer.pdf",
  "Production Ready Microservices.pdf",
  "Reading in Database Systems.pdf",
  "Refactoring.pdf",
  "Release It!.pdf",
  "Scallability Rules.pdf",
  "Seven Databases in Seven Weeks.pdf",
  "Site Reliability Engineering.pdf",
  "Software Architecture - The Hard Parts.pdf",
  "Spring in Action.pdf",
  "Streaming Systems.pdf",
  "Systems Performance.pdf",
  "TCP-IP Illustrated Volunme 1-The Protocols.pdf",
  "Team Topologies PDF.pdf",
  "The Algorithm Design Manual.pdf",
  "The Art of Scalability.pdf",
  "The DevOps Handbook.pdf",
  "The Hard Things About Hard Things.pdf",
  "The Linux Programming Interface.pdf",
  "The Manager's Path.pdf",
  "The Practice of System and Network Administration.pdf",
  "The Stuff Engineer's Patj.pdf",
  "Zero to One.pdf",
  "kubernetes-up-running.pdf",
  "sicp.pdf",
  "terraform-up-and-running.pdf",
];

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
        className={`relative aspect-[3/4] rounded-xl bg-gradient-to-br ${color.bg} p-4 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-${color.accent}-500/20 overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
          <div className="absolute bottom-8 right-4 w-16 h-1 bg-white rounded-full" />
          <div className="absolute bottom-12 right-4 w-12 h-1 bg-white rounded-full" />
          <div className="absolute bottom-16 right-4 w-8 h-1 bg-white rounded-full" />
        </div>

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter((book) => book.toLowerCase().includes(query));
  }, [searchQuery]);

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
