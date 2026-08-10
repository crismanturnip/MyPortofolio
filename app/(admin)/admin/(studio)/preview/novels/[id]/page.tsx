import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MusicPlayer from "@/components/music-player";
import { novelFallbackImages, resolvePublicImageUrl } from "@/lib/public-images";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Preview Novel", robots: { index: false, follow: false } };
type Props = { params: Promise<{ id: string }> };
export default async function NovelPreviewPage({ params }: Props) {
  const id = Number((await params).id); if (!Number.isInteger(id)) notFound();
  const novel = await prisma.novel.findUnique({ where: { id }, include: { chapters: { orderBy: { chapterNumber: "asc" } } } });
  if (!novel) notFound();
  const cover = await resolvePublicImageUrl(novel.coverUrl, novelFallbackImages[0]);
  return <div className="reader-shell reader-shell-dark -m-4 min-h-screen p-4 sm:-m-6 sm:p-6"><div className="mx-auto max-w-5xl"><p className="reader-badge mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold">Preview admin · {novel.status}</p><section className="reader-surface grid gap-7 rounded-2xl border p-5 md:grid-cols-[240px_1fr] md:p-8"><img src={cover} alt={novel.title} className="aspect-[3/4] w-full rounded-xl object-cover" /><div className="self-center"><p className="reader-cyan text-xs font-bold uppercase">{novel.genre || "Novel"}</p><h1 className="mt-3 text-4xl font-bold">{novel.title}</h1><p className="reader-muted mt-4 leading-8">{novel.summary}</p>{novel.musicUrl ? <div className="mt-6"><MusicPlayer track={{ title: novel.musicTitle, artist: novel.musicArtist, url: novel.musicUrl, volume: novel.musicVolume, source: "novel" }} /></div> : null}</div></section><section className="reader-surface mt-5 rounded-2xl border p-5"><h2 className="text-xl font-bold">Daftar chapter</h2><div className="mt-3 divide-y divide-[var(--reader-border)]">{novel.chapters.map((chapter) => <a key={chapter.id} href={`/admin/preview/chapters/${chapter.id}`} className="reader-chapter-link flex justify-between gap-3 py-3"><span>Chapter {chapter.chapterNumber}: {chapter.title}</span><span className="reader-muted text-xs">{chapter.status}</span></a>)}</div></section></div></div>;
}
