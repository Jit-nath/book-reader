import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import LoginView from "@/app/components/LoginView";
import { findLibraryFolder, listFolders } from "@/app/lib/drive";
import { FolderCard } from "@/app/components/filesystem/FolderCard";
import { FolderX } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return <LoginView />;
  }

  // Find CS_LIBRARY folder
  const libraryId = await findLibraryFolder(session.accessToken as string);

  if (!libraryId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <FolderX className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Library Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
          We couldn&apos;t find a folder named <strong>CS_LIBRARY</strong> in
          your Google Drive. Please create one to start your collection.
        </p>
      </div>
    );
  }

  const folders = await listFolders(session.accessToken as string, libraryId);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Library
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a category to browse
        </p>
      </header>

      {folders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No category folders found in CS_LIBRARY.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </main>
  );
}
