import Link from "next/link";
import { FileText } from "lucide-react";
import { DriveFile } from "@/app/lib/drive";

export function BookCard({ book }: { book: DriveFile }) {
  // Use the thumbnail if available, otherwise a generic icon
  // Note: Google Drive thumbnails are often small unless requested with size param,
  // but standard links usually work fine for basic UI.

  return (
    <Link
      href={`/read/${book.id}`}
      className="group relative flex flex-col p-4 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 block h-full"
    >
      <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
        {book.thumbnailLink ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.thumbnailLink}
            alt={book.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <FileText className="w-16 h-16 text-red-500" />
        )}
      </div>

      <h3
        className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2"
        title={book.name}
      >
        {book.name.replace(/\.pdf$/i, "")}
      </h3>
    </Link>
  );
}
