import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import PDFReader from "@/app/components/reader/PDFReader";
import { redirect } from "next/navigation";
import { getReadingProgress } from "@/app/actions/progress";

interface PageProps {
  params: Promise<{ bookId: string }>;
}

export default async function ReadPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
  }

  const { bookId } = await params;

  // Get initial progress
  const progress = await getReadingProgress();
  const initialPage = progress.books[bookId]?.page || 1;

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-zinc-950">
      <PDFReader
        bookId={bookId}
        accessToken={session.accessToken as string}
        initialPage={initialPage}
      />
    </div>
  );
}
