"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest, uploadAdminImage } from "@/components/admin/api-client";
import { ErrorNotice, FieldLabel, inputClass, PageHeader, StatusBadge, textareaClass } from "@/components/admin/admin-ui";
import ImageUpload from "@/components/admin/image-upload";
import type { BlogEditorData, PublishStatus, TaxonomyItem } from "@/components/admin/types";
import RichTextEditor from "@/components/rich-text-editor";

const defaultContent = "<h2>Mulai menulis...</h2><p>Tulis artikel, pengalaman, atau pemikiranmu di sini.</p>";

export default function BlogForm({ initial, categories, tags }: { initial?: BlogEditorData; categories: TaxonomyItem[]; tags: TaxonomyItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title || "",
    slug: initial?.slug || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || defaultContent,
    thumbnailUrl: initial?.thumbnailUrl || "",
    status: initial?.status || "DRAFT" as PublishStatus,
    categoryIds: initial?.categories.map(({ category }) => category.id) || [],
    tagIds: initial?.tags.map(({ tag }) => tag.id) || [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggle(list: "categoryIds" | "tagIds", id: number) {
    setForm((current) => ({ ...current, [list]: current[list].includes(id) ? current[list].filter((item) => item !== id) : [...current[list], id] }));
  }

  async function save(status: PublishStatus) {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const endpoint = initial ? `/api/admin/blogs/${initial.id}` : "/api/admin/blogs";
      const result = await adminRequest<{ message: string; data: { id: number } }>(endpoint, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      setForm((current) => ({ ...current, status }));
      setMessage(result.message);
      if (!initial) router.replace(`/admin/blogs/${result.data.id}/edit`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Blog gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader title={initial ? "Edit Blog" : "Buat Blog"} description="Tulis konten dengan editor, atur taxonomy, lalu simpan sebagai draft atau published." action={<a href="/admin/blogs" className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold">Kembali ke daftar</a>} />
      {error ? <ErrorNotice message={error} /> : null}
      {message ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label><FieldLabel>Judul</FieldLabel><input required className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Judul artikel" /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label><FieldLabel>Slug</FieldLabel><input className={inputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Kosongkan untuk otomatis" /></label>
            <label><FieldLabel>Excerpt</FieldLabel><textarea className={textareaClass} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="Ringkasan singkat" /></label>
          </div>
          <ImageUpload label="Thumbnail" value={form.thumbnailUrl} onChange={(thumbnailUrl) => setForm({ ...form, thumbnailUrl })} kind="thumbnail" />
          <div><FieldLabel>Konten</FieldLabel><RichTextEditor value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} onUploadImage={(file) => uploadAdminImage(file, "thumbnail")} /></div>
        </section>
        <aside className="grid content-start gap-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-black">Publikasi</h2><StatusBadge status={form.status} /></div>
            <label className="mt-4 block"><FieldLabel>Status</FieldLabel><select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PublishStatus })}><option value="DRAFT">Draft</option><option value="LOCKED">Terkunci</option><option value="PUBLISHED">Published</option></select></label>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button type="button" disabled={saving || !form.title.trim()} onClick={() => save("DRAFT")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 font-bold disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}Simpan draft</button>
              <button type="button" disabled={saving || !form.title.trim()} onClick={() => save("LOCKED")} className="h-10 rounded-lg border border-violet-200 bg-violet-50 px-4 font-bold text-violet-700 disabled:opacity-60">Simpan terkunci</button>
              <button type="button" disabled={saving || !form.title.trim()} onClick={() => save("PUBLISHED")} className="h-10 rounded-lg bg-blue-600 px-4 font-bold text-white disabled:opacity-60">Publikasikan</button>
            </div>
          </section>
          <TaxonomyPicker title="Kategori" items={categories} selected={form.categoryIds} onToggle={(id) => toggle("categoryIds", id)} emptyHref="/admin/categories" />
          <TaxonomyPicker title="Tag" items={tags} selected={form.tagIds} onToggle={(id) => toggle("tagIds", id)} emptyHref="/admin/tags" />
        </aside>
      </div>
    </div>
  );
}

function TaxonomyPicker({ title, items, selected, onToggle, emptyHref }: { title: string; items: TaxonomyItem[]; selected: number[]; onToggle: (id: number) => void; emptyHref: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-black">{title}</h2><div className="mt-3 grid max-h-48 gap-2 overflow-y-auto">{items.map((item) => <label key={item.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />{item.name}</label>)}</div>{items.length === 0 ? <a href={emptyHref} className="mt-3 inline-flex text-sm font-bold text-blue-600">Buat {title.toLowerCase()}</a> : null}</section>;
}
