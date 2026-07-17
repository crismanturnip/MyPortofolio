import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = { params: Promise<{ slug: string; chapterSlug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug, chapterSlug } = await params;
  const data = await prisma.chapter.findFirst({
    where: {
      slug: chapterSlug,
      status: "PUBLISHED",
      novel: {
        slug,
        status: "PUBLISHED"
      }
    },
    include: {
      novel: { select: { title: true, slug: true } },
      slides: { orderBy: { order: "asc" } }
    }
  });

  if (!data) {
    return NextResponse.json({ message: "Chapter tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...data,
      content: sanitizeRichText(data.content)
    }
  });
}
