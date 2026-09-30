import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = { params: Promise<{ slug: string; chapterSlug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug, chapterSlug } = await params;
  const data = await prisma.chapter.findFirst({
    where: {
      slug: chapterSlug,
      status: { in: ["PUBLISHED", "LOCKED"] },
      novel: {
        slug,
        status: { in: ["PUBLISHED", "LOCKED"] }
      }
    },
    include: {
      novel: { select: { title: true, slug: true, status: true, musicTitle: true, musicArtist: true, musicUrl: true, musicVolume: true } },
      slides: { orderBy: { order: "asc" } }
    }
  });

  if (!data) {
    return NextResponse.json({ message: "Chapter tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...data,
      content: data.status === "LOCKED" || data.novel.status === "LOCKED" ? null : sanitizeRichText(data.content),
      slides: data.status === "LOCKED" || data.novel.status === "LOCKED" ? [] : data.slides
    }
  });
}
