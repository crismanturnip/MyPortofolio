"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, List, Maximize2, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MusicPlayer, { type MusicTrack } from "@/components/music-player";
import { sanitizeRichText } from "@/lib/sanitize-html";

type ReaderSlide = {
  id: number;
  order: number;
  type: string;
  imageUrl: string | null;
  title: string | null;
  content: string | null;
  caption: string | null;
  altText: string | null;
};

type ReaderEpisode = {
  title: string;
  slug: string;
  chapterNumber: number;
  thumbnail: string | null;
  slideCount: number;
};

type StoryReaderProps = {
  story: {
    title: string;
    slug: string;
  };
  episode: {
    title: string;
    slug: string;
    chapterNumber: number;
  };
  slides: ReaderSlide[];
  episodes: ReaderEpisode[];
  previous: ReaderEpisode | null;
  next: ReaderEpisode | null;
  music?: MusicTrack | null;
  progressNamespace?: string;
  backHref?: string;
  chapterBasePath?: string;
};

function slideStorageKey(storySlug: string, episodeSlug: string) {
  return `crisman-reader-progress:${storySlug}:${episodeSlug}`;
}

function namespacedStorageKey(namespace: string, storySlug: string, episodeSlug: string) {
  const key = slideStorageKey(storySlug, episodeSlug);
  return namespace === "public" ? key : `${namespace}:${key}`;
}

function progressLabel(storySlug: string, episodeSlug: string, namespace = "public") {
  if (typeof window === "undefined") return "";
  const value = window.localStorage.getItem(namespacedStorageKey(namespace, storySlug, episodeSlug));
  if (!value) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? `Terakhir slide ${parsed + 1}` : "";
}

