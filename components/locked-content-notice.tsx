import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function LockedContentNotice({ title, backHref, backLabel, detail }: { title: string; backHref: string; backLabel: string; detail?: string }) {
  return (
    <section className="reader-page mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
      <span className="reader-cyan grid h-16 w-16 place-items-center rounded-full border border-current/20 bg-current/5"><LockKeyhole size={30} aria-hidden="true" /></span>
      <p className="reader-cyan mt-6 text-sm font-bold uppercase tracking-[0.18em]">Konten terkunci</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">{title}</h1>
      <p className="reader-muted mt-5 max-w-xl text-lg leading-8">{detail || "Konten ini masih terkunci dan belum bisa dibaca. Silakan kembali lagi nanti."}</p>
      <Link href={backHref} className="reader-button-secondary mt-8 inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold">{backLabel}</Link>
    </section>
  );
}
