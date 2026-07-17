# Project Structure (Next.js App Router)

Struktur aktif saat ini memakai satu project Next.js agar area publik dan area admin tetap terpisah tapi tetap satu codebase.

## Folder utama

- `app/`
  Seluruh halaman dan API route handler (App Router).
- `app/(public)/`
  Halaman publik blog, novel, chapter, dan landing konten.
- `app/public/`
  Website portfolio statis utama yang dirender oleh route root Next.js.
- `app/(admin)/admin/`
  Halaman admin login dan dashboard CRUD.
- `app/api/public/`
  Endpoint publik (published only) + feed portfolio.
- `app/api/admin/`
  Endpoint auth, CRUD konten, dan upload gambar.
- `components/`
  Komponen UI admin/public.
- `lib/`
  Helper prisma, auth session, slug, validasi, blob upload.
- `prisma/`
  Schema model data dan seed admin.
- `docs/`
  Dokumentasi arsitektur dan urutan implementasi.

## Folder legacy / arsip

Folder berikut adalah referensi implementasi lama dan tidak dipakai runtime utama:

1. `z_apps_backup/public`
2. `z_apps_backup/admin`
3. `my_portofolio` (sudah dihapus dari workspace aktif)
4. `public/portfolio` (sudah dihapus dari workspace aktif)

Lihat `docs/RUNTIME_MAP.md` untuk peta runtime yang lebih lengkap.
