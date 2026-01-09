import fs from "fs";
import path from "path";
import BookGrid from "./components/BookGrid";

export const dynamic = "force-static";

export default function Home() {
  const publicDir = path.join(process.cwd(), "public");
  // Ensure public dir exists
  if (!fs.existsSync(publicDir)) {
    return <div>Public directory not found</div>;
  }

  const files = fs.readdirSync(publicDir);
  const books = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

  return <BookGrid books={books} />;
}
