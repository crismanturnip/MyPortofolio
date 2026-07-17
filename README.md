# Crisman Content Studio (Next.js App Router)

Satu project Next.js untuk:

- area publik: blog, novel, chapter (published only)
- area admin sederhana (single admin)
- CRUD blog, novel, chapter
- upload thumbnail/cover ke Vercel Blob
- slug URL
- status draft/publish
- endpoint feed published untuk integrasi section portfolio

## Stack

- Next.js App Router
- Prisma + external PostgreSQL
- Vercel Blob untuk file image
- Cookie-based auth sederhana satu admin

## Struktur Inti

- `app/(public)` halaman publik
- `app/(admin)/admin` halaman admin login + dashboard
- `app/api/public` route data publik
- `app/api/admin` route auth, CRUD, upload
- `lib` util prisma, auth session, slug, validasi
- `prisma` schema dan seed admin

## Setup Cepat

1. Salin env:
`cp .env.example .env`
2. Install dependencies:
`npm install`
3. Generate client prisma:
`npm run prisma:generate`
4. Jalankan migration:
`npm run prisma:migrate`
5. Seed admin pertama:
`npm run prisma:seed`
6. Jalankan dev server:
`npm run dev`

## Akses

- Public website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Feed untuk portfolio: `http://localhost:3000/api/public/portfolio-feed`

## Deploy

- Jalankan project sebagai aplikasi Next.js, misalnya melalui Vercel atau `npm run build` lalu `npm start`.
- Jangan deploy hanya sebagai static `index.html`, karena route dinamis seperti `/blog/[slug]`, `/novel/[slug]`, `/reader`, `/admin`, dan `/api/*` membutuhkan server Next.js.
- Set environment production: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, dan `BLOB_READ_WRITE_TOKEN`.

## Default Admin (dari `.env`)

- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

## Catatan

Folder lama dari implementasi statis dipindahkan/dinonaktifkan sebagai backup di `z_apps_backup`.
Runtime utama sekarang memakai:

- `app/public` untuk website portfolio statis utama
- `app/(public)` untuk halaman pembaca blog/novel
- `app/(admin)` untuk admin CMS

Peta runtime lengkap ada di `docs/RUNTIME_MAP.md`.
