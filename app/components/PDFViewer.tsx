"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string;
}

type FitMode = "manual" | "width" | "height";

interface OutlineItem {
  title: string;
  dest: string | unknown[] | null;
  items?: OutlineItem[];
  pageNumber?: number;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [fitMode, setFitMode] = useState<FitMode>("manual");
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [visiblePages, setVisiblePages] = useState<Set<number>>(
    new Set([1, 2, 3])
  );
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(320);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth < 200) {
          setSidebarWidth(200);
        } else if (newWidth > 600) {
          setSidebarWidth(600);
        } else {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const [pageLabels, setPageLabels] = useState<string[] | null>(null);

  const onDocumentLoadSuccess = useCallback(
    async (pdf: pdfjs.PDFDocumentProxy) => {
      setNumPages(pdf.numPages);
      const doc = pdf;
      setLoading(false);

      try {
        const labels = await doc.getPageLabels();
        if (labels && labels.length > 0) {
          setPageLabels(labels);
        } else {
          setPageLabels(null);
        }
      } catch (err) {
        console.error("Error getting page labels:", err);
        setPageLabels(null);
      }

      // Extract outline/table of contents
      try {
        const outlineData = await doc.getOutline();
        if (outlineData) {
          const resolveOutline = async (
            items: OutlineItem[]
          ): Promise<OutlineItem[]> => {
            return Promise.all(
              items.map(async (item) => {
                let pageNumber: number | undefined;

                if (item.dest) {
                  try {
                    // Resolve destination if it's a string (named destination)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let dest: any = item.dest;
                    if (typeof dest === "string") {
                      dest = await doc.getDestination(dest);
                    }

                    // If we have an array, the first element is usually the page reference
                    if (Array.isArray(dest) && dest.length > 0) {
                      const ref = dest[0];
                      // ref can be a Ref object { num, gen } or sometimes null/undefined
                      if (ref) {
                        try {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const index = await doc.getPageIndex(ref as any);
                          // pdfjs uses 0-based index, we use 1-based
                          if (index !== -1) {
                            pageNumber = index + 1;
                          }
                        } catch (err) {
                          console.warn(
                            "Failed to get page index for ref:",
                            ref,
                            err
                          );
                        }
                      }
                    }
                  } catch (err) {
                    console.warn(
                      "Failed to resolve destination:",
                      item.dest,
                      err
                    );
                  }
                }

                // Recursively resolve children
                let children: OutlineItem[] | undefined;
                if (item.items && item.items.length > 0) {
                  children = await resolveOutline(item.items as OutlineItem[]);
                }

                return {
                  ...item,
                  pageNumber,
                  items: children,
                };
              })
            );
          };

          const resolved = await resolveOutline(outlineData as OutlineItem[]);
          setOutline(resolved);
        } else {
          setOutline([]);
        }
      } catch (err) {
        console.error("Error getting outline:", err);
        setOutline([]);
      }
    },
    []
  );

  const onPageLoadSuccess = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      if (pageSize.width === 0) {
        setPageSize({ width, height });
      }
    },
    [pageSize.width]
  );

  // Calculate which pages are visible
  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const pageNum = parseInt(
              entry.target.getAttribute("data-page") || "0"
            );
            if (entry.isIntersecting) {
              next.add(pageNum);
              if (pageNum > 1) next.add(pageNum - 1);
              if (pageNum < numPages) next.add(pageNum + 1);
            }
          });
          return next;
        });
      },
      {
        root: containerRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  // Calculate scale based on fit mode
  const updateScale = useCallback(() => {
    if (fitMode === "manual" || !containerRef.current || pageSize.width === 0)
      return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48;
    const containerHeight = container.clientHeight - 48;

    if (fitMode === "width") {
      setScale(containerWidth / pageSize.width);
    } else if (fitMode === "height") {
      setScale(containerHeight / pageSize.height);
    }
  }, [fitMode, pageSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [updateScale]);

  const zoomIn = () => {
    setFitMode("manual");
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setFitMode("manual");
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const fitToWidth = () => {
    setFitMode(fitMode === "width" ? "manual" : "width");
  };

  const fitToHeight = () => {
    setFitMode(fitMode === "height" ? "manual" : "height");
  };

  const [jumpToPage, setJumpToPage] = useState<string>("");

  // Scroll to page by calculating position based on estimated page height
  const goToPage = useCallback((pageNum: number) => {
    const pageEl = pageRefs.current.get(pageNum);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNum = parseInt(jumpToPage);
      goToPage(pageNum);
      setJumpToPage("");
    }
  };

  const handleOutlineClick = (pageNum: number) => {
    goToPage(pageNum);
  };

  // Handle internal PDF link clicks
  const handleItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      goToPage(pageNumber);
    },
    [goToPage]
  );

  const estimatedPageHeight = pageSize.height ? pageSize.height * scale : 800;

  // Recursive component to render outline items
  const OutlineItems = ({
    items,
    depth = 0,
  }: {
    items: OutlineItem[];
    depth?: number;
  }) => (
    <ul className={`${depth > 0 ? "ml-4 border-l border-zinc-700 pl-2" : ""}`}>
      {items.map((item, index) => (
        <li key={index}>
          <button
            onClick={() =>
              item.pageNumber && handleOutlineClick(item.pageNumber)
            }
            disabled={!item.pageNumber}
            className="w-full text-left py-2 px-3 text-sm hover:bg-zinc-800 rounded-lg transition-colors flex justify-between gap-2 group disabled:opacity-50"
          >
            <span className="text-zinc-300 group-hover:text-white truncate">
              {item.title}
            </span>
            {item.pageNumber && (
              <span className="text-zinc-500 text-xs shrink-0">
                {pageLabels
                  ? pageLabels[item.pageNumber - 1]
                  : `p.${item.pageNumber}`}
              </span>
            )}
          </button>
          {item.items && item.items.length > 0 && (
            <OutlineItems items={item.items} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex h-full relative">
      {/* Sidebar - Table of Contents */}
      {showOutline && (
        <div
          className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 absolute md:relative z-20 shadow-2xl md:shadow-none"
          style={{ width: sidebarWidth }}
        >
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500 transition-colors z-10"
            onMouseDown={startResizing}
          />
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Table of Contents</h2>
            <button
              onClick={() => setShowOutline(false)}
              className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {outline.length > 0 ? (
              <OutlineItems items={outline} />
            ) : (
              <p className="text-zinc-500 text-sm text-center py-8">
                No table of contents available for this book.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between px-4 md:px-6 py-4 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                showOutline
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
              title="Table of Contents"
            >
              <span>☰</span>
              <span className="hidden sm:inline">Index</span>
            </button>

            <span className="text-zinc-400 text-sm whitespace-nowrap">
              <span className="text-white font-semibold">{numPages}</span>{" "}
              <span className="hidden sm:inline">pages</span>
            </span>
            <input
              type="number"
              min={1}
              max={numPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyDown={handleJumpToPage}
              placeholder="Go to..."
              className="w-24 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none text-sm text-white placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fitToWidth}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                fitMode === "width"
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
              title="Fit to width"
            >
              <span>↔</span>
              <span className="hidden sm:inline">Width</span>
            </button>
            <button
              onClick={fitToHeight}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                fitMode === "height"
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
              title="Fit to height"
            >
              <span>↕</span>
              <span className="hidden sm:inline">Height</span>
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-2" />

            <button
              onClick={zoomOut}
              className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all text-lg font-bold"
            >
              −
            </button>
            <span className="text-zinc-400 text-sm w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* PDF Document */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto py-8 bg-zinc-950"
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          )}
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onItemClick={handleItemClick}
            loading={null}
            className="flex flex-col items-center gap-6"
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNum = index + 1;
              const isVisible = visiblePages.has(pageNum);

              return (
                <div
                  key={`page_${pageNum}`}
                  ref={(el) => {
                    if (el) pageRefs.current.set(pageNum, el);
                  }}
                  data-page={pageNum}
                  style={{
                    minHeight: isVisible ? undefined : estimatedPageHeight,
                    minWidth: isVisible
                      ? undefined
                      : pageSize.width * scale || 600,
                  }}
                  className="flex items-center justify-center"
                >
                  {isVisible ? (
                    <Page
                      pageNumber={pageNum}
                      scale={scale}
                      className="shadow-2xl rounded-lg overflow-hidden"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onLoadSuccess={
                        pageNum === 1 ? onPageLoadSuccess : undefined
                      }
                    />
                  ) : (
                    <div
                      className="bg-zinc-800/50 rounded-lg flex items-center justify-center text-zinc-500"
                      style={{
                        width: pageSize.width * scale || 600,
                        height: estimatedPageHeight,
                      }}
                    >
                      {pageLabels ? pageLabels[index] : `Page ${pageNum}`}
                    </div>
                  )}
                </div>
              );
            })}
          </Document>
        </div>
      </div>
    </div>
  );
}
