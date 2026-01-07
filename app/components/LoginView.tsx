"use client";

import { signIn } from "next-auth/react";

export default function LoginView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900 text-center p-4">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
        CS Library Reader
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Access your technical PDF collection directly from Google Drive. Create
        a folder named <code>CS_LIBRARY</code> to get started.
      </p>
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Sign in with Google
      </button>
    </div>
  );
}
