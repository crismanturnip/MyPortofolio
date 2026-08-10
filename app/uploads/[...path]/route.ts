import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLocalUploadRoot } from "@/lib/upload-path";

type Props = { params: Promise<{ path: string[] }> };

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg"
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Props) {
  const { path: segments } = await params;

  if (!segments.length || segments.some((segment) => segment === ".." || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ message: "Upload tidak valid." }, { status: 400 });
  }

  const uploadRoot = getLocalUploadRoot();
  const filePath = path.resolve(uploadRoot, ...segments);
  if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
    return NextResponse.json({ message: "Upload tidak valid." }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000"
      }
    });
  } catch {
    return NextResponse.json({ message: "Upload tidak ditemukan." }, { status: 404 });
  }
}
