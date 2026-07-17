import { notFound } from "next/navigation";
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
    <article>
      <section className="mx-auto max-w-4xl px-4 py-10 text-center">
        <div className="flex justify-center gap-2">
          {blog.categories.map(({ category }) => (
            <span key={category.id} className="reader-badge rounded-full border px-3 py-1 text-xs font-bold">{category.name}</span>
          ))}
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-wide md:text-6xl">{blog.title}</h1>
        <p className="reader-muted mx-auto mt-5 max-w-2xl text-lg leading-8">{blog.excerpt || ""}</p>
        <div className="reader-muted mt-6 flex justify-center gap-4 text-sm">
          <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("id-ID") : ""}</span>
          <span>{Math.max(1, Math.ceil(words / 180))} menit baca</span>
        </div>
      </section>
      {thumbnailUrl ? (
        <div className="mx-auto max-w-5xl px-4">
          <img src={thumbnailUrl} alt={blog.title} className="max-h-[520px] w-full rounded-2xl border object-cover reader-surface" />
        </div>
      ) : null}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-[0_0_4rem_rgba(90,133,251,0.12)] md:p-8" style={{ borderColor: "var(--reader-border)" }}>
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
