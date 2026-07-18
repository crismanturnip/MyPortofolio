import type { Metadata } from "next";
import { Clock3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Coming Soon | Crisman",
  description: "Tulisan dan cerita baru Crisman sedang dipersiapkan.",
};

type Props = {
  searchParams: Promise<{ type?: string; title?: string }>;
};

export default async function ComingSoonPage({ searchParams }: Props) {
  const params = await searchParams;
  const isNovel = params.type === "novel";
  const contentType = isNovel ? "series" : "artikel";
  const returnHref = isNovel ? "/#novels" : "/#blog";
  const title = params.title?.trim().slice(0, 120) || (isNovel ? "Series baru" : "Artikel baru");

  return (
    <article className="reader-page">
      <section className="reader-reveal mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center px-5 py-16 text-center sm:px-8">
        <span className="coming-soon-clock reader-cyan mx-auto" aria-hidden="true">
          <Clock3 size={48} strokeWidth={1.5} />
        </span>
        <p className="reader-cyan mt-6 text-sm font-medium uppercase">Masih dalam tahap pengembangan</p>
        <h1 className="coming-soon-title mt-3 text-5xl leading-tight sm:text-6xl">Coming Soon</h1>
        <p className="reader-muted mx-auto mt-5 max-w-2xl text-lg leading-8">
          <strong className="font-medium reader-primary">{title}</strong> belum tersedia untuk dibaca. {contentType === "series" ? "Halaman ini masih dalam tahap" : "Halaman ini masih dalam tahap"} pengembangan agar dapat hadir dalam versi terbaiknya. Terimakasih:)
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={returnHref} className="reader-button inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-sm font-semibold">
            Kembali ke Portfolio
          </a>
          <a href="/reader" className="reader-button-secondary inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium">
            Buka Reader
          </a>
        </div>
      </section>
    </article>
  );
}
