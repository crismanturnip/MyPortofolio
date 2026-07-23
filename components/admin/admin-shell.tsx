"use client";

import { BookOpen, ExternalLink, FileText, Folder, ImageIcon, LayoutDashboard, LogOut, Menu, Tag, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest } from "@/components/admin/api-client";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Blog", href: "/admin/blogs", icon: FileText },
  { label: "Novel", href: "/admin/novels", icon: BookOpen },
  { label: "Kategori", href: "/admin/categories", icon: Folder },
  { label: "Tag", href: "/admin/tags", icon: Tag },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
];

function pageTitle(pathname: string) {
  if (pathname.includes("/blogs/new")) return "Buat Blog";
  if (/\/blogs\/\d+\/edit$/.test(pathname)) return "Edit Blog";
  if (pathname === "/admin/blogs") return "Blog";
  if (pathname.includes("/novels/new")) return "Buat Novel";
  if (/\/novels\/\d+\/edit$/.test(pathname)) return "Edit Novel";
  if (pathname.includes("/chapters/new")) return "Buat Chapter";
  if (pathname.includes("/chapters")) return "Kelola Chapter";
  if (pathname === "/admin/novels") return "Novel";
  if (pathname === "/admin/categories") return "Kategori";
  if (pathname === "/admin/tags") return "Tag";
  if (pathname === "/admin/media") return "Media";
  return "Dashboard";
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1 px-3" aria-label="Navigasi admin">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <a key={item.href} href={item.href} onClick={onNavigate} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={18} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await adminRequest("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const segments = pathname.split("/").filter(Boolean).slice(1);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-slate-950 text-white lg:block">
        <div className="flex h-full flex-col">
          <a href="/admin/dashboard" className="flex items-center gap-3 px-5 py-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 font-black">C</span>
            <span><strong className="block">Crisman Studio</strong><span className="text-xs text-slate-400">Personal CMS</span></span>
          </a>
          <NavLinks pathname={pathname} />
          <div className="mt-auto border-t border-white/10 p-3">
            <a href="/ruangbaca" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"><ExternalLink size={17} />Lihat situs publik</a>
            <button type="button" onClick={logout} disabled={loggingOut} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"><LogOut size={17} />{loggingOut ? "Keluar..." : "Logout"}</button>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/55" onClick={() => setMobileOpen(false)} aria-label="Tutup menu admin" />
          <aside className="relative flex h-full w-[min(82vw,19rem)] flex-col bg-slate-950 py-3 text-white shadow-2xl">
            <div className="flex items-center justify-between px-4 pb-4">
              <p className="font-black">Crisman Studio</p>
              <button type="button" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10" aria-label="Tutup menu"><X size={19} /></button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <button type="button" onClick={logout} disabled={loggingOut} className="mx-3 mt-auto flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10"><LogOut size={17} />Logout</button>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
            <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden" aria-label="Buka menu admin"><Menu size={19} /></button>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">{segments.length ? `Admin / ${segments.map((item) => item.replaceAll("-", " ")).join(" / ")}` : "Admin"}</p>
              <h1 className="truncate text-lg font-black sm:text-xl">{pageTitle(pathname)}</h1>
            </div>
            <div className="ml-auto hidden text-right sm:block"><p className="text-sm font-bold">{adminName}</p><p className="text-xs text-slate-400">Administrator</p></div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
