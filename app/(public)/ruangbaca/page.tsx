import type { ReactNode } from "react";
import { BookOpen, FileText, HeartHandshake, LibraryBig, Lightbulb, NotebookPen, Quote } from "lucide-react";
import QuoteMusicPlayer from "@/components/quote-music-player";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, chapterFallbackImages, novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { getPublicContentHref } from "@/lib/content-release";

export const dynamic = "force-dynamic";

const heroImage = "/assets/images/img4.jpg";

function formatDate(date?: Date | null) {
  if (!date) return "Belum dijadwalkan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ReaderLandingPage() {
  const [blogs, novels] = await Promise.all([
    prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 3,
    }),
    prisma.novel.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 1,
      include: {
        chapters: {
          where: { status: "PUBLISHED" },
          orderBy: { chapterNumber: "desc" },
          take: 3,
          include: {
            slides: {
              where: { imageUrl: { not: null } },
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  const featuredNovel = novels[0];
  const latestChapters = featuredNovel?.chapters ?? [];
  const latestNovelUpdate = featuredNovel?.chapters[0]?.publishedAt || featuredNovel?.publishedAt;
  const displayBlogs = await Promise.all(
    blogs.map(async (blog, index) => ({
      ...blog,
      thumbnailUrl: await resolvePublicImageUrl(blog.thumbnailUrl, blogFallbackImages[index % blogFallbackImages.length]),
    }))
  );
  const featuredNovelCover = featuredNovel
    ? await resolvePublicImageUrl(featuredNovel.coverUrl, novelFallbackImages[0])
    : null;
  const displayChapters = await Promise.all(
    latestChapters.map(async (chapter, index) => ({
      ...chapter,
      thumbnailUrl: await resolvePublicImageUrl(
        chapter.thumbnailUrl || chapter.slides[0]?.imageUrl,
        chapterFallbackImages[index % chapterFallbackImages.length],
      ),
    })),
  );

  return (
    <div className="reader-bg">
      <section className="reader-hero reader-hero-stage px-4 py-16 md:py-24">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center">
          <div className="max-w-2xl">
            <h1 className="reader-hero-title text-[32px] font-bold leading-tight md:text-5xl">
              Ruang sederhana bagi kata, kisah, dan
              <span className="reader-accent reader-hero-accent"> segala yang terpikirkan </span>
            </h1>
            <p className="reader-muted reader-hero-copy mt-6 max-w-md text-base leading-8 md:text-lg">
              Sisakan waktu bagimu untuk menuangkan cerita. Terkadang, manusia hanya perlu bercerita, entah dimana atau dengan siapa anda bercerita
            </p>
            <div className="reader-hero-actions mt-8 flex flex-wrap gap-4">
              <a href={getPublicContentHref("blog")} className="reader-button reader-hero-cta inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm font-bold shadow-sm">
                <BookOpen size={17} />
                Baca Blog
              </a>
              <a href={getPublicContentHref("novel")} className="reader-button-secondary reader-hero-cta reader-hero-cta-secondary inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm font-bold">
                <FileText size={17} />
                Baca Novel
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="reader-soft reader-feature-strip reader-section-divider px-4 py-12">
        <div className="reader-feature-grid mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<NotebookPen />} title="Untaian Kalimat Ringan" text="Menuangkan segala pikiran ke dalam sebuah kalimat adalah salah satu usaha untuk meringankan pikiran" href={getPublicContentHref("blog")} action="Jelajahi Untaian" />
          <FeatureCard icon={<LibraryBig />} title="Beragam Cerita" text="Aku bingung membuat cerita apa, sungguh. Aku hanya memikirkan dia seorang" href={getPublicContentHref("novel")} action="Jelajahi Cerita" />
          <FeatureCard icon={<Lightbulb />} title="Momen Kehidupan" text="Hidup itu berat, kamu hanya perlu menemukan seseorang yang pas untuk menemani. Lalu hidup akan terasa ringan" href={getPublicContentHref("blog")} action="Jelajahi Dunia" />
          <FeatureCard icon={<HeartHandshake />} title="Tentang Saya" text="Aku adalah aku, bagaimana aku mencintaimu biarlah urusanku. Bagaimana kamu kepadaku, terserah itu urusanmu (Ayah Pidi Baiq)" href="#tentang" action="Tentang Saya" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <article>
          <SectionTitle title="Tulisan Terbaru" href={getPublicContentHref("blog")} label="Lihat semua blog" />
          <div className="mt-8 grid gap-10">
            {displayBlogs.length === 0 ? <EmptyState text="Belum ada blog published." /> : null}
            {displayBlogs.map((blog, index) => (
              <a key={blog.id} href={getPublicContentHref("blog", `/${blog.slug}`)} className="reader-card-link group grid gap-5 rounded-xl p-2 sm:grid-cols-[150px_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[var(--reader-surface-soft)]">
                  <img src={blog.thumbnailUrl} alt={blog.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="py-1">
                  <h3 className="text-xl font-semibold leading-snug group-hover:text-[var(--reader-primary)]">{blog.title}</h3>
                  <p className="reader-muted mt-2 text-xs font-medium">
                    {formatDate(blog.publishedAt)}
                  </p>
                  <p className="reader-muted mt-3 line-clamp-2 text-sm leading-7">{blog.excerpt || plainText(blog.content) || "Tanpa excerpt."}</p>
                </div>
              </a>
            ))}
          </div>
        </article>

        <article>
          <SectionTitle title="Novel Terbaru" href={getPublicContentHref("novel")} label="Lihat semua novel" />
          {featuredNovel ? (
            <div className="reader-surface reader-card-lift mt-8 rounded-2xl border p-5 sm:p-6">
              <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--reader-surface-soft)] shadow-sm">
                  <img src={featuredNovelCover || novelFallbackImages[0]} alt={featuredNovel.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold leading-tight">{featuredNovel.title}</h3>
                  <p className="reader-novel-genre mt-2 text-sm font-medium">{featuredNovel.genre || "Novel"}</p>
                  <p className="reader-muted mt-4 line-clamp-3 text-sm leading-7">{featuredNovel.summary}</p>
                  <a href={getPublicContentHref("novel", `/${featuredNovel.slug}`)} className="reader-novel-cta mt-5 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold">
                    Baca Sekarang
                  </a>
                  <p className="reader-muted mt-4 text-xs font-medium">
                    {featuredNovel.chapters.length} Bab <span className="px-2">•</span> Update terbaru {formatDate(latestNovelUpdate)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {latestChapters.length === 0 ? <EmptyState text="Belum ada chapter published." /> : null}
                {displayChapters.map((chapter) => (
                  <a key={chapter.id} href={getPublicContentHref("novel", `/${featuredNovel.slug}/chapter/${chapter.slug}`)} className="reader-chapter-link grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-[var(--reader-surface-soft)]">
                      <img src={chapter.thumbnailUrl} alt={chapter.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Bab {chapter.chapterNumber} - {chapter.title}</p>
                      <p className="reader-muted mt-1 line-clamp-1 text-xs">{plainText(chapter.content) || "Chapter novel."}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8"><EmptyState text="Belum ada novel published." /></div>
          )}
        </article>
      </section>

      <section id="tentang" className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <div className="reader-panel relative grid items-center gap-8 overflow-hidden rounded-2xl border p-8 md:grid-cols-[1.25fr_0.75fr] md:p-16">
          <div>
            <Quote className="reader-cyan" size={35} />
            <p className="mt-5 text-2xl italic leading-10 md:text-2xl">
              Hidup memang selalu dikelilingi oleh kata "Semoga". Dan, harapan selalu menjadi tujuan hidup manusia. Tidak ada yang lebih indah dari dua orang yang saling mendoakan hal yang baik.
            </p>
            <h3 className="mt-3"><i>
              (Bandung After Rain)
            </i></h3>
          </div>
          <div className="hidden md:block">
            <img src={heroImage} alt="Crisman" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-xl object-cover opacity-85" />
          </div>
          <QuoteMusicPlayer src="/assets/audio/quote-music.mp3" targetId="tentang" />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--reader-border)" }}>
      <h2 className="inline-flex items-center gap-2 text-base font-semibold">
        {title}
      </h2>
      <a href={href} className="reader-view-all reader-primary text-sm font-bold">
        {label}
      </a>
    </div>
  );
}

function FeatureCard({ icon, title, text, href, action }: { icon: ReactNode; title: string; text: string; href: string; action: string }) {
  return (
    <a href={href} className="reader-feature-card reader-surface group flex flex-col rounded-lg border p-5">
      <div className="reader-feature-heading">
        <span className="reader-feature-icon" aria-hidden="true">{icon}</span>
        <h3 className="reader-feature-title text-base font-semibold">{title}</h3>
      </div>
      <p className="reader-muted mt-4 min-h-11 text-sm leading-6">{text}</p>
      <p className="reader-feature-action mt-auto pt-5 text-sm font-bold"><span>{action}</span></p>
    </a>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="reader-surface rounded-xl border border-dashed p-6 text-sm">{text}</p>;
}
