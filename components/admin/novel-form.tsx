"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api-client";
import { ErrorNotice, FieldLabel, inputClass, PageHeader, StatusBadge, textareaClass } from "@/components/admin/admin-ui";
import ImageUpload from "@/components/admin/image-upload";
import MusicFields from "@/components/admin/music-fields";
import type { NovelEditorData, PublishStatus } from "@/components/admin/types";

export default function NovelForm({ initial }: { initial?: NovelEditorData }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: initial?.title || "", slug: initial?.slug || "", summary: initial?.summary || "", genre: initial?.genre || "", coverUrl: initial?.coverUrl || "", musicTitle: initial?.musicTitle || "", musicArtist: initial?.musicArtist || "", musicUrl: initial?.musicUrl || "", status: (initial?.status || "DRAFT") as PublishStatus });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(status: PublishStatus) {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await adminRequest<{ message: string; data: { id: number } }>(initial ? `/api/admin/novels/${initial.id}` : "/api/admin/novels", { method: initial ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status }) });
      setForm((current) => ({ ...current, status }));
      setMessage(result.message);
      if (!initial) router.replace(`/admin/novels/${result.data.id}/edit`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Novel gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader title={initial ? "Edit Novel" : "Buat Novel"} description="Kelola identitas novel, cover, genre, sinopsis, dan status publikasi." action={<div className="flex gap-2">{initial ? <a href={`/admin/preview/novels/${initial.id}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700">Preview</a> : null}<a href="/admin/novels" className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold">Kembali ke daftar</a></div>} />
      {error ? <ErrorNotice message={error} /> : null}
      {message ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ImageUpload label="Cover novel" value={form.coverUrl} onChange={(coverUrl) => setForm({ ...form, coverUrl })} kind="cover" portrait /></section>
        <section className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label><FieldLabel>Judul</FieldLabel><input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <div className="grid gap-4 md:grid-cols-2"><label><FieldLabel>Slug</FieldLabel><input className={inputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Kosongkan untuk otomatis" /></label><label><FieldLabel>Genre</FieldLabel><input className={inputClass} value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} placeholder="Fantasi, Drama" /></label></div>
          <label><FieldLabel>Sinopsis</FieldLabel><textarea className={`${textareaClass} min-h-52`} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
        </section>
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-black">Publikasi</h2><StatusBadge status={form.status} /></div>
          <label className="mt-4 block"><FieldLabel>Status</FieldLabel><select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PublishStatus })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label>
          <div className="mt-4 grid gap-2"><button type="button" disabled={saving || !form.title.trim() || !form.summary.trim()} onClick={() => save("DRAFT")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 font-bold disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}Simpan draft</button><button type="button" disabled={saving || !form.title.trim() || !form.summary.trim()} onClick={() => save("PUBLISHED")} className="h-10 rounded-lg bg-blue-600 font-bold text-white disabled:opacity-60">Publikasikan</button></div>
          {initial ? <a href={`/admin/novels/${initial.id}/chapters`} className="mt-4 flex h-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">Kelola chapter</a> : null}
        </aside>
      </div>
      <MusicFields title="Musik Novel" description="Musik ini menjadi fallback untuk chapter yang tidak memiliki musik sendiri. Tidak akan diputar otomatis." value={form} onChange={(music) => setForm({ ...form, ...music })} />
    </div>
  );
}
