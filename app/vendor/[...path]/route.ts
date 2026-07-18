import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ path: string[] }> };

const VENDOR_FILES: Record<string, { source: string[]; contentType: string }> = {
  "swiper/swiper-bundle.min.css": {
    source: ["swiper", "swiper-bundle.min.css"],
    contentType: "text/css; charset=utf-8",
  },
  "swiper/swiper-bundle.min.js": {
    source: ["swiper", "swiper-bundle.min.js"],
    contentType: "text/javascript; charset=utf-8",
  },
  "boxicons/css/boxicons.min.css": {
    source: ["boxicons", "css", "boxicons.min.css"],
    contentType: "text/css; charset=utf-8",
  },
  "boxicons/fonts/boxicons.woff2": {
    source: ["boxicons", "fonts", "boxicons.woff2"],
    contentType: "font/woff2",
  },
  "boxicons/fonts/boxicons.woff": {
    source: ["boxicons", "fonts", "boxicons.woff"],
    contentType: "font/woff",
  },
  "boxicons/fonts/boxicons.ttf": {
    source: ["boxicons", "fonts", "boxicons.ttf"],
    contentType: "font/ttf",
  },
  "boxicons/fonts/boxicons.eot": {
    source: ["boxicons", "fonts", "boxicons.eot"],
    contentType: "application/vnd.ms-fontobject",
  },
  "boxicons/fonts/boxicons.svg": {
    source: ["boxicons", "fonts", "boxicons.svg"],
    contentType: "image/svg+xml",
  },
};

export async function GET(_request: Request, { params }: Props) {
  const { path: segments } = await params;
  const asset = VENDOR_FILES[segments.join("/")];

  if (!asset) {
    return NextResponse.json({ message: "Vendor asset tidak ditemukan." }, { status: 404 });
  }

  try {
    const assetPath = path.join(process.cwd(), "node_modules", ...asset.source);
    const file = await readFile(assetPath);

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "Vendor asset tidak ditemukan." }, { status: 404 });
  }
}
