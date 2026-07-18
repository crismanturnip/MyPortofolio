import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import MusicPlayer from "@/components/music-player";

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
    <article className="reader-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <a href="/novel" className="reader-back-link mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} aria-hidden="true" />Semua novel</a>
      <section className="reader-surface reader-reveal grid gap-7 rounded-2xl border p-4 sm:p-6 md:grid-cols-[240px_1fr] md:p-8 lg:grid-cols-[280px_1fr]">
        <img src={coverUrl} alt={novel.title} className="mx-auto aspect-[3/4] w-full max-w-[280px] rounded-xl object-cover shadow-lg" />
        <div className="grid content-center">
          <p className="reader-cyan text-sm font-bold uppercase tracking-[0.22em]">{novel.genre || "Novel"}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-wide md:text-6xl">{novel.title}</h1>
          <p className="reader-muted mt-5 max-w-3xl text-lg leading-8">{novel.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {firstChapter ? <a href={`/novel/${novel.slug}/chapter/${firstChapter.slug}`} className="reader-button rounded-xl border px-5 py-3 text-sm font-black">Mulai Membaca</a> : null}
            <span className="reader-button-secondary inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold"><CheckCircle2 size={16} aria-hidden="true" />Published · {novel.chapters.length} chapter</span>
          </div>
          {novel.musicUrl ? <div className="mt-6 max-w-2xl"><MusicPlayer track={{ title: novel.musicTitle, artist: novel.musicArtist, url: novel.musicUrl, source: "novel" }} /></div> : null}
        </div>
      </section>

      <section className="reader-surface mt-8 rounded-2xl border p-5 md:p-8">
        <h2 className="inline-flex items-center gap-3 text-2xl font-bold"><BookOpen className="reader-cyan" size={22} aria-hidden="true" />Daftar Chapter</h2>
        <div className="mt-5 divide-y" style={{ borderColor: "var(--reader-border)" }}>
          {novel.chapters.length === 0 ? <p className="reader-muted py-8">Belum ada chapter published.</p> : null}
          {novel.chapters.map((chapter) => (
            <a key={chapter.id} href={`/novel/${novel.slug}/chapter/${chapter.slug}`} className="reader-chapter-link flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-black">Chapter {chapter.chapterNumber}: {chapter.title}</p>
                <p className="reader-muted text-sm">{chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString("id-ID") : ""}</p>
              </div>
              <span className="reader-badge inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold">Baca <ArrowRight size={13} aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
