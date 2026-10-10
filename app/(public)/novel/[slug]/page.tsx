import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, LockKeyhole } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import MusicPlayer from "@/components/music-player";
import LockedContentNotice from "@/components/locked-content-notice";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function NovelDetailPage({ params }: Props) {
  const { slug } = await params;
  const novel = await prisma.novel.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "LOCKED"] } },
    include: {
      chapters: {
        where: { status: { in: ["PUBLISHED", "LOCKED"] } },
        orderBy: { chapterNumber: "asc" },
      },
    },
  });

  if (!novel) {
    notFound();
  }

  if (novel.status === "LOCKED") {
    return <LockedContentNotice title={novel.title} backHref="/novel" backLabel="Kembali ke semua novel" detail={novel.summary} />;
  }

  const storyChapters = novel.chapters.filter((chapter) => chapter.contentType !== "CAKRA_NOTE");
  const firstChapter = storyChapters[0] || novel.chapters[0];
  const coverUrl = await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[0]);

  return (
    <article className="reader-page mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <a href="/novel" className="reader-back-link mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} aria-hidden="true" />Semua novel</a>
      <section className="reader-surface reader-reveal grid gap-7 rounded-2xl border p-4 sm:p-6 md:grid-cols-[240px_1fr] md:p-8 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[280px]">
          <img src={coverUrl} alt={novel.title} decoding="async" className="aspect-[3/4] w-full rounded-xl object-cover shadow-lg" />
        </div>
        <div className="grid content-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-wide md:text-6xl">{novel.title}</h1>
          <p className="reader-muted mt-5 max-w-3xl text-lg leading-8">{novel.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {firstChapter ? (
              <a href={`/novel/${novel.slug}/chapter/${firstChapter.slug}`} className="reader-novel-cta inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold">Mulai Membaca</a>
            ) : null}
          </div>
          {novel.musicUrl ? <div className="mt-6 max-w-2xl"><MusicPlayer track={{ title: novel.musicTitle, artist: novel.musicArtist, url: novel.musicUrl, volume: novel.musicVolume, source: "novel" }} /></div> : null}
        </div>
      </section>

      <section className="reader-surface mt-8 rounded-2xl border p-5 md:p-8">
        <h2 className="inline-flex items-center gap-3 text-2xl font-bold"><BookOpen className="reader-chapter-heading-icon" size={22} aria-hidden="true" />Daftar Chapter</h2>
        <div className="reader-chapter-scroll mt-5 divide-y" style={{ borderColor: "var(--reader-border)" }}>
          {novel.chapters.length === 0 ? <p className="reader-muted py-8">Belum ada bagian yang dipublikasikan.</p> : null}
          {novel.chapters.map((chapter) => (
            <a key={chapter.id} href={`/novel/${novel.slug}/chapter/${chapter.slug}`} className={`reader-chapter-link group flex items-center justify-between gap-4 py-4 ${chapter.status === "LOCKED" ? "reader-chapter-locked" : ""}`}>
              <div>
                <p className="inline-flex items-center gap-2 font-black">
                  <span>{chapter.contentType === "CAKRA_NOTE" ? "Catatan Cakra" : `Bagian ${chapter.chapterNumber}: ${chapter.title}`}</span>
                  {chapter.status === "LOCKED" ? <LockKeyhole className="reader-chapter-lock-icon" size={15} aria-label="Terkunci" /> : null}
                </p>
                <p className="reader-muted text-sm">{chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString("id-ID") : ""}</p>
              </div>
              <span className="reader-primary inline-flex shrink-0 items-center gap-1.5 py-2 text-sm font-bold">
                Baca
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" size={14} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
