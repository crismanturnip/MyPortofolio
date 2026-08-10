import { notFound } from "next/navigation";
import ChapterForm from "@/components/admin/chapter-form";
import { prisma } from "@/lib/prisma";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export default async function EditChapterPage({ params }: Props) { const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const [chapter, novels] = await Promise.all([prisma.chapter.findUnique({ where: { id }, include: { slides: { orderBy: { order: "asc" } } } }), prisma.novel.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, musicTitle: true, musicArtist: true, musicUrl: true, musicVolume: true } })]); if (!chapter) notFound(); return <ChapterForm initial={chapter} novels={novels} />; }
