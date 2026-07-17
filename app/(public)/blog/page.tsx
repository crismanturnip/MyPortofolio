import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
  const blogCards = await Promise.all(
    blogs.map(async (blog, index) => ({
      ...blog,
      thumbnailUrl: await resolvePublicImageUrl(blog.thumbnailUrl, blogFallbackImages[index % blogFallbackImages.length]),
    }))
  );

  return (
    <section className="reader-bg mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="reader-badge inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-[0.22em]">
          <FileText size={16} />
          Blog
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-wide md:text-5xl">Catatan dan <span className="reader-accent">pemikiran.</span></h1>
        <p className="reader-muted mt-4 max-w-2xl leading-8">Tulisan tentang portfolio, proses kreatif, teknologi, pengalaman, dan hal-hal yang layak disimpan.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {blogCards.length === 0 ? <p className="reader-surface rounded-2xl border p-8">Belum ada blog published.</p> : null}
        {blogCards.map((blog, index) => (
          <a
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className={`reader-surface group overflow-hidden rounded-2xl border transition hover:-translate-y-1 ${
              index === 0 ? "md:col-span-2 md:grid md:grid-cols-[1.05fr_0.95fr]" : ""
            }`}
          >
            <img src={blog.thumbnailUrl} alt={blog.title} className="h-64 w-full object-cover md:h-full" />
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {blog.categories.map(({ category }) => (
                  <span key={category.id} className="reader-badge rounded-full border px-3 py-1 text-xs font-bold">{category.name}</span>
                ))}
                {blog.tags.slice(0, 3).map(({ tag }) => (
                  <span key={tag.id} className="reader-button-secondary rounded-full border px-3 py-1 text-xs font-bold">#{tag.name}</span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-wide group-hover:text-[var(--reader-primary)]">{blog.title}</h2>
              <p className="reader-muted mt-3 line-clamp-3">{blog.excerpt || "Tanpa excerpt."}</p>
              <p className="reader-muted mt-6 text-sm font-semibold">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("id-ID") : ""}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
