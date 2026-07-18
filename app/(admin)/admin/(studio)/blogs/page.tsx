import { Plus } from "lucide-react";
import ContentList from "@/components/admin/content-list";
import { PageHeader } from "@/components/admin/admin-ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({ orderBy: { updatedAt: "desc" }, include: { categories: { include: { category: true } }, tags: { include: { tag: true } } } });
  const items = blogs.map((blog) => ({ id: blog.id, title: blog.title, slug: blog.slug, status: blog.status, updatedAt: blog.updatedAt.toISOString(), createdAt: blog.createdAt.toISOString(), detail: blog.excerpt || "Tanpa ringkasan", taxonomy: [...blog.categories.map(({ category }) => category.name), ...blog.tags.map(({ tag }) => `#${tag.name}`)].join(" · "), editHref: `/admin/blogs/${blog.id}/edit`, deleteEndpoint: `/api/admin/blogs/${blog.id}`, deleteLabel: `blog ${blog.title}` }));
  return <div className="grid gap-6"><PageHeader title="Blog" description="Kelola artikel, status publikasi, kategori, dan tag." action={<a href="/admin/blogs/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white"><Plus size={16} />Blog baru</a>} /><ContentList items={items} emptyTitle="Belum ada blog" emptyDescription="Buat blog pertama untuk mulai mengisi halaman publik." /></div>;
}
