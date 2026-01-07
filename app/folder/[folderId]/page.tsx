import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { listBooks } from "@/app/lib/drive";
import { BookCard } from "@/app/components/filesystem/BookCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ folderId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function FolderPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
  }

  const { folderId } = await params;
  const { name } = await searchParams;

  const books = await listBooks(session.accessToken as string, folderId);
  const folderName = name || "Files";

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Library
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
          {folderName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {books.length} {books.length === 1 ? "book" : "books"}
        </p>
      </header>

      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No PDF books found in this folder.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </main>
  );
}