export default function StoryReader({ story, episode, slides, episodes, previous, next, music, progressNamespace = "public", backHref, chapterBasePath }: StoryReaderProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const endingIndex = slides.length;
  const isEnding = activeIndex === endingIndex;
  const storyHref = backHref || `/novel/${story.slug}`;
  const episodeHref = (slug: string) => chapterBasePath ? `${chapterBasePath}/${slug}` : `/novel/${story.slug}/chapter/${slug}`;

  const currentEpisodeIndex = useMemo(
    () => episodes.findIndex((item) => item.slug === episode.slug),
    [episode.slug, episodes]
  );

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const nextIndex = Math.max(0, Math.min(index, endingIndex));
    viewport.scrollTo({ left: nextIndex * viewport.clientWidth, behavior });
    setActiveIndex(nextIndex);
  }, [endingIndex]);

  useEffect(() => {
    const saved = window.localStorage.getItem(namespacedStorageKey(progressNamespace, story.slug, episode.slug));
    const savedIndex = saved ? Number(saved) : 0;
    if (Number.isFinite(savedIndex) && savedIndex > 0) {
      window.requestAnimationFrame(() => scrollToIndex(Math.min(savedIndex, slides.length - 1), "auto"));
    }
  }, [episode.slug, progressNamespace, scrollToIndex, slides.length, story.slug]);

  useEffect(() => {
    if (activeIndex < slides.length) {
      window.localStorage.setItem(namespacedStorageKey(progressNamespace, story.slug, episode.slug), String(activeIndex));
    }
  }, [activeIndex, episode.slug, progressNamespace, slides.length, story.slug]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame = 0;
    function onScroll() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!viewport) return;
        const index = Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
        setActiveIndex(Math.max(0, Math.min(index, endingIndex)));
      });
    }

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [endingIndex]);

  async function enterFullscreen() {
    const element = document.documentElement;
    if (!document.fullscreenElement && element.requestFullscreen) {
      await element.requestFullscreen().catch(() => null);
    }
  }

  return (
    <div className="reader-bg min-h-[calc(100vh-4rem)] px-3 py-4 sm:px-5 md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 md:max-w-[640px] md:gap-5 xl:max-w-[680px]">
        <ReaderChapterHeader story={story} episode={episode} episodes={episodes} progressNamespace={progressNamespace} backHref={backHref} chapterBasePath={chapterBasePath} onFullscreen={enterFullscreen} />

        <section className="reader-surface rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2">
            <span aria-hidden="true" />
            <div className="min-w-0 text-center">
              <p className="reader-muted text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Chapter {episode.chapterNumber}</p>
              <h1 className="mt-1 truncate text-lg font-bold leading-tight tracking-wide sm:text-xl">{episode.title}</h1>
            </div>
            <span className="reader-muted justify-self-end text-xs font-semibold tabular-nums">{Math.min(activeIndex + 1, slides.length)}/{slides.length}</span>
          </div>
        </section>

        {music ? <MusicPlayer track={music} compact /> : null}

        <div className="relative">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="reader-button-secondary absolute -left-14 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border disabled:cursor-not-allowed disabled:opacity-40 md:grid"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={viewportRef}
            className="story-reader-scroll flex h-[min(70vh,740px)] min-h-[520px] snap-x snap-mandatory items-start overflow-x-auto overflow-y-hidden rounded-2xl border border-[var(--reader-border)] bg-black/10 [scrollbar-width:none] [touch-action:pan-x_pan-y] max-sm:h-auto max-sm:min-h-0"
            aria-label="Area slide cerita"
          >
            {slides.map((slide) => (
              <StorySlide key={slide.id} slide={slide} />
            ))}
            <CompletionCard storyHref={storyHref} episodeHref={episodeHref} next={next} onReplay={() => scrollToIndex(0)} />
          </div>

          <button
            type="button"
            disabled={isEnding}
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="reader-button-secondary absolute -right-14 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border disabled:cursor-not-allowed disabled:opacity-40 md:grid"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="reader-button-secondary inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>
          {isEnding ? (
            next ? (
              <a href={episodeHref(next.slug)} className="reader-button inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold sm:text-sm">
                Episode Berikutnya
                <ArrowRight size={18} />
              </a>
            ) : (
              <a href={storyHref} className="reader-button inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold sm:text-sm">
                Daftar Episode
              </a>
            )
          ) : (
            <button type="button" onClick={() => scrollToIndex(activeIndex + 1)} className="reader-button inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold sm:text-sm">
              {activeIndex === slides.length - 1 ? "Selesai" : "Berikutnya"}
              <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

export function ReaderChapterHeader({ story, episode, episodes, progressNamespace = "public", backHref, chapterBasePath, onFullscreen }: Pick<StoryReaderProps, "story" | "episode" | "episodes" | "progressNamespace" | "backHref" | "chapterBasePath"> & { onFullscreen?: () => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const storyHref = backHref || `/novel/${story.slug}`;
  const episodeHref = (slug: string) => chapterBasePath ? `${chapterBasePath}/${slug}` : `/novel/${story.slug}/chapter/${slug}`;

  return <>
    <header className="reader-surface sticky top-[4.75rem] z-20 rounded-2xl border p-3 shadow-sm md:top-24">
      <div className="flex items-center justify-between gap-3">
        <a href={storyHref} className="reader-button-secondary grid h-10 w-10 shrink-0 place-items-center rounded-xl border" aria-label="Kembali ke daftar episode"><ArrowLeft size={18} /></a>
        <div className="min-w-0 flex-1 text-center"><p className="truncate text-sm font-semibold">{story.title}</p><p className="reader-muted truncate text-xs">Episode {episode.chapterNumber}: {episode.title}</p></div>
        <button type="button" onClick={() => setSheetOpen(true)} className="reader-button-secondary grid h-10 w-10 shrink-0 place-items-center rounded-xl border" aria-label="Buka daftar episode"><List size={18} /></button>
        {onFullscreen ? <button type="button" onClick={onFullscreen} className="reader-button-secondary hidden h-10 w-10 shrink-0 place-items-center rounded-xl border sm:grid" aria-label="Mode layar penuh"><Maximize2 size={17} /></button> : null}
      </div>
    </header>
    <EpisodeListSheet open={sheetOpen} onClose={() => setSheetOpen(false)} storySlug={story.slug} progressNamespace={progressNamespace} episodeHref={episodeHref} currentSlug={episode.slug} episodes={episodes} />
  </>;
}

function StorySlide({ slide }: { slide: ReaderSlide }) {
  const hasImage = slide.type !== "text" && slide.imageUrl;
  const hasText = slide.type !== "image" && (slide.title || slide.content || slide.caption);
  const layout = hasImage && hasText ? "image-text" : hasImage ? "image" : "text";

  return (
    <article className="flex min-w-full snap-center snap-always flex-col overflow-hidden bg-[var(--reader-surface-soft)] max-sm:self-start max-sm:overflow-visible">
      {hasImage ? (
        <div className={`${layout === "image-text" ? "h-[55%] border-b sm:h-[58%] max-sm:h-auto" : "min-h-0 flex-1"} grid overflow-hidden border-[var(--reader-border)] bg-black/5 p-2 sm:p-3`}>
          <img src={slide.imageUrl || ""} alt={slide.altText || slide.title || slide.caption || "Slide cerita"} className="h-full max-h-full w-full max-w-full place-self-center rounded-xl object-contain shadow-sm max-sm:max-h-[52vh] max-sm:min-h-0 sm:rounded-2xl" loading="lazy" />
        </div>
      ) : null}
      {hasText ? (
        <div className={`${layout === "text" ? "grid flex-1 place-items-center" : "min-h-0 flex-1 overflow-y-auto max-sm:overflow-visible"} p-4 sm:p-5`}>
          <div className="w-full rounded-2xl bg-[var(--reader-surface-soft)]">
            {slide.title ? <h2 className="text-lg font-semibold leading-tight sm:text-xl">{slide.title}</h2> : null}
            {slide.content ? <div className="reader-content reader-muted mt-3 text-sm leading-7 sm:text-base sm:leading-8" dangerouslySetInnerHTML={{ __html: sanitizeRichText(slide.content) }} /> : null}
            {slide.caption ? <p className="reader-cyan mt-4 text-sm font-semibold">{slide.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CompletionCard({ storyHref, episodeHref, next, onReplay }: { storyHref: string; episodeHref: (slug: string) => string; next: ReaderEpisode | null; onReplay: () => void }) {
  return (
    <article className="grid min-w-full snap-center snap-always place-items-center bg-[var(--reader-surface-soft)] p-6 text-center">
      <div>
        <CheckCircle2 className="reader-cyan mx-auto" size={46} />
        <h2 className="mt-5 text-2xl font-semibold">Kamu telah menyelesaikan episode ini</h2>
        {next ? <p className="reader-muted mt-3">Episode berikutnya: Ch {next.chapterNumber}: {next.title}</p> : <p className="reader-muted mt-3">Belum ada episode berikutnya.</p>}
        <div className="mt-6 grid gap-3">
          {next ? (
            <a href={episodeHref(next.slug)} className="reader-button inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold">
              Lanjut ke Episode Berikutnya
              <ArrowRight size={17} />
            </a>
          ) : null}
          <a href={storyHref} className="reader-button-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold">
            <BookOpen size={17} />
            Kembali ke Daftar Episode
          </a>
          <button type="button" onClick={onReplay} className="reader-button-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold">
            <RotateCcw size={17} />
            Baca Ulang
          </button>
        </div>
      </div>
    </article>
  );
}

function EpisodeListSheet({
  open,
  onClose,
  storySlug,
  progressNamespace,
  episodeHref,
  currentSlug,
  episodes,
}: {
  open: boolean;
  onClose: () => void;
  storySlug: string;
  progressNamespace: string;
  episodeHref: (slug: string) => string;
  currentSlug: string;
  episodes: ReaderEpisode[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Daftar episode">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label="Tutup daftar episode" />
      <div className="reader-surface absolute inset-x-3 bottom-3 mx-auto max-h-[78vh] max-w-[520px] overflow-hidden rounded-3xl border shadow-2xl md:inset-y-8 md:right-8 md:left-auto md:w-[420px]">
        <div className="flex items-center justify-between border-b border-[var(--reader-border)] p-4">
          <div>
            <h2 className="font-semibold">Daftar Episode</h2>
            <p className="reader-muted text-sm">{episodes.length} episode tersedia</p>
          </div>
          <button type="button" onClick={onClose} className="reader-button-secondary grid h-10 w-10 place-items-center rounded-xl border" aria-label="Tutup daftar episode">
            <X size={18} />
          </button>
        </div>
        <div className="grid max-h-[calc(78vh-5rem)] gap-3 overflow-y-auto p-4">
          {episodes.map((item) => {
            const active = item.slug === currentSlug;
            const saved = progressLabel(storySlug, item.slug, progressNamespace);
            return (
              <a key={item.slug} href={episodeHref(item.slug)} className={`grid grid-cols-[64px_1fr] gap-3 rounded-2xl border p-3 ${active ? "border-[var(--reader-cyan)]" : "border-[var(--reader-border)]"}`}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="aspect-[3/4] rounded-xl object-cover" loading="lazy" />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center rounded-xl bg-[var(--reader-surface-soft)] text-xs font-semibold">Ch {item.chapterNumber}</div>
                )}
                <div>
                  <p className="text-sm font-semibold">Ch {item.chapterNumber}: {item.title}</p>
                  <p className="reader-muted mt-1 text-xs">{item.slideCount} slide</p>
                  <p className="mt-2 text-xs font-semibold">{active ? "Sedang dibaca" : saved || "Belum dibaca"}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
