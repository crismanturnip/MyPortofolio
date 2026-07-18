"use client";

import { Edit3, LoaderCircle, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api-client";
import { DeleteButton, EmptyState, ErrorNotice, FieldLabel, inputClass } from "@/components/admin/admin-ui";
import type { TaxonomyItem } from "@/components/admin/types";

export default function TaxonomyManager({ title, singular, endpoint, items }: { title: string; singular: string; endpoint: string; items: TaxonomyItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function beginEdit(item: TaxonomyItem) { setEditing(item); setForm({ name: item.name, slug: item.slug }); setError(""); setMessage(""); }
  function reset() { setEditing(null); setForm({ name: "", slug: "" }); }

  async function save() {
    if (saving || !form.name.trim()) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await adminRequest<{ message: string }>(editing ? `${endpoint}/${editing.id}` : endpoint, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setMessage(result.message); reset(); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : `${singular} gagal disimpan.`); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center justify-between"><h2 className="font-black">{editing ? `Edit ${singular}` : `Tambah ${singular}`}</h2>{editing ? <button type="button" onClick={reset} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200" aria-label="Batal edit"><X size={15} /></button> : null}</div>
        <div className="mt-4 grid gap-3"><label><FieldLabel>Nama</FieldLabel><input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label><FieldLabel>Slug</FieldLabel><input className={inputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Kosongkan untuk otomatis" /></label><button type="button" onClick={save} disabled={saving || !form.name.trim()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : editing ? <Save size={16} /> : <Plus size={16} />}{editing ? "Simpan perubahan" : `Tambah ${singular}`}</button></div>
        {error ? <div className="mt-3"><ErrorNotice message={error} /></div> : null}{message ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      </section>
      <section>{items.length === 0 ? <EmptyState title={`Belum ada ${title.toLowerCase()}`} description={`Tambahkan ${singular.toLowerCase()} pertama melalui form.`} /> : <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500"><span>Nama</span><span>Slug</span><span>Aksi</span></div><div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-3 px-4 py-3"><p className="font-bold">{item.name}</p><p className="break-all text-sm text-slate-500">{item.slug}</p><div className="flex gap-2"><button type="button" onClick={() => beginEdit(item)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold"><Edit3 size={14} />Edit</button><DeleteButton endpoint={`${endpoint}/${item.id}`} label={`${singular} ${item.name}`} /></div></div>)}</div></div>}</section>
    </div>
  );
}
