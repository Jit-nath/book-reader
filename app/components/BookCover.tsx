"use client";

interface BookCoverProps {
  file: string;
  className?: string;
  fallbackColor: { bg: string; accent: string };
  title: string;
}

export default function BookCover({
  className,
  fallbackColor,
  title,
}: BookCoverProps) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
      title={title}
      aria-label={`Cover for ${title}`}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${fallbackColor.bg}`}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
          <div className="absolute bottom-8 right-4 w-16 h-1 bg-white rounded-full" />
          <div className="absolute bottom-12 right-4 w-12 h-1 bg-white rounded-full" />
          <div className="absolute bottom-16 right-4 w-8 h-1 bg-white rounded-full" />
        </div>

        {/* Title for the cover itself (larger text) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-white font-serif font-bold text-lg leading-tight dropshadow-lg line-clamp-6 opacity-90">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
