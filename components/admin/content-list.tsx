"use client";

import { Edit3, ListTree } from "lucide-react";
import { DeleteButton, EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import { formatAdminDate } from "@/components/admin/utils";
import type { PublishStatus } from "@/components/admin/types";

export type AdminListItem = {
  id: number;
  title: string;
  slug: string;
  status: PublishStatus;
  updatedAt: string;
  createdAt?: string;
  detail?: string;
  taxonomy?: string;
  editHref: string;
  chaptersHref?: string;
  deleteEndpoint: string;
  deleteLabel: string;
};

export default function ContentList({ items, emptyTitle, emptyDescription }: { items: AdminListItem[]; emptyTitle: string; emptyDescription: string }) {
  if (!items.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.7fr)_9rem_11rem_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500 md:grid"><span>Konten</span><span>Detail</span><span>Status</span><span>Diperbarui</span><span>Aksi</span></div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <article key={item.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.7fr)_9rem_11rem_auto] md:items-center md:gap-4">
            <div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{item.title}</h2><p className="mt-1 truncate text-xs text-slate-500">/{item.slug}</p>{item.taxonomy ? <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.taxonomy}</p> : null}</div>
            <p className="text-sm text-slate-600">{item.detail || "-"}</p>
            <div><StatusBadge status={item.status} /></div>
            <div className="text-xs text-slate-500"><p>{formatAdminDate(item.updatedAt)}</p>{item.createdAt ? <p className="mt-1">Dibuat {formatAdminDate(item.createdAt)}</p> : null}</div>
            <div className="flex flex-wrap items-start gap-2"><a href={item.editHref} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700"><Edit3 size={14} />Edit</a>{item.chaptersHref ? <a href={item.chaptersHref} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700"><ListTree size={14} />Chapter</a> : null}<DeleteButton endpoint={item.deleteEndpoint} label={item.deleteLabel} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}
