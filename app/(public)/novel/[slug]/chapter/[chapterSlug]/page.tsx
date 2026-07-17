import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoryReader from "@/components/story-reader";
import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export default async function ChapterDetailPage({ params }: Props) {
  const { slug, chapterSlug } = await params;
  const chapter = await prisma.chapter.findFirst({
    where: {
      slug: chapterSlug,
      status: "PUBLISHED",
      novel: {
        slug,
        status: "PUBLISHED",
      },
    },
    include: {
      novel: true,
      slides: { orderBy: { order: "asc" } },
    },
  });

  if (!chapter) {
    notFound();
  }

  const siblings = await prisma.chapter.findMany({
    where: { novelId: chapter.novelId, status: "PUBLISHED" },
    orderBy: { chapterNumber: "asc" },
    select: {
      title: true,
      slug: true,
      chapterNumber: true,
      slides: {
        orderBy: { order: "asc" },
        select: { imageUrl: true },
      },
    },
  });
  const currentIndex = siblings.findIndex((item) => item.slug === chapter.slug);
  const previous = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const episodes = siblings.map((item) => ({
    title: item.title,
    slug: item.slug,
    chapterNumber: item.chapterNumber,
    thumbnail: item.slides.find((slide) => slide.imageUrl)?.imageUrl || null,
    slideCount: item.slides.length,
  }));

  if (chapter.slides.length > 0) {
    return (
      <StoryReader
        story={{ title: chapter.novel.title, slug: chapter.novel.slug }}
        episode={{ title: chapter.title, slug: chapter.slug, chapterNumber: chapter.chapterNumber }}
        slides={chapter.slides}
        episodes={episodes}
        previous={previous ? episodes[currentIndex - 1] : null}
        next={next ? episodes[currentIndex + 1] : null}
      />
    );
  }

  const safeContent = sanitizeRichText(chapter.content);
  const words = safeContent.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <a href={`/novel/${chapter.novel.slug}`} className="reader-primary text-sm font-bold">← Kembali ke detail novel</a>
      <header className="mt-8 border-b pb-8 text-center" style={{ borderColor: "var(--reader-border)" }}>
        <p className="reader-muted text-sm font-bold uppercase tracking-[0.22em]">{chapter.novel.title}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-wide md:text-5xl">{chapter.title}</h1>
        <p className="reader-muted mt-4">Chapter {chapter.chapterNumber} • {Math.max(1, Math.ceil(words / 180))} menit baca</p>
      </header>
      <section className="py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-[0_0_4rem_rgba(90,133,251,0.12)] md:p-8" style={{ borderColor: "var(--reader-border)" }}>
          <div className="reader-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
        </div>
      </section>
      <nav className="grid gap-3 border-t pt-8 sm:grid-cols-2" style={{ borderColor: "var(--reader-border)" }}>
        {previous ? (
          <a href={`/novel/${chapter.novel.slug}/chapter/${previous.slug}`} className="reader-surface rounded-2xl border p-4">
            <span className="reader-cyan text-xs font-bold uppercase tracking-widest">Sebelumnya</span>
            <p className="mt-1 font-black">Ch {previous.chapterNumber}: {previous.title}</p>
          </a>
        ) : <div />}
        {next ? (
          <a href={`/novel/${chapter.novel.slug}/chapter/${next.slug}`} className="reader-surface rounded-2xl border p-4 text-right">
            <span className="reader-cyan text-xs font-bold uppercase tracking-widest">Berikutnya</span>
            <p className="mt-1 font-black">Ch {next.chapterNumber}: {next.title}</p>
          </a>
        ) : null}
      </nav>
    </article>
  );
}
