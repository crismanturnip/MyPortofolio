import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { blogSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const blogId = Number(id);
  const existingBlog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!existingBlog) {
    return NextResponse.json({ message: "Blog tidak ditemukan." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload blog tidak valid." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const another = await prisma.blog.findFirst({
      where: { slug: candidate, id: { not: blogId } }
    });
    return Boolean(another);
  });

  const data = await prisma.blog.update({
    where: { id: blogId },
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt || null,
      content: parsed.data.content,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      status: parsed.data.status,
      publishedAt:
        parsed.data.status !== "DRAFT"
          ? existingBlog.publishedAt ?? new Date()
          : null,
      categories: {
        deleteMany: {},
        create: parsed.data.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } }
        }))
      },
      tags: {
        deleteMany: {},
        create: parsed.data.tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } }
        }))
      }
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    }
  });

  return NextResponse.json({ message: "Blog berhasil diupdate.", data });
}

export async function DELETE(_request: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const blogId = Number(id);
  await prisma.blog.delete({ where: { id: blogId } });
  return NextResponse.json({ message: "Blog berhasil dihapus." });
}
