# Runtime Map

Dokumen ini adalah peta sumber kebenaran untuk runtime website.

## Folder Aktif

- `app/`
  Next.js App Router. Semua halaman, API route, route asset, dan root portfolio aktif berada di sini.
- `app/public/`
  Sumber website portfolio statis yang tampil di `/`.
- `app/public/index.html`
  HTML portfolio utama. File ini dibaca oleh `app/route.ts`.
- `app/public/assets/`
  Asset portfolio utama: CSS, JS, dan gambar yang dipakai oleh halaman `/`.
- `app/(public)/`
  Halaman publik React untuk reader, blog, novel, dan chapter.
- `app/(admin)/admin/`
  Halaman admin login dan dashboard CMS.
- `app/api/public/`
  API publik untuk konten published.
- `app/api/admin/`
  API admin untuk auth, CRUD, taxonomy, chapter, novel, blog, dan upload.
- `components/`
  Komponen React untuk admin/public app.
- `lib/`
  Helper Prisma, auth session, upload storage, slug, dan validasi payload.
- `prisma/`
  Schema database, migration, dan seed admin.

## Folder Non-Runtime

- `.next/`
  Output build/dev Next.js. Jangan diedit manual.
- `node_modules/`
  Dependency hasil install. Jangan diedit manual.
- `.agents/`
  Metadata/tooling agent. Tidak ikut runtime website.
- `docs/`
  Dokumentasi saja.
- `content/`
  Catatan/placeholder konten lama. Saat ini tidak dipakai runtime.
- `z_apps_backup/`
  Arsip implementasi lama. Tidak dipakai runtime utama.
- `index.html`
  Halaman launcher workspace lokal, bukan website production Next.js.
- `.vercelignore`
  Daftar file/folder non-runtime yang tidak perlu ikut deployment.

## Route Utama

- `/`
  Dilayani oleh `app/route.ts`, membaca `app/public/index.html`.
- `/assets/[...path]`
  Dilayani oleh `app/assets/[...path]/route.ts`, membaca file dari `app/public/assets`.
- `/reader`
  Landing pembaca blog/novel dari `app/(public)/reader/page.tsx`.
- `/blog`
  List blog published.
- `/blog/[slug]`
  Detail blog published.
- `/novel`
  List novel published.
- `/novel/[slug]`
  Detail novel published.
- `/novel/[slug]/chapter/[chapterSlug]`
  Detail chapter published.
- `/admin/login`
  Login admin.
- `/admin/dashboard`
  Dashboard CMS.

## Alur Data

1. Admin login melalui `/api/admin/auth/login`.
2. Admin mengelola blog, novel, chapter, kategori, dan tag melalui `/api/admin/*`.
3. Data disimpan di PostgreSQL melalui Prisma.
4. Halaman publik membaca data published lewat Prisma atau API publik.
5. Section `My Blog` dan `My Series` pada portfolio statis memanggil `/api/public/portfolio-feed`.
6. `portfolio-feed` mengirim data published dan memastikan gambar yang hilang memakai fallback dari `/assets/images`.

## Database

- Sumber konfigurasi: `DATABASE_URL`.
- ORM: Prisma.
- Schema: `prisma/schema.prisma`.
- Model utama:
  - `Admin`
  - `Blog`
  - `BlogCategory`
  - `BlogTag`
  - `Novel`
  - `Chapter`

## Storage Gambar

- Production: wajib memakai Vercel Blob melalui `BLOB_READ_WRITE_TOKEN`.
- Development tanpa token: upload lokal disimpan ke `public/uploads`.
- Jika file upload lokal hilang, `/api/public/portfolio-feed` memakai fallback gambar dari `app/public/assets/images`.

## Asset Portfolio

- CSS aktif: `app/public/assets/css/style.css`.
- JS aktif: `app/public/assets/js/script.js`.
- Gambar aktif: `app/public/assets/images`.
- File root di `app/public` seperti `style.css`, `script.js`, dan gambar langsung adalah salinan lama. Jangan dijadikan sumber edit utama.

## Catatan Publish

- Jangan mengandalkan file upload lokal untuk production.
- Pastikan `DATABASE_URL`, `ADMIN_SESSION_SECRET`, dan `BLOB_READ_WRITE_TOKEN` tersedia di environment deployment.
- Folder `z_apps_backup` aman dikeluarkan dari deployment jika tidak dibutuhkan sebagai arsip.
- `.vercelignore` sudah mengecualikan folder arsip, docs, launcher lokal, log, cache, dan upload lokal dari deployment.
