import { notFound } from "next/navigation";
import NovelForm from "@/components/admin/novel-form";
import { prisma } from "@/lib/prisma";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export default async function EditNovelPage({ params }: Props) { const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const novel = await prisma.novel.findUnique({ where: { id } }); if (!novel) notFound(); return <NovelForm initial={novel} />; }
