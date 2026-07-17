import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function NovelDetailPage({ params }: Props) {
  const { slug } = await params;
  const novel = await prisma.novel.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { chapterNumber: "asc" },
      },
    },
  });

  if (!novel) {
    notFound();
  }

  const firstChapter = novel.chapters[0];
  const coverUrl = await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[0]);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <section className="reader-surface grid gap-8 rounded-2xl border p-5 md:grid-cols-[280px_1fr] md:p-8">
        <img src={coverUrl} alt={novel.title} className="aspect-[3/4] w-full rounded-xl object-cover" />
        <div className="grid content-center">
          <p className="reader-cyan text-sm font-bold uppercase tracking-[0.22em]">{novel.genre || "Novel"}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-wide md:text-6xl">{novel.title}</h1>
          <p className="reader-muted mt-5 max-w-3xl text-lg leading-8">{novel.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {firstChapter ? <a href={`/novel/${novel.slug}/chapter/${firstChapter.slug}`} className="reader-button rounded-xl border px-5 py-3 text-sm font-black">Mulai Membaca</a> : null}
            <span className="reader-button-secondary rounded-xl border px-5 py-3 text-sm font-bold">{novel.chapters.length} chapter published</span>
          </div>
        </div>
      </section>

      <section className="reader-surface mt-8 rounded-2xl border p-5 md:p-8">
        <h2 className="text-2xl font-bold">Daftar Chapter</h2>
        <div className="mt-5 divide-y" style={{ borderColor: "var(--reader-border)" }}>
          {novel.chapters.length === 0 ? <p className="reader-muted py-8">Belum ada chapter published.</p> : null}
          {novel.chapters.map((chapter) => (
            <a key={chapter.id} href={`/novel/${novel.slug}/chapter/${chapter.slug}`} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-black">Chapter {chapter.chapterNumber}: {chapter.title}</p>
                <p className="reader-muted text-sm">{chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString("id-ID") : ""}</p>
              </div>
              <span className="reader-badge rounded-full border px-3 py-1 text-xs font-bold">Baca</span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
