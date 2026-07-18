import { BookOpen, FileText, Layers3, Plus } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/admin-ui";
import { formatAdminDate } from "@/components/admin/utils";
import type { PublishStatus } from "@/components/admin/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [blogCount, novelCount, chapterCount, draftBlogs, draftNovels, draftChapters, blogs, novels, chapters] = await Promise.all([
    prisma.blog.count(), prisma.novel.count(), prisma.chapter.count(),
    prisma.blog.count({ where: { status: "DRAFT" } }), prisma.novel.count({ where: { status: "DRAFT" } }), prisma.chapter.count({ where: { status: "DRAFT" } }),
    prisma.blog.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, status: true, updatedAt: true } }),
    prisma.novel.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, status: true, updatedAt: true } }),
    prisma.chapter.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, status: true, updatedAt: true } }),
  ]);
  const recent = [
    ...blogs.map((item) => ({ ...item, kind: "Blog", href: `/admin/blogs/${item.id}/edit` })),
    ...novels.map((item) => ({ ...item, kind: "Novel", href: `/admin/novels/${item.id}/edit` })),
    ...chapters.map((item) => ({ ...item, kind: "Chapter", href: `/admin/chapters/${item.id}/edit` })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6);

  return <div className="grid gap-6">
    <PageHeader title="Dashboard" description="Ringkasan konten dan akses cepat ke pekerjaan yang paling sering dilakukan." />
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard icon={<FileText size={20} />} label="Blog" count={blogCount} draft={draftBlogs} href="/admin/blogs" />
      <SummaryCard icon={<BookOpen size={20} />} label="Novel" count={novelCount} draft={draftNovels} href="/admin/novels" />
      <SummaryCard icon={<Layers3 size={20} />} label="Chapter" count={chapterCount} draft={draftChapters} href="/admin/novels" />
    </div>
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Akses cepat</h2><p className="text-sm text-slate-500">Mulai membuat konten baru.</p></div><div className="flex gap-2"><QuickLink href="/admin/blogs/new" label="Blog baru" /><QuickLink href="/admin/novels/new" label="Novel baru" /></div></div>
    </section>
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-4 py-4 sm:px-5"><h2 className="font-black text-slate-900">Terakhir diperbarui</h2></div>{recent.length ? <div className="divide-y divide-slate-100">{recent.map((item) => <a key={`${item.kind}-${item.id}`} href={item.href} className="grid gap-2 px-4 py-3 transition hover:bg-slate-50 sm:grid-cols-[7rem_minmax(0,1fr)_8rem_9rem] sm:items-center sm:px-5"><span className="text-xs font-bold uppercase text-slate-400">{item.kind}</span><span className="truncate font-bold text-slate-800">{item.title}</span><StatusBadge status={item.status as PublishStatus} /><span className="text-xs text-slate-500">{formatAdminDate(item.updatedAt)}</span></a>)}</div> : <p className="p-6 text-sm text-slate-500">Belum ada konten.</p>}</section>
  </div>;
}

function SummaryCard({ icon, label, count, draft, href }: { icon: React.ReactNode; label: string; count: number; draft: number; href: string }) {
  return <a href={href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"><div className="flex items-center justify-between text-slate-500"><span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-800">{icon}</span><span className="text-xs font-bold">{draft} draft</span></div><p className="mt-5 text-3xl font-black text-slate-950">{count}</p><p className="text-sm font-bold text-slate-500">{label}</p></a>;
}

function QuickLink({ href, label }: { href: string; label: string }) { return <a href={href} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"><Plus size={16} />{label}</a>; }
