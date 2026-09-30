import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { blogSchema } from "@/lib/validators";
import { ensureUniqueSlug } from "@/lib/slug-unique";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const data = await prisma.blog.findMany({
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } }
    },
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
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Payload blog tidak valid." }, { status: 400 });
  }

  const slug = await ensureUniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const existing = await prisma.blog.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const data = await prisma.blog.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt || null,
      content: parsed.data.content,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      status: parsed.data.status,
      publishedAt: parsed.data.status !== "DRAFT" ? new Date() : null,
      categories: {
        create: parsed.data.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } }
        }))
      },
      tags: {
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

  return NextResponse.json({ message: "Blog berhasil dibuat.", data }, { status: 201 });
}
