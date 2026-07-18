import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug-unique";
import { taxonomySchema } from "@/lib/validators";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) return admin;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: "ID tag tidak valid." }, { status: 400 });
  const existing = await prisma.blogTag.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Tag tidak ditemukan." }, { status: 404 });
  const parsed = taxonomySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Payload tag tidak valid." }, { status: 400 });
  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.name, async (candidate) => Boolean(await prisma.blogTag.findFirst({ where: { slug: candidate, id: { not: id } } })));
  const data = await prisma.blogTag.update({ where: { id }, data: { name: parsed.data.name, slug } });
  return NextResponse.json({ message: "Tag berhasil diupdate.", data });
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) return admin;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: "ID tag tidak valid." }, { status: 400 });
  const existing = await prisma.blogTag.findUnique({ where: { id }, include: { _count: { select: { blogs: true } } } });
  if (!existing) return NextResponse.json({ message: "Tag tidak ditemukan." }, { status: 404 });
  if (existing._count.blogs > 0) return NextResponse.json({ message: `Tag masih digunakan oleh ${existing._count.blogs} blog.` }, { status: 409 });
  await prisma.blogTag.delete({ where: { id } });
  return NextResponse.json({ message: "Tag berhasil dihapus." });
}
