import { notFound } from "next/navigation";
import ChapterForm from "@/components/admin/chapter-form";
import { prisma } from "@/lib/prisma";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export default async function NewChapterPage({ params }: Props) { const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const novels = await prisma.novel.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, musicTitle: true, musicArtist: true, musicUrl: true, musicVolume: true } }); if (!novels.some((novel) => novel.id === id)) notFound(); return <ChapterForm novels={novels} defaultNovelId={id} />; }
