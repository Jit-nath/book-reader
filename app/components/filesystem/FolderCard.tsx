import Link from "next/link";
import { Folder } from "lucide-react";
import { DriveFile } from "@/app/lib/drive";

export function FolderCard({ folder }: { folder: DriveFile }) {
  return (
    <Link
      href={`/folder/${folder.id}?name=${encodeURIComponent(folder.name)}`}
      className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-zinc-700/50 aspect-square"
    >
      <Folder className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
      <h3 className="text-center font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
        {folder.name}
      </h3>
    </Link>
  );
}
