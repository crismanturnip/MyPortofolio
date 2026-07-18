"use client";

import { Check, Clipboard, LoaderCircle, UploadCloud } from "lucide-react";
import { useState } from "react";
import { uploadAdminImage } from "@/components/admin/api-client";
import { ErrorNotice } from "@/components/admin/admin-ui";

export default function MediaUploader() {
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<"thumbnail" | "cover">("thumbnail");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) { if (!file) return; setLoading(true); setError(""); setCopied(false); try { setUrl(await uploadAdminImage(file, kind)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload gagal."); } finally { setLoading(false); } }
  async function copy() { if (!url) return; await navigator.clipboard.writeText(url); setCopied(true); }

  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><section className="grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center"><div><UploadCloud className="mx-auto text-blue-600" size={34} /><h2 className="mt-4 text-xl font-black">Unggah gambar</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">JPEG, PNG, atau WebP. Ukuran maksimum 2 MB. Production menggunakan Vercel Blob; development tanpa token menggunakan `public/uploads`.</p><div className="mx-auto mt-5 flex max-w-sm gap-2"><select value={kind} onChange={(event) => setKind(event.target.value as "thumbnail" | "cover")} className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm"><option value="thumbnail">Thumbnail / slide</option><option value="cover">Cover novel</option></select><label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white">{loading ? <LoaderCircle className="animate-spin" size={16} /> : <UploadCloud size={16} />}{loading ? "Upload..." : "Pilih file"}<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" disabled={loading} onChange={(event) => upload(event.target.files?.[0])} /></label></div>{error ? <div className="mt-4"><ErrorNotice message={error} /></div> : null}</div></section><aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-black">Hasil upload</h2>{url ? <><img src={url} alt="Preview media baru" className="mt-4 aspect-video w-full rounded-lg border border-slate-200 object-contain" /><div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs break-all text-slate-600">{url}</div><button type="button" onClick={copy} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 font-bold">{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "URL disalin" : "Salin URL"}</button></> : <p className="mt-3 text-sm text-slate-500">Preview dan URL gambar akan muncul setelah upload berhasil.</p>}</aside></div>;
}
