import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { chapterSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const data = await prisma.chapter.findMany({
    orderBy: [{ novelId: "asc" }, { chapterNumber: "asc" }],
    include: {
      novel: { select: { title: true, slug: true } },
      slides: { orderBy: { order: "asc" } }
    }
  });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = await request.json();
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload chapter tidak valid." }, { status: 400 });
  }

  const novel = await prisma.novel.findUnique({ where: { id: parsed.data.novelId } });
  if (!novel) {
    return NextResponse.json({ message: "Novel tidak ditemukan." }, { status: 404 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const existing = await prisma.chapter.findFirst({
      where: { novelId: parsed.data.novelId, slug: candidate }
    });
    return Boolean(existing);
  });

  const data = await prisma.chapter.create({
    data: {
      novelId: parsed.data.novelId,
      title: parsed.data.title,
      slug,
      chapterNumber: parsed.data.chapterNumber,
      content: parsed.data.content,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      musicTitle: parsed.data.musicTitle || null,
      musicArtist: parsed.data.musicArtist || null,
      musicUrl: parsed.data.musicUrl || null,
      status: parsed.data.status,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      slides: {
        create: parsed.data.slides.map((slide, index) => ({
          order: index + 1,
          type: slide.type,
          imageUrl: slide.imageUrl || null,
          title: slide.title || null,
          content: slide.content || null,
          caption: slide.caption || null,
          altText: slide.altText || null
        }))
      }
    },
    include: {
      novel: { select: { title: true, slug: true } },
      slides: { orderBy: { order: "asc" } }
    }
  });

  return NextResponse.json({ message: "Chapter berhasil dibuat.", data }, { status: 201 });
}
