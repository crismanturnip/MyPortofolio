"use client";

import { LoaderCircle, Music2, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadAdminAudio } from "@/components/admin/api-client";
import { ErrorNotice, FieldLabel, inputClass } from "@/components/admin/admin-ui";

export type MusicValue = { musicTitle: string; musicArtist: string; musicUrl: string; musicVolume: number };

export default function MusicFields({ value, onChange, title, description, fallback }: { value: MusicValue; onChange: (value: MusicValue) => void; title: string; description: string; fallback?: MusicValue | null }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const preview = value.musicUrl ? value : fallback?.musicUrl ? fallback : null;
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (previewAudioRef.current && preview) previewAudioRef.current.volume = preview.musicVolume / 100;
  }, [preview?.musicVolume, preview]);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try { onChange({ ...value, musicUrl: await uploadAdminAudio(file) }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Audio gagal diunggah."); }
    finally { setUploading(false); }
  }

  return <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><Music2 size={19} /></span><div><h2 className="font-black text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><label><FieldLabel>Judul lagu</FieldLabel><input className={inputClass} value={value.musicTitle} onChange={(event) => onChange({ ...value, musicTitle: event.target.value })} placeholder="Opsional" /></label><label><FieldLabel>Artis atau sumber</FieldLabel><input className={inputClass} value={value.musicArtist} onChange={(event) => onChange({ ...value, musicArtist: event.target.value })} placeholder="Opsional" /></label></div>
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><FieldLabel>Volume saat membaca</FieldLabel><strong className="text-sm text-blue-700">{value.musicVolume}%</strong></div><input type="range" min={0} max={100} step={5} value={value.musicVolume} onChange={(event) => onChange({ ...value, musicVolume: Number(event.target.value) })} className="mt-2 w-full accent-blue-600" aria-label="Volume musik saat membaca" /><p className="mt-1 text-xs text-slate-500">Disarankan 25–40% agar musik tidak mengganggu fokus membaca.</p></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><label><FieldLabel>URL audio</FieldLabel><input className={inputClass} value={value.musicUrl} onChange={(event) => onChange({ ...value, musicUrl: event.target.value })} placeholder="https://... atau upload file" /></label><label className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">{uploading ? <LoaderCircle className="animate-spin" size={16} /> : <UploadCloud size={16} />}{uploading ? "Upload..." : "Upload audio"}<input type="file" className="hidden" accept=".mp3,.m4a,.ogg,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/ogg" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label></div>
    <p className="mt-2 text-xs text-slate-500">Format MP3, M4A, atau OGG · maksimal 12 MB.</p>
    {error ? <div className="mt-3"><ErrorNotice message={error} /></div> : null}
    {preview ? <div className="mt-4 rounded-lg bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{preview.musicTitle || "Audio tanpa judul"}</p><p className="truncate text-xs text-slate-500">{preview.musicArtist || (value.musicUrl ? "Preview pilihan" : "Fallback musik novel")}</p></div>{value.musicUrl ? <button type="button" onClick={() => onChange({ musicTitle: "", musicArtist: "", musicUrl: "", musicVolume: value.musicVolume })} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700" aria-label="Hapus pilihan musik"><Trash2 size={15} /></button> : null}</div><audio ref={previewAudioRef} key={preview.musicUrl} className="mt-3 w-full" controls preload="metadata" src={preview.musicUrl}>Browser tidak mendukung audio.</audio></div> : null}
  </section>;
}
