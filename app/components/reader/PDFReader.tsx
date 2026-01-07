"use client";

import { useEffect, useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  ArrowLeft,
} from "lucide-react";
import { saveReadingProgress } from "@/app/actions/progress";
import Link from "next/link";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
  bookId: string;
  accessToken: string;
  initialPage?: number;
}

export default function PDFReader({
  bookId,
  accessToken,
  initialPage = 1,
}: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.2);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync progress
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveReadingProgress(bookId, pageNumber);
    }, 1000); // Save after 1 second of staying on a page
    return () => clearTimeout(timeout);
  }, [pageNumber, bookId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages));
  };

  const fileUrl = `https://www.googleapis.com/drive/v3/files/${bookId}?alt=media`;

  const file = useMemo(
    () => ({
      url: fileUrl,
      httpHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
    [fileUrl, accessToken]
  );

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode
          ? "bg-neutral-900 text-gray-200"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between p-4 shadow-md z-10 ${
          isDarkMode ? "bg-neutral-800" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-70">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold hidden sm:block">Reader</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-mono text-sm">
            {pageNumber} / {numPages || "--"}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full ml-2"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto flex justify-center p-8">
        <div
          className={`shadow-2xl transition-all duration-300 ${
            isDarkMode ? "invert brightness-90 hue-rotate-180" : ""
          }`}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            }
            error={
              <div className="p-10 text-red-500">
                Failed to load PDF. Please Refresh or Check Drive Permissions.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
