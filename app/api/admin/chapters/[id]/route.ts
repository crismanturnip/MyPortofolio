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

  const title = parsed.data.contentType === "CAKRA_NOTE" ? "Catatan Cakra" : parsed.data.title.trim();
  const slugBase = parsed.data.contentType === "CAKRA_NOTE"
    ? existingChapter.contentType === "CAKRA_NOTE" ? existingChapter.slug : `catatan-cakra-${Date.now()}`
    : parsed.data.slug || title;
  const slug = await ensureUniqueSlug(slugBase, async (candidate) => {
    const other = await prisma.chapter.findFirst({
      where: {
        id: { not: chapterId },
        novelId: parsed.data.novelId,
        slug: candidate
      }
    });
    return Boolean(other);
  });

  const becomesCakraNote = parsed.data.contentType === "CAKRA_NOTE" && (existingChapter.contentType !== "CAKRA_NOTE" || existingChapter.novelId !== parsed.data.novelId);
  const chapterNumber = becomesCakraNote
    ? ((await prisma.chapter.aggregate({
        where: { novelId: parsed.data.novelId, contentType: "CAKRA_NOTE", id: { not: chapterId } },
        _max: { chapterNumber: true },
      }))._max.chapterNumber ?? 1_000_000) + 1
    : parsed.data.contentType === "CAKRA_NOTE"
      ? existingChapter.chapterNumber
      : parsed.data.chapterNumber;

  const data = await prisma.$transaction(async (tx) => {
    await tx.chapterSlide.deleteMany({ where: { chapterId } });

    return tx.chapter.update({
      where: { id: chapterId },
      data: {
        novelId: parsed.data.novelId,
        title,
        slug,
        contentType: parsed.data.contentType,
        chapterNumber,
        content: parsed.data.content,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        musicTitle: parsed.data.musicTitle || null,
        musicArtist: parsed.data.musicArtist || null,
        musicUrl: parsed.data.musicUrl || null,
        musicVolume: parsed.data.musicVolume,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status !== "DRAFT"
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
