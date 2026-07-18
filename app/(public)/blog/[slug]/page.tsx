import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await prisma.blog.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!blog) {
    notFound();
  }

  const safeContent = sanitizeRichText(blog.content);
  const thumbnailUrl = blog.thumbnailUrl ? await resolvePublicImageUrl(blog.thumbnailUrl, blogFallbackImages[0]) : null;
  const words = safeContent.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <article className="reader-page">
      <section className="reader-reveal mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <a href="/blog" className="reader-back-link mx-auto mb-7 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} aria-hidden="true" />Kembali ke semua blog</a>
        <div className="flex justify-center gap-2">
          {blog.categories.map(({ category }) => (
            <span key={category.id} className="reader-badge rounded-full border px-3 py-1 text-xs font-bold">{category.name}</span>
          ))}
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-wide md:text-6xl">{blog.title}</h1>
        <p className="reader-muted mx-auto mt-5 max-w-2xl text-lg leading-8">{blog.excerpt || ""}</p>
        <div className="reader-muted mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" />{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("id-ID") : ""}</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={16} aria-hidden="true" />{Math.max(1, Math.ceil(words / 180))} menit baca</span>
        </div>
      </section>
      {thumbnailUrl ? (
        <div className="mx-auto max-w-5xl px-4">
          <img src={thumbnailUrl} alt={blog.title} className="max-h-[520px] w-full rounded-2xl border object-cover reader-surface" />
        </div>
      ) : null}
      <section className="mx-auto max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="reader-article rounded-2xl border p-5 sm:p-8 md:p-10">
          <div className="reader-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {blog.tags.map(({ tag }) => (
            <span key={tag.id} className="reader-button-secondary rounded-full border px-3 py-1 text-sm font-bold">#{tag.name}</span>
          ))}
        </div>
      </section>
    </article>
  );
}
