import { ArrowUpRight, BookOpen, LibraryBig } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";

export const dynamic = "force-dynamic";

export default async function NovelListPage() {
  const novels = await prisma.novel.findMany({
    where: { status: { in: ["PUBLISHED", "LOCKED"] } },
    orderBy: { publishedAt: "desc" },
    include: { chapters: { where: { status: { in: ["PUBLISHED", "LOCKED"] } }, orderBy: { chapterNumber: "asc" } } },
  });
  const novelCards = await Promise.all(
    novels.map(async (novel, index) => ({
      ...novel,
      coverUrl: await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[index % novelFallbackImages.length]),
    }))
  );

  return (
    <section className="reader-bg reader-page mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="reader-reveal mb-10">
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
          <a key={novel.id} href={`/novel/${novel.slug}`} className="reader-surface reader-card-lift group overflow-hidden rounded-2xl border p-4">
            <div className="overflow-hidden rounded-xl"><img src={novel.coverUrl} alt={novel.title} loading="lazy" decoding="async" className="reader-card-image aspect-[3/4] w-full object-cover" /></div>
            <div className="pt-4">
              <p className="reader-cyan text-xs font-bold uppercase tracking-widest">{novel.genre || "Novel"}</p>
              <h2 className="mt-2 text-xl font-bold group-hover:text-[var(--reader-primary)]">{novel.title}</h2>
              {novel.status === "LOCKED" ? <span className="mt-2 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">Terkunci</span> : null}
              <p className="reader-muted mt-2 line-clamp-3 text-sm leading-6">{novel.summary}</p>
              <div className="reader-muted mt-4 flex items-center justify-between gap-3 text-sm font-bold"><span className="inline-flex items-center gap-2"><LibraryBig size={15} aria-hidden="true" />{novel.chapters.length} chapter</span><ArrowUpRight className="reader-card-arrow reader-primary" size={18} aria-hidden="true" /></div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
