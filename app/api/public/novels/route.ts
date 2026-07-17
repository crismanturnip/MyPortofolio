import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

export async function GET() {
  const data = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { chapterNumber: "asc" }
      }
    }
  });
  const resolved = await Promise.all(
    data.map(async (novel, index) => ({
      ...novel,
      coverUrl: await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[index % novelFallbackImages.length]),
      chapters: novel.chapters.map((chapter) => ({
        ...chapter,
        content: sanitizeRichText(chapter.content)
      }))
    }))
  );

  return NextResponse.json({ data: resolved });
}
