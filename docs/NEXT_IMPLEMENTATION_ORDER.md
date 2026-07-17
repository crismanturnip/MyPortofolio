# Implementasi Next.js Content Studio

Dokumen ini menjelaskan urutan implementasi yang rapi untuk mahasiswa.

## 1. Setup Project

1. Inisialisasi Next.js App Router.
2. Tambahkan dependency: Prisma, Zod, bcryptjs, Vercel Blob.
3. Siapkan `.env` untuk `DATABASE_URL`, admin credential, session secret, dan blob token.

## 2. Model Data (Postgres + Prisma)

Model inti:

1. `Admin`
2. `Blog`
3. `Novel`
4. `Chapter`
5. Enum `PublishStatus` (`DRAFT`, `PUBLISHED`)

Aturan penting:

1. Slug `Blog` unik global.
2. Slug `Novel` unik global.
3. Slug `Chapter` unik per novel (`novelId + slug`).
4. Nomor chapter unik per novel (`novelId + chapterNumber`).

## 3. Auth Sederhana Satu Admin

1. Login email + password.
2. Password hash disimpan di tabel `Admin`.
3. Session disimpan di cookie `httpOnly`.
4. Middleware proteksi route `/admin/*` dan `/api/admin/*`.

## 4. Route Publik

1. `GET /api/public/blogs`
2. `GET /api/public/blogs/[slug]`
3. `GET /api/public/novels`
4. `GET /api/public/novels/[slug]`
5. `GET /api/public/novels/[slug]/chapters/[chapterSlug]`
6. `GET /api/public/portfolio-feed`

Semua route publik hanya menampilkan status `PUBLISHED`.

## 5. Route Admin

Auth:

1. `POST /api/admin/auth/login`
2. `POST /api/admin/auth/logout`
3. `GET /api/admin/auth/me`

Upload:

1. `POST /api/admin/upload` (cover/thumbnail ke Vercel Blob)

CRUD:

1. `GET|POST /api/admin/blogs`
2. `PATCH|DELETE /api/admin/blogs/[id]`
3. `GET|POST /api/admin/novels`
4. `PATCH|DELETE /api/admin/novels/[id]`
5. `GET|POST /api/admin/chapters`
6. `PATCH|DELETE /api/admin/chapters/[id]`

## 6. Halaman Publik

1. `/` ringkasan konten published.
2. `/blog` list blog.
3. `/blog/[slug]` detail blog.
4. `/novel` list novel.
5. `/novel/[slug]` detail novel + daftar chapter.
6. `/novel/[slug]/chapter/[chapterSlug]` detail chapter.

## 7. Halaman Admin

1. `/admin/login`
2. `/admin/dashboard`:
   - Form + list CRUD blog
   - Form + list CRUD novel
   - Form + list CRUD chapter
   - Upload image
   - Preview feed published untuk portfolio

## 8. Pengujian Minimum

1. Login admin berhasil.
2. Buat blog draft, pastikan tidak muncul di publik.
3. Ubah blog ke published, pastikan muncul di publik.
4. Buat novel + chapter published.
5. Cek detail chapter dari URL slug.
6. Upload cover/thumbnail dan simpan URL.
7. Cek endpoint `portfolio-feed` untuk section portfolio.
