import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

export async function GET() {
  const data = await prisma.novel.findMany({
    where: { status: { in: ["PUBLISHED", "LOCKED"] } },
    orderBy: { publishedAt: "desc" },
    include: {
      chapters: {
        where: { status: { in: ["PUBLISHED", "LOCKED"] } },
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
        content: novel.status === "LOCKED" || chapter.status === "LOCKED" ? null : sanitizeRichText(chapter.content)
      }))
    }))
  );

  return NextResponse.json({ data: resolved });
}
