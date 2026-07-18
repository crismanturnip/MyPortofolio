"use client";

import { LoaderCircle, UploadCloud } from "lucide-react";
import { useState } from "react";
import { uploadAdminImage } from "@/components/admin/api-client";
import { ErrorNotice, FieldLabel, inputClass } from "@/components/admin/admin-ui";

export default function ImageUpload({ label, value, onChange, kind, portrait = false }: { label: string; value: string; onChange: (url: string) => void; kind: "cover" | "thumbnail"; portrait?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadAdminImage(file, kind));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className={`grid gap-3 ${portrait ? "" : "md:grid-cols-[180px_1fr]"}`}>
        {value ? <img className={`${portrait ? "aspect-[3/4]" : "aspect-video"} w-full rounded-lg border border-slate-200 object-cover`} src={value} alt={`Preview ${label}`} /> : <div className={`${portrait ? "aspect-[3/4]" : "aspect-video"} grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400`}>Belum ada gambar</div>}
        <div className="grid content-center gap-2">
          <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL gambar" />
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
            {uploading ? <LoaderCircle className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            {uploading ? "Mengunggah..." : "Pilih file"}
            <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />
          </label>
        </div>
      </div>
      {error ? <ErrorNotice message={error} /> : null}
    </div>
  );
}
