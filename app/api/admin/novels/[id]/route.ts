import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { novelSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const novelId = Number(id);
  const existingNovel = await prisma.novel.findUnique({ where: { id: novelId } });
  if (!existingNovel) {
    return NextResponse.json({ message: "Novel tidak ditemukan." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = novelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload novel tidak valid." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const another = await prisma.novel.findFirst({
      where: { slug: candidate, id: { not: novelId } }
    });
    return Boolean(another);
  });

  const data = await prisma.novel.update({
    where: { id: novelId },
    data: {
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      genre: parsed.data.genre || null,
      coverUrl: parsed.data.coverUrl || null,
      musicTitle: parsed.data.musicTitle || null,
      musicArtist: parsed.data.musicArtist || null,
      musicUrl: parsed.data.musicUrl || null,
      musicVolume: parsed.data.musicVolume,
      status: parsed.data.status,
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? existingNovel.publishedAt ?? new Date()
          : null
    }
  });

  return NextResponse.json({ message: "Novel berhasil diupdate.", data });
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const novelId = Number(id);
  await prisma.novel.delete({ where: { id: novelId } });
  return NextResponse.json({ message: "Novel berhasil dihapus." });
}
