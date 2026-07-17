import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ path: string[] }> };

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg"
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Props) {
  const { path: segments } = await params;

  if (!segments.length || segments.some((segment) => segment === ".." || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ message: "Asset tidak valid." }, { status: 400 });
  }

  const assetRoot = path.resolve(process.cwd(), "app", "public", "assets");
  const filePath = path.resolve(assetRoot, ...segments);
  if (!filePath.startsWith(`${assetRoot}${path.sep}`)) {
    return NextResponse.json({ message: "Asset tidak valid." }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch {
    return NextResponse.json({ message: "Asset tidak ditemukan." }, { status: 404 });
  }
}
