"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Ensure worker is configured (duplicated from PDFViewer, ideally should be a shared config/utility)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookCoverProps {
  file: string;
  className?: string;
  fallbackColor: { bg: string; accent: string };
  title: string;
}

export default function BookCover({
  file,
  className,
  fallbackColor,
  title,
}: BookCoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Load a bit before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
      title={title}
      aria-label={`Cover for ${title}`}
    >
      {/* Background/Fallback */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          fallbackColor.bg
        } transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Placeholder Pattern */}
        {!loaded && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
            <div className="absolute bottom-8 right-4 w-16 h-1 bg-white rounded-full" />
            <div className="absolute bottom-12 right-4 w-12 h-1 bg-white rounded-full" />
            <div className="absolute bottom-16 right-4 w-8 h-1 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* PDF Cover */}
      {isVisible && !error && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <Document
            file={file}
            loading={null}
            error={null}
            onLoadError={() => setError(true)}
            className="flex items-center justify-center w-full h-full"
          >
            <Page
              pageNumber={1}
              width={200} // Set a fixed reasonable width to render, CSS will scale it
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onLoadSuccess={() => setLoaded(true)}
              className="w-full h-full object-cover"
            />
          </Document>
        </div>
      )}
    </div>
  );
}
