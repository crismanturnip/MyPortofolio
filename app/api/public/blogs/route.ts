import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

export async function GET() {
  const data = await prisma.blog.findMany({
    where: { status: { in: ["PUBLISHED", "LOCKED"] } },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    },
    orderBy: { publishedAt: "desc" }
  });
  const resolved = await Promise.all(
    data.map(async (blog, index) => ({
      ...blog,
      content: blog.status === "LOCKED" ? null : sanitizeRichText(blog.content),
      thumbnailUrl: await resolvePublicImageUrl(blog.thumbnailUrl, blogFallbackImages[index % blogFallbackImages.length])
    }))
  );

  return NextResponse.json({ data: resolved });
}
