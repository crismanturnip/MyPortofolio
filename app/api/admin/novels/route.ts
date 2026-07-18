import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { novelSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const data = await prisma.novel.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = await request.json();
  const parsed = novelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload novel tidak valid." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const existing = await prisma.novel.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const data = await prisma.novel.create({
    data: {
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      genre: parsed.data.genre || null,
      coverUrl: parsed.data.coverUrl || null,
      musicTitle: parsed.data.musicTitle || null,
      musicArtist: parsed.data.musicArtist || null,
      musicUrl: parsed.data.musicUrl || null,
      status: parsed.data.status,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
    }
  });

  return NextResponse.json({ message: "Novel berhasil dibuat.", data }, { status: 201 });
}
