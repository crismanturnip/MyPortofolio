import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const data = await prisma.novel.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "LOCKED"] } },
    include: {
      chapters: {
        where: { status: { in: ["PUBLISHED", "LOCKED"] } },
        orderBy: { chapterNumber: "asc" }
      }
    }
  });

  if (!data) {
    return NextResponse.json({ message: "Novel tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...data,
      coverUrl: await resolvePublicImageUrl(data.coverUrl, novelFallbackImages[0]),
      chapters: data.chapters.map((chapter) => ({
        ...chapter,
        content: data.status === "LOCKED" || chapter.status === "LOCKED" ? null : sanitizeRichText(chapter.content)
      }))
    }
  });
}
