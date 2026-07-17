import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { chapterSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const chapterId = Number(id);
  const existingChapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!existingChapter) {
    return NextResponse.json({ message: "Chapter tidak ditemukan." }, { status: 404 });
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
    const other = await prisma.chapter.findFirst({
      where: {
        id: { not: chapterId },
        novelId: parsed.data.novelId,
        slug: candidate
      }
    });
    return Boolean(other);
  });

  const data = await prisma.$transaction(async (tx) => {
    await tx.chapterSlide.deleteMany({ where: { chapterId } });

    return tx.chapter.update({
      where: { id: chapterId },
      data: {
        novelId: parsed.data.novelId,
        title: parsed.data.title,
        slug,
        chapterNumber: parsed.data.chapterNumber,
        content: parsed.data.content,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === "PUBLISHED"
            ? existingChapter.publishedAt ?? new Date()
            : null,
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
  });

  return NextResponse.json({ message: "Chapter berhasil diupdate.", data });
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const chapterId = Number(id);
  await prisma.chapter.delete({ where: { id: chapterId } });
  return NextResponse.json({ message: "Chapter berhasil dihapus." });
}
