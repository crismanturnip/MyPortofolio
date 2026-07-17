import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug-unique";
import { taxonomySchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const data = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = await request.json();
  const parsed = taxonomySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload kategori tidak valid." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.name, async (candidate) => {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const data = await prisma.blogCategory.create({
    data: {
      name: parsed.data.name,
      slug
    }
  });

  return NextResponse.json({ message: "Kategori berhasil dibuat.", data }, { status: 201 });
}
