import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";

export const dynamic = "force-dynamic";

export default async function NovelListPage() {
  const novels = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { chapters: { where: { status: "PUBLISHED" }, orderBy: { chapterNumber: "asc" } } },
  });
  const novelCards = await Promise.all(
    novels.map(async (novel, index) => ({
      ...novel,
      coverUrl: await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[index % novelFallbackImages.length]),
    }))
  );

  return (
    <section className="reader-bg mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="reader-badge inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-[0.22em]">
          <BookOpen size={16} />
          Novel
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-wide md:text-5xl">Ruang baca <span className="reader-accent">cerita fiksi.</span></h1>
        <p className="reader-muted mt-4 max-w-2xl leading-8">Pilih novel, baca sinopsis, lalu lanjutkan chapter yang tersedia.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {novelCards.length === 0 ? <p className="reader-surface rounded-2xl border p-8">Belum ada novel published.</p> : null}
        {novelCards.map((novel) => (
          <a key={novel.id} href={`/novel/${novel.slug}`} className="reader-surface group overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-1">
            <img src={novel.coverUrl} alt={novel.title} className="aspect-[3/4] w-full rounded-xl object-cover" />
            <div className="pt-4">
              <p className="reader-cyan text-xs font-bold uppercase tracking-widest">{novel.genre || "Novel"}</p>
              <h2 className="mt-2 text-xl font-bold group-hover:text-[var(--reader-primary)]">{novel.title}</h2>
              <p className="reader-muted mt-2 line-clamp-3 text-sm leading-6">{novel.summary}</p>
              <p className="reader-muted mt-4 text-sm font-bold">{novel.chapters.length} chapter tersedia</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
