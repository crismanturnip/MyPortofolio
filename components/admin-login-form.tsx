"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage("Memproses login...");

    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Login gagal.");
      setLoading(false);
      return;
    }

    setMessage("Login berhasil.");
    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-slate-950 p-8 text-white md:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-xl font-black">C</div>
          <h1 className="mt-8 text-3xl font-black">Crisman Studio</h1>
          <p className="mt-3 max-w-sm text-slate-300">
            Ruang pribadi untuk mengelola blog, novel, chapter, media, kategori, dan feed portfolio.
          </p>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-emerald-300">Personal CMS</p>
            <p className="mt-2 text-sm text-slate-300">
              Tulis draft, preview tulisan, publish konten, lalu biarkan pengunjung membaca di halaman publik.
            </p>
          </div>
        </section>

        <form action={onSubmit} className="grid content-center gap-5 p-8 md:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Admin Access</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Masuk Dashboard</h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">Email</span>
            <span className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50">
              <Mail size={18} className="text-slate-400" />
              <input className="w-full outline-none" name="email" type="email" required placeholder="your-admin@example.com" />
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">Password</span>
            <span className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50">
              <Lock size={18} className="text-slate-400" />
              <input className="w-full outline-none" name="password" type="password" required placeholder="Password admin" />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 font-bold text-white hover:bg-slate-800"
          >
            {loading ? "Loading..." : "Masuk Admin"}
            <ArrowRight size={18} />
          </button>
          <p className="min-h-5 text-sm text-slate-500">{message}</p>
        </form>
      </div>
    </main>
  );
}
