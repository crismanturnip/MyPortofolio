"use client";

import { ArrowDown, ArrowUp, ImageIcon, LoaderCircle, Plus, Save, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest, uploadAdminImage } from "@/components/admin/api-client";
import { ErrorNotice, FieldLabel, inputClass, PageHeader, StatusBadge } from "@/components/admin/admin-ui";
import type { ChapterEditorData, ChapterSlideData, NovelOption, PublishStatus } from "@/components/admin/types";
import RichTextEditor from "@/components/rich-text-editor";
import MusicFields from "@/components/admin/music-fields";

function clientId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function ChapterForm({ initial, novels, defaultNovelId }: { initial?: ChapterEditorData; novels: NovelOption[]; defaultNovelId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState({
    novelId: initial?.novelId || defaultNovelId || 0,
    title: initial?.title || "",
    slug: initial?.slug || "",
    chapterNumber: initial?.chapterNumber || 1,
    content: initial?.content || "<p>Mulai menulis chapter novel di sini.</p>",
    thumbnailUrl: initial?.thumbnailUrl || "",
    musicTitle: initial?.musicTitle || "",
    musicArtist: initial?.musicArtist || "",
    musicUrl: initial?.musicUrl || "",
    musicVolume: initial?.musicVolume ?? 35,
    status: (initial?.status || "DRAFT") as PublishStatus,
    slides: initial?.slides.map((slide) => ({ id: slide.id, clientId: clientId(), order: slide.order, type: slide.type as ChapterSlideData["type"], imageUrl: slide.imageUrl || "", title: slide.title || "", content: slide.content || "", caption: slide.caption || "", altText: slide.altText || "" })) || [] as ChapterSlideData[],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function addSlide(type: ChapterSlideData["type"]) {
    setForm((current) => ({ ...current, slides: [...current.slides, { clientId: clientId(), order: current.slides.length + 1, type, imageUrl: "", title: "", content: type === "text" ? "Tulis narasi slide di sini." : "", caption: "", altText: "" }] }));
  }

  function updateSlide(index: number, patch: Partial<ChapterSlideData>) {
    setForm((current) => ({ ...current, slides: current.slides.map((slide, position) => position === index ? { ...slide, ...patch } : slide) }));
  }

  function removeSlide(index: number) {
    if (!window.confirm("Hapus slide ini?")) return;
    setForm((current) => ({ ...current, slides: current.slides.filter((_, position) => position !== index).map((slide, position) => ({ ...slide, order: position + 1 })) }));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.slides.length) return current;
      const slides = [...current.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...current, slides: slides.map((slide, position) => ({ ...slide, order: position + 1 })) };
    });
  }

  async function save(status: PublishStatus) {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await adminRequest<{ message: string; data: { id: number; novelId: number } }>(initial ? `/api/admin/chapters/${initial.id}` : "/api/admin/chapters", { method: initial ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status, slides: form.slides.map((slide, index) => ({ ...slide, order: index + 1 })) }) });
      setForm((current) => ({ ...current, status }));
      setMessage(result.message);
      if (!initial) router.replace(`/admin/chapters/${result.data.id}/edit`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chapter gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  const backNovelId = initial?.novelId || defaultNovelId || form.novelId;
  const selectedNovel = novels.find((novel) => novel.id === form.novelId);
  const novelMusic = selectedNovel ? { musicTitle: selectedNovel.musicTitle || "", musicArtist: selectedNovel.musicArtist || "", musicUrl: selectedNovel.musicUrl || "", musicVolume: selectedNovel.musicVolume ?? 35 } : null;

  return (
    <div className="grid gap-6">
      <PageHeader title={initial ? "Edit Chapter" : "Buat Chapter"} description="Kelola cerita utama dan slide reader tanpa mengubah struktur chapter." action={<div className="flex gap-2">{initial ? <a href={`/admin/preview/chapters/${initial.id}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700">Preview</a> : null}{backNovelId ? <a href={`/admin/novels/${backNovelId}/chapters`} className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold">Kembali ke chapter</a> : null}</div>} />
      {error ? <ErrorNotice message={error} /> : null}
      {message ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label><FieldLabel>Novel</FieldLabel><select className={inputClass} value={form.novelId} disabled={Boolean(initial || defaultNovelId)} onChange={(event) => setForm({ ...form, novelId: Number(event.target.value) })}><option value={0}>Pilih novel</option>{novels.map((novel) => <option key={novel.id} value={novel.id}>{novel.title}</option>)}</select></label>
            <label><FieldLabel>Nomor chapter</FieldLabel><input type="number" min={1} className={inputClass} value={form.chapterNumber} onChange={(event) => setForm({ ...form, chapterNumber: Number(event.target.value) })} /></label>
            <label><FieldLabel>Judul</FieldLabel><input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label><FieldLabel>Slug</FieldLabel><input className={inputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Kosongkan untuk otomatis" /></label>
          </div>
          <ChapterThumbnailField value={form.thumbnailUrl} onChange={(thumbnailUrl) => setForm((current) => ({ ...current, thumbnailUrl }))} />
          <div><FieldLabel>Konten chapter</FieldLabel><RichTextEditor value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} onUploadImage={(file) => uploadAdminImage(file, "thumbnail")} minHeightClassName="min-h-[480px]" /></div>
          <SlideEditor slides={form.slides} onAdd={addSlide} onChange={updateSlide} onRemove={removeSlide} onMove={moveSlide} />
        </section>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-center justify-between"><h2 className="font-black">Publikasi</h2><StatusBadge status={form.status} /></div>
          <label className="mt-4 block"><FieldLabel>Status</FieldLabel><select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PublishStatus })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label>
          <div className="mt-4 grid gap-2"><button type="button" disabled={saving || !form.novelId || !form.title.trim()} onClick={() => save("DRAFT")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 font-bold disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}Simpan draft</button><button type="button" disabled={saving || !form.novelId || !form.title.trim()} onClick={() => save("PUBLISHED")} className="h-10 rounded-lg bg-blue-600 font-bold text-white disabled:opacity-60">Publikasikan</button></div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500"><p>{form.slides.length} slide</p><p className="mt-1">Jika slide kosong, chapter ditampilkan sebagai artikel biasa.</p></div>
        </aside>
      </div>
      <MusicFields title="Musik Chapter" description="Kosongkan untuk menggunakan musik dari novel. Musik chapter selalu memiliki prioritas lebih tinggi." value={form} fallback={novelMusic} onChange={(music) => setForm({ ...form, ...music })} />
    </div>
  );
}

function ChapterThumbnailField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadAdminImage(file, "thumbnail"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[160px_1fr]">
      <div className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
        {value ? <img src={value} alt="Preview thumbnail chapter" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center p-4 text-center text-xs text-slate-400">Thumbnail chapter</div>}
      </div>
      <div className="grid content-center gap-3">
        <div><h2 className="font-semibold">Thumbnail chapter</h2><p className="mt-1 text-sm text-slate-500">Gambar ini digunakan pada kartu chapter di Beranda Reader.</p></div>
        <label><FieldLabel>URL gambar</FieldLabel><input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Upload gambar atau masukkan URL" /></label>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold"><UploadCloud size={16} />{uploading ? "Mengunggah..." : "Upload gambar"}<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label>
          {value ? <button type="button" onClick={() => onChange("")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700"><Trash2 size={15} />Hapus</button> : null}
        </div>
      </div>
    </section>
  );
}

function SlideEditor({ slides, onAdd, onChange, onRemove, onMove }: { slides: ChapterSlideData[]; onAdd: (type: ChapterSlideData["type"]) => void; onChange: (index: number, patch: Partial<ChapterSlideData>) => void; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">Chapter slide</h2><p className="text-sm text-slate-500">Susun slide gambar, teks, atau kombinasi keduanya.</p></div><div className="flex flex-wrap gap-2"><AddSlideButton label="Teks" icon={<Plus size={15} />} onClick={() => onAdd("text")} /><AddSlideButton label="Gambar" icon={<ImageIcon size={15} />} onClick={() => onAdd("image")} /><AddSlideButton label="Gambar + teks" icon={<Plus size={15} />} onClick={() => onAdd("image-text")} primary /></div></div>
      {slides.length === 0 ? <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Belum ada slide.</div> : null}
      <div className="mt-4 grid gap-4">{slides.map((slide, index) => <SlideCard key={slide.id || slide.clientId} slide={slide} index={index} count={slides.length} onChange={onChange} onRemove={onRemove} onMove={onMove} />)}</div>
    </section>
  );
}

function AddSlideButton({ label, icon, onClick, primary = false }: { label: string; icon: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold ${primary ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{icon}{label}</button>;
}

function SlideCard({ slide, index, count, onChange, onRemove, onMove }: { slide: ChapterSlideData; index: number; count: number; onChange: (index: number, patch: Partial<ChapterSlideData>) => void; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) { if (!file) return; setUploading(true); try { onChange(index, { imageUrl: await uploadAdminImage(file, "thumbnail") }); } finally { setUploading(false); } }
  return <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="font-bold">Slide {index + 1}</p><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" title="Pindah ke atas"><ArrowUp size={14} /></button><button type="button" disabled={index === count - 1} onClick={() => onMove(index, 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" title="Pindah ke bawah"><ArrowDown size={14} /></button><button type="button" onClick={() => onRemove(index)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-700" title="Hapus slide"><Trash2 size={14} /></button></div></div><div className="mt-4 grid gap-3 lg:grid-cols-[150px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">{slide.imageUrl ? <img src={slide.imageUrl} alt={slide.altText || slide.title || `Slide ${index + 1}`} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center p-3 text-center text-xs text-slate-400">Preview slide</div>}</div><div className="grid gap-3"><div className="grid gap-3 md:grid-cols-2"><label><FieldLabel>Tipe</FieldLabel><select className={inputClass} value={slide.type} onChange={(event) => onChange(index, { type: event.target.value as ChapterSlideData["type"] })}><option value="text">Text</option><option value="image">Image</option><option value="image-text">Image + Text</option></select></label><label><FieldLabel>Judul kecil</FieldLabel><input className={inputClass} value={slide.title} onChange={(event) => onChange(index, { title: event.target.value })} /></label></div>{slide.type !== "text" ? <div className="grid gap-2 md:grid-cols-[1fr_auto]"><label><FieldLabel>URL gambar</FieldLabel><input className={inputClass} value={slide.imageUrl} onChange={(event) => onChange(index, { imageUrl: event.target.value })} /></label><label className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold"><UploadCloud size={16} />{uploading ? "Upload..." : "Upload"}<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label></div> : null}{slide.type !== "image" ? <div><FieldLabel>Narasi</FieldLabel><RichTextEditor value={slide.content} onChange={(content) => onChange(index, { content })} minHeightClassName="min-h-[180px]" compact /></div> : null}<div className="grid gap-3 md:grid-cols-2"><label><FieldLabel>Caption</FieldLabel><input className={inputClass} value={slide.caption} onChange={(event) => onChange(index, { caption: event.target.value })} /></label><label><FieldLabel>Alt text</FieldLabel><input className={inputClass} value={slide.altText} onChange={(event) => onChange(index, { altText: event.target.value })} /></label></div></div></div></article>;
}
