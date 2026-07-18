import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ file: string }> };

const ALLOWED_FONTS = new Set([
  "poppins-latin-300-normal.woff2",
  "poppins-latin-400-normal.woff2",
  "poppins-latin-500-normal.woff2",
  "poppins-latin-600-normal.woff2",
  "poppins-latin-700-normal.woff2",
  "poppins-latin-400-italic.woff2",
  "poppins-latin-500-italic.woff2",
]);

export async function GET(_request: Request, { params }: Props) {
  const { file } = await params;

  if (!ALLOWED_FONTS.has(file)) {
    return NextResponse.json({ message: "Font tidak ditemukan." }, { status: 404 });
  }

  try {
    const fontPath = path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", file);
    const font = await readFile(fontPath);

    return new Response(new Uint8Array(font), {
      headers: {
        "Content-Type": "font/woff2",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "Font tidak ditemukan." }, { status: 404 });
  }
}
