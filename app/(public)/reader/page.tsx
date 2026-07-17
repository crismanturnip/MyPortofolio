import { ArrowRight, BookOpen, Coffee, Feather, FileText, Heart, Quote, Sparkles } from "lucide-react";
import QuoteMusicPlayer from "@/components/quote-music-player";
import { prisma } from "@/lib/prisma";
import { blogFallbackImages, chapterFallbackImages, novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";

export const dynamic = "force-dynamic";

const heroImage = "/assets/images/img4.jpg";

function formatDate(date?: Date | null) {
  if (!date) return "Belum dijadwalkan";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
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
    ? await resolvePublicImageUrl(featuredNovel.coverUrl, novelFallbackImages[1])
    : null;

  return (
    <div className="reader-bg">
      <section className="reader-hero px-4 py-20 md:py-28">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center">
          <div className="max-w-2xl">
            <h1 className="mt-7 text-[32px] font-bold leading-tight md:text-5xl">
              Ruang sederhana bagi kata, kisah, dan
              <span className="reader-accent"> segala yang dipikirkan</span>
            </h1>
            <p className="reader-muted mt-6 max-w-md text-base leading-8 md:text-lg">
              Tempat pengalaman menjadi tulisan dan imajinasi tumbuh menjadi cerita
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/blog" className="reader-button inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm font-bold shadow-sm">
                <BookOpen size={17} />
                Baca Blog
              </a>
              <a href="/novel" className="reader-button-secondary inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm font-bold">
                <FileText size={17} />
                Baca Novel
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="reader-soft reader-feature-strip px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Coffee size={22} />} title="Personal Blog" text="Tulisan, pemikiran, dan pengalaman pribadi." href="/blog" action="Jelajahi Blog" />
          <FeatureCard icon={<BookOpen size={22} />} title="Koleksi Novel" text="Kumpulan cerita fiksi dan dunia imajinasi." href="/novel" action="Jelajahi Novel" />
          <FeatureCard icon={<Feather size={22} />} title="Cerita & Inspirasi" text="Ide, refleksi, dan hal-hal yang menginspirasi." href="/blog" action="Baca Sekarang" />
          <FeatureCard icon={<Heart size={22} />} title="Dibuat dengan Hati" text="Setiap tulisan dibuat dengan niat dan cinta." href="#tentang" action="Tentang Saya" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <article>
          <SectionTitle icon={<FileText size={18} />} title="Tulisan Terbaru" href="/blog" label="Lihat semua blog" />
          <div className="mt-8 grid gap-10">
            {displayBlogs.length === 0 ? <EmptyState text="Belum ada blog published." /> : null}
            {displayBlogs.map((blog, index) => (
              <a key={blog.id} href={`/blog/${blog.slug}`} className="group grid gap-5 rounded-xl p-2 transition hover:bg-white/5 sm:grid-cols-[150px_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[var(--reader-surface-soft)]">
                  <img src={blog.thumbnailUrl} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="py-1">
                  <h3 className="text-xl font-semibold leading-snug group-hover:text-[var(--reader-primary)]">{blog.title}</h3>
                  <p className="reader-muted mt-2 text-xs font-medium">
                    {formatDate(blog.publishedAt)} <span className="px-2">•</span> {readingTime(blog.content)}
                  </p>
                  <p className="reader-muted mt-3 line-clamp-2 text-sm leading-7">{blog.excerpt || plainText(blog.content) || "Tanpa excerpt."}</p>
                </div>
              </a>
            ))}
          </div>
        </article>

        <article>
          <SectionTitle icon={<BookOpen size={18} />} title="Novel Terbaru" href="/novel" label="Lihat semua novel" />
          {featuredNovel ? (
            <div className="reader-surface mt-8 rounded-2xl border p-6">
              <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--reader-surface-soft)] shadow-sm">
                  <img src={featuredNovelCover || novelFallbackImages[1]} alt={featuredNovel.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold leading-tight">{featuredNovel.title}</h3>
                  <p className="reader-cyan mt-2 text-xs font-bold">{featuredNovel.genre || "Novel"}</p>
                  <p className="reader-muted mt-4 line-clamp-3 text-sm leading-7">{featuredNovel.summary}</p>
                  <a href={`/novel/${featuredNovel.slug}`} className="reader-button mt-5 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-bold">
                    Baca Sekarang
                  </a>
                  <p className="reader-muted mt-4 text-xs font-medium">
                    {featuredNovel.chapters.length} Bab <span className="px-2">•</span> Update terbaru {formatDate(latestNovelUpdate)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {latestChapters.length === 0 ? <EmptyState text="Belum ada chapter published." /> : null}
                {latestChapters.map((chapter, index) => (
                  <a key={chapter.id} href={`/novel/${featuredNovel.slug}/chapter/${chapter.slug}`} className="grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-lg p-2 transition hover:bg-white/5">
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-[var(--reader-surface-soft)]">
                      <img src={chapterFallbackImages[index % chapterFallbackImages.length]} alt={chapter.title} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Bab {chapter.chapterNumber} - {chapter.title}</p>
                      <p className="reader-muted mt-1 line-clamp-1 text-xs">{plainText(chapter.content) || "Chapter novel."}</p>
                    </div>
                    {index === 0 ? <span className="reader-badge rounded-full border px-3 py-1 text-xs font-bold">Baru</span> : null}
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
            <img src={heroImage} alt="Crisman" className="aspect-[4/3] w-full rounded-xl object-cover opacity-85" />
          </div>
          <QuoteMusicPlayer src="/assets/audio/quote-music.mp3" targetId="tentang" />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon, title, href, label }: { icon: React.ReactNode; title: string; href: string; label: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--reader-border)" }}>
      <h2 className="inline-flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h2>
      <a href={href} className="reader-primary text-sm font-bold hover:text-[var(--reader-cyan)]">
        {label} →
      </a>
    </div>
  );
}

function FeatureCard({ icon, title, text, href, action }: { icon: React.ReactNode; title: string; text: string; href: string; action: string }) {
  return (
    <a href={href} className="reader-surface group rounded-2xl border p-6 transition hover:-translate-y-1">
      <div className="reader-badge grid h-12 w-12 place-items-center rounded-full border">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="reader-muted mt-2 min-h-11 text-sm leading-6">{text}</p>
      <p className="reader-primary mt-4 inline-flex items-center gap-1 text-sm font-bold">
        {action}
      </p>
    </a>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="reader-surface rounded-xl border border-dashed p-6 text-sm">{text}</p>;
}
