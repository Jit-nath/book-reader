"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import("../components/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
    </div>
  ),
});

function ReaderContent() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
        <h1 className="text-2xl font-bold mb-4">No book selected</h1>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors font-medium"
        >
          Browse Library
        </Link>
      </div>
    );
  }

  const bookTitle = decodeURIComponent(file).replace(".pdf", "");

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 md:px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all text-sm font-medium"
        >
          <span>←</span>
          <span className="hidden sm:inline">Library</span>
        </Link>
        <h1 className="text-lg font-semibold truncate flex-1">{bookTitle}</h1>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer file={`/${file}`} />
      </div>
    </div>
  );
}

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-zinc-950">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
