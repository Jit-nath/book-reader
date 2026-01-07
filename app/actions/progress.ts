"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getDriveClient, findLibraryFolder } from "@/app/lib/drive";
import { drive_v3 } from "googleapis";

const STATE_FILE_NAME = ".reading_state.json";

interface ReadingState {
  lastReadBookId?: string;
  books: {
    [bookId: string]: {
      page: number;
      timestamp: number;
    };
  };
}

// Cached function to find state file ID to avoid re-searching every time
// In a real serverless env this cache might be per-request or ephemeral,
// so we still search if needed.
async function findStateFile(drive: drive_v3.Drive, folderId: string) {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and name='${STATE_FILE_NAME}' and trashed=false`,
      fields: "files(id)",
    });
    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }
  } catch (e) {
    console.error("Error finding state file:", e);
  }
  return null;
}

export async function getReadingProgress(): Promise<ReadingState> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return { books: {} };

  const drive = getDriveClient(session.accessToken as string);
  const libraryId = await findLibraryFolder(session.accessToken as string);

  if (!libraryId) return { books: {} };

  const fileId = await findStateFile(drive, libraryId);

  if (!fileId) return { books: {} };

  try {
    const res = await drive.files.get({
      fileId,
      alt: "media",
    });
    // drive.files.get with alt=media returns the content directly
    return res.data as ReadingState;
  } catch (e) {
    console.error("Error reading state file:", e);
    return { books: {} };
  }
}

export async function saveReadingProgress(bookId: string, page: number) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return;

  const drive = getDriveClient(session.accessToken as string);
  const libraryId = await findLibraryFolder(session.accessToken as string);

  if (!libraryId) return;

  const fileId = await findStateFile(drive, libraryId);
  let currentState: ReadingState = { books: {} };

  if (fileId) {
    try {
      const res = await drive.files.get({ fileId, alt: "media" });
      // Ensure we handle case where file might be empty or invalid JSON
      if (typeof res.data === "object") {
        currentState = res.data as ReadingState;
      }
    } catch {
      // Ignore error, assume empty
    }
  }

  // Update State
  if (!currentState.books) currentState.books = {};

  currentState.books[bookId] = {
    page,
    timestamp: Date.now(),
  };
  currentState.lastReadBookId = bookId;

  const fileContent = JSON.stringify(currentState, null, 2);
  const media = {
    mimeType: "application/json",
    body: fileContent,
  };

  try {
    if (fileId) {
      await drive.files.update({
        fileId,
        media,
      });
    } else {
      // Create new file
      await drive.files.create({
        requestBody: {
          name: STATE_FILE_NAME,
          parents: [libraryId],
          mimeType: "application/json",
        },
        media,
      });
    }
  } catch (e) {
    console.error("Error saving reading progress:", e);
  }
}
