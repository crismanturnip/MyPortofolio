"use client";

import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Beranda", href: "/reader" },
  { label: "Blog", href: "/blog" },
  { label: "Novel", href: "/novel" },
  { label: "Tentang", href: "/reader#tentang" },
];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem("crisman-reader-theme") !== "light");
  }, []);

  useEffect(() => {
    localStorage.setItem("crisman-reader-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className={`reader-shell ${darkMode ? "reader-shell-dark" : ""}`}>
      <header className="reader-header sticky top-0 z-30 border-b">
        <div className="mx-auto flex min-h-16 w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="/reader" className="reader-logo inline-flex shrink-0 items-center gap-2 text-lg font-semibold tracking-normal sm:text-xl">
            Crisman
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navItems.map((item) => {
              const active = item.href !== "/reader#tentang" && pathname === item.href;
              return (
                <a
                  key={item.href}
                  className={`border-b-2 py-1 transition ${active ? "reader-nav-active" : "reader-nav-link"}`}
                  href={item.href}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={darkMode ? "Mode terang" : "Mode malam"}
              onClick={() => setDarkMode((current) => !current)}
              className="hidden h-10 w-10 place-items-center rounded-lg border reader-button-secondary md:grid"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a href="/blog" className="reader-button hidden h-10 items-center gap-2 rounded-lg border px-5 text-sm font-bold shadow-sm sm:inline-flex">
              Mulai Membaca
            </a>
            <button
              type="button"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              aria-controls="reader-mobile-menu"
              onClick={() => setMobileOpen((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-lg border reader-button-secondary md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div id="reader-mobile-menu" className="reader-mobile-menu mx-3 mb-3 rounded-2xl border p-3 shadow-lg md:hidden">
            <nav className="grid gap-2 text-sm font-semibold" aria-label="Navigasi mobile">
              {navItems.map((item) => {
                const active = item.href !== "/reader#tentang" && pathname === item.href;
                return (
                  <a
                    key={item.href}
                    className={`flex min-h-11 items-center justify-between rounded-xl px-3 transition ${active ? "reader-mobile-link-active" : "reader-mobile-link"}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                    {active ? <span className="h-2 w-2 rounded-full bg-[var(--reader-cyan)]" /> : null}
                  </a>
                );
              })}
            </nav>
            <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
              <a href="/blog" onClick={() => setMobileOpen(false)} className="reader-button inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold">
                Mulai Membaca
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                aria-label={darkMode ? "Mode terang" : "Mode malam"}
                onClick={() => setDarkMode((current) => !current)}
                className="reader-button-secondary grid h-11 w-11 place-items-center rounded-xl border"
              >
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="border-t reader-surface">
        <div className="grid w-full gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-[minmax(18rem,1.05fr)_0.7fr_0.7fr_minmax(10rem,0.55fr)] lg:items-start lg:justify-between lg:px-10 xl:px-12">
          <div className="max-w-md sm:col-span-2 lg:col-span-1">
            <a href="/reader" className="reader-logo inline-flex items-center gap-2 text-xl font-bold tracking-wide">
              Crisman
            </a>
            <p className="reader-muted mt-2 max-w-sm text-sm leading-6">
              Blog pribadi dan ruang baca novel yang tetap satu identitas dengan portfolio Crisman.
            </p>
            <a href="/" className="reader-portfolio-link mt-3 inline-flex text-sm font-bold">
              Kembali ke Portfolio
            </a>
          </div>

          <FooterGroup title="Navigasi" items={[["Beranda", "/reader"], ["Blog", "/blog"], ["Novel", "/novel"], ["Tentang", "/reader#tentang"]]} />
          <FooterGroup title="Kategori" items={[["Personal Blog", "/blog"], ["Novel", "/novel"], ["Cerita", "/novel"], ["Inspirasi", "/blog"]]} />

          <div className="w-full sm:w-fit lg:justify-self-end">
            <h3 className="text-left text-sm font-black sm:text-center">Sosial Media</h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <a aria-label="Instagram" href="https://www.instagram.com/crisman_turnip21" target="_blank" rel="noopener noreferrer" className="reader-social-link reader-button-secondary grid h-10 w-10 place-items-center rounded-full border">
                <svg className="h-5 w-5" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="reader-instagram-logo-gradient" x1="10" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#feda75" />
                      <stop offset="0.18" stopColor="#fa7e1e" />
                      <stop offset="0.38" stopColor="#d62976" />
                      <stop offset="0.65" stopColor="#962fbf" />
                      <stop offset="1" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="10" width="44" height="44" rx="13" fill="none" stroke="url(#reader-instagram-logo-gradient)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="10.5" fill="none" stroke="url(#reader-instagram-logo-gradient)" strokeWidth="6" />
                  <circle cx="45" cy="19" r="4" fill="url(#reader-instagram-logo-gradient)" />
                </svg>
              </a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/in/crisman-panorangi-turnip-078ab8317" target="_blank" rel="noopener noreferrer" className="reader-social-link reader-button-secondary grid h-10 w-10 place-items-center rounded-full border">
                <svg className="h-5 w-5" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <circle cx="12.5" cy="12.5" r="7.5" fill="#0a66c2" />
                  <rect x="6.5" y="24" width="12" height="34" fill="#0a66c2" />
                  <path fill="#0a66c2" d="M26 24h11.5v4.8c1.7-2.8 5.6-5.6 11.6-5.6 12.4 0 14.7 8.1 14.7 18.7V58H51.7V43.8c0-3.4-.1-7.8-4.8-7.8-4.8 0-5.6 3.7-5.6 7.5V58H26V24Z" />
                </svg>
              </a>
              <a aria-label="Email" href="mailto:crismanpanorangiturnip@gmail.com" className="reader-social-link reader-button-secondary grid h-10 w-10 place-items-center rounded-full border">
                <svg className="h-5 w-5" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <path fill="#4285f4" d="M7 20.5v27A5.5 5.5 0 0 0 12.5 53H20V30.8L7 20.5Z" />
                  <path fill="#34a853" d="M44 30.8V53h7.5A5.5 5.5 0 0 0 57 47.5v-27L44 30.8Z" />
                  <path fill="#fbbc04" d="M44 30.8 57 20.5v-2A5.8 5.8 0 0 0 47.8 14L44 17v13.8Z" />
                  <path fill="#ea4335" d="M20 30.8V17l12 9.4L44 17v13.8L32 40.2 20 30.8Z" />
                  <path fill="#c5221f" d="M7 18.5v2l13 10.3V17l-3.8-3A5.8 5.8 0 0 0 7 18.5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="reader-muted flex w-full flex-col gap-2 border-t px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10 xl:px-12" style={{ borderColor: "var(--reader-border)" }}>
          <p>Copyright @2026 by Crisman P Turnip</p>        </div>
      </footer>
    </div>
  );
}

function FooterGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="w-full sm:w-fit lg:justify-self-center">
      <h3 className="text-left text-sm font-black">{title}</h3>
      <div className="reader-muted mt-2.5 grid gap-2 text-sm font-semibold">
        {items.map(([label, href]) => (
          <a key={`${label}-${href}`} href={href} className="hover:text-[var(--reader-cyan)]">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
