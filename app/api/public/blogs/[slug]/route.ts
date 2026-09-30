import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const data = await prisma.blog.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "LOCKED"] } },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  });

  if (!data) {
    return NextResponse.json({ message: "Blog tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...data,
      content: data.status === "LOCKED" ? null : sanitizeRichText(data.content),
      thumbnailUrl: data.thumbnailUrl ? await resolvePublicImageUrl(data.thumbnailUrl, blogFallbackImages[0]) : null
    }
  });
}
