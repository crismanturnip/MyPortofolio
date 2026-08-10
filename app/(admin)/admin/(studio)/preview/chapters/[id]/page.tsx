import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MusicPlayer, { type MusicTrack } from "@/components/music-player";
import StoryReader, { ReaderChapterHeader } from "@/components/story-reader";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/sanitize-html";

export const metadata: Metadata = { title: "Preview Chapter", robots: { index: false, follow: false } };
type Props = { params: Promise<{ id: string }> };

export default async function ChapterPreviewPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const chapter = await prisma.chapter.findUnique({ where: { id }, include: { novel: true, slides: { orderBy: { order: "asc" } } } });
  if (!chapter) notFound();
  const siblings = await prisma.chapter.findMany({ where: { novelId: chapter.novelId }, orderBy: { chapterNumber: "asc" }, include: { slides: { orderBy: { order: "asc" } } } });
  const episodes = siblings.map((item) => ({ title: item.title, slug: String(item.id), chapterNumber: item.chapterNumber, thumbnail: item.slides.find((slide) => slide.imageUrl)?.imageUrl || null, slideCount: item.slides.length }));
  const index = siblings.findIndex((item) => item.id === chapter.id);
  const music: MusicTrack | null = chapter.musicUrl ? { title: chapter.musicTitle, artist: chapter.musicArtist, url: chapter.musicUrl, volume: chapter.musicVolume, source: "chapter" } : chapter.novel.musicUrl ? { title: chapter.novel.musicTitle, artist: chapter.novel.musicArtist, url: chapter.novel.musicUrl, volume: chapter.novel.musicVolume, source: "novel" } : null;

  if (chapter.slides.length) return <div className="reader-shell reader-shell-dark -m-4 min-h-screen sm:-m-6"><StoryReader story={{ title: chapter.novel.title, slug: chapter.novel.slug }} episode={{ title: chapter.title, slug: String(chapter.id), chapterNumber: chapter.chapterNumber }} slides={chapter.slides} episodes={episodes} previous={index > 0 ? episodes[index - 1] : null} next={index < episodes.length - 1 ? episodes[index + 1] : null} music={music} progressNamespace="admin-preview" backHref={`/admin/preview/novels/${chapter.novelId}`} chapterBasePath="/admin/preview/chapters" /></div>;

  return <div className="reader-shell reader-shell-dark -m-4 min-h-screen p-4 sm:-m-6 sm:p-6"><article className="mx-auto max-w-[760px]"><ReaderChapterHeader story={{ title: chapter.novel.title, slug: chapter.novel.slug }} episode={{ title: chapter.title, slug: String(chapter.id), chapterNumber: chapter.chapterNumber }} episodes={episodes} progressNamespace="admin-preview" backHref={`/admin/preview/novels/${chapter.novelId}`} chapterBasePath="/admin/preview/chapters" /><p className="reader-badge mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold">Preview admin · {chapter.status}</p><header className="py-8 text-center"><p className="reader-muted text-sm uppercase">{chapter.novel.title}</p><h1 className="mt-3 text-4xl font-bold">{chapter.title}</h1></header>{music ? <MusicPlayer track={music} /> : null}<div className="reader-article mt-6 rounded-2xl border p-6 sm:p-9"><div className="reader-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(chapter.content) }} /></div></article></div>;
}
