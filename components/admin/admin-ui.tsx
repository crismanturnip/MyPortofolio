"use client";

import { AlertCircle, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api-client";
import type { PublishStatus } from "@/components/admin/types";

export const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";
export const textareaClass =
  "min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">{children}</span>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: PublishStatus }) {
  const published = status === "PUBLISHED";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} />{label}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-bold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

export function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{message}</div>;
}

export function DeleteButton({ endpoint, label, onDeleted }: { endpoint: string; label: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm(`Hapus ${label}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setLoading(true);
    setError("");
    try {
      await adminRequest(endpoint, { method: "DELETE" });
      onDeleted?.();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data gagal dihapus.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={remove} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60">
        {loading ? <LoaderCircle className="animate-spin" size={14} /> : <Trash2 size={14} />}
        Hapus
      </button>
      {error ? <p className="mt-1 max-w-52 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
