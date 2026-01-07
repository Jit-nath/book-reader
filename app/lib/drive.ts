import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export const CS_LIBRARY_FOLDER_NAME = "CS_LIBRARY";

export function getDriveClient(accessToken: string) {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  return google.drive({ version: "v3", auth });
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export async function findLibraryFolder(
  accessToken: string
): Promise<string | null> {
  const drive = getDriveClient(accessToken);
  try {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${CS_LIBRARY_FOLDER_NAME}' and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
    });
    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id || null;
    }
    return null;
  } catch (e) {
    console.error("Error searching for library folder:", e);
    return null; // Handle error gracefully (e.g. invalid token)
  }
}

export async function listFolders(
  accessToken: string,
  parentId: string
): Promise<DriveFile[]> {
  const drive = getDriveClient(accessToken);
  try {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name, mimeType)",
      orderBy: "name",
    });
    return (res.data.files as DriveFile[]) || [];
  } catch (e) {
    console.error("Error listing folders:", e);
    return [];
  }
}

export async function listBooks(
  accessToken: string,
  folderId: string
): Promise<DriveFile[]> {
  const drive = getDriveClient(accessToken);
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name, mimeType, thumbnailLink)",
      orderBy: "name",
    });
    return (res.data.files as DriveFile[]) || [];
  } catch (e) {
    console.error("Error listing books:", e);
    return [];
  }
}
