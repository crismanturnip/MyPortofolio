import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { PUBLIC_CONTENT_RELEASED } from "@/lib/content-release";

export async function GET() {
  const [blogs, novels] = await Promise.all([
    prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 10
    }),
    prisma.novel.findMany({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        slug: true,
        summary: true,
        genre: true,
        coverUrl: true,
        updatedAt: true,
        chapters: {
          where: { status: "PUBLISHED" },
          select: { id: true },
          orderBy: { chapterNumber: "asc" }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 10
    })
  ]);

  const data = [
    ...(await Promise.all(blogs.map(async (item, index) => ({
      type: "blog" as const,
      ...item,
      thumbnailUrl: await resolvePublicImageUrl(item.thumbnailUrl, blogFallbackImages[index % blogFallbackImages.length])
    })))),
    ...(await Promise.all(novels.map(async (item, index) => ({
      type: "novel" as const,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      genre: item.genre,
      coverUrl: await resolvePublicImageUrl(item.coverUrl, novelFallbackImages[index % novelFallbackImages.length]),
      updatedAt: item.updatedAt,
      chapterCount: item.chapters.length
    }))))
  ].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return NextResponse.json({ data, contentReleased: PUBLIC_CONTENT_RELEASED });
}
