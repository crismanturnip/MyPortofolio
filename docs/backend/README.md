# Backend Admin Content

Dokumen ini menjelaskan backend admin terpisah untuk mengelola novel, chapter, dan blog.

## Status

Dokumen ini adalah arsip implementasi backend lama. Runtime utama sekarang memakai API route Next.js di `app/api`.

## Lokasi Service Lama

- Backend: `z_apps_backup/backend` (jika backup tersedia)
- Public frontend: `z_apps_backup/public`
- Admin frontend: `z_apps_backup/admin`

## Struktur Folder Backend

```txt
z_apps_backup/backend/
  prisma/
    schema.prisma
    seed.js
  src/
    app.js
    server.js
    config/
    middlewares/
    modules/
      auth/
      dashboard/
      novels/
      chapters/
      blogs/
      taxonomy/
      uploads/
    routes/
    utils/
  uploads/
    covers/
    thumbnails/
    tmp/
  .env.example
  package.json
```

## Rancangan Tabel Database

1. `Admin`: admin login, password hash (argon2).
2. `Novel`: data novel utama (`slug`, `status`, `coverImage`).
3. `NovelChapter`: chapter per novel (`chapterNumber`, `slug`, `status`).
4. `BlogPost`: artikel blog (`slug`, `status`, `thumbnailImage`).
5. `BlogCategory`: kategori blog.
6. `BlogPostCategory`: relasi many-to-many post-kategori.
7. `BlogTag`: tag blog.
8. `BlogPostTag`: relasi many-to-many post-tag.

Status publish memakai enum `PublishStatus` (`DRAFT`, `PUBLISHED`).

## Route Publik

Base: `/api/public`

1. `GET /novels`
2. `GET /novels/:slug`
3. `GET /novels/:novelSlug/chapters/:chapterSlug`
4. `GET /blogs`
5. `GET /blogs/:slug`
6. `GET /blog-categories`
7. `GET /blog-tags`

## Route Admin Auth

Base: `/api/admin/auth`

1. `POST /login`
2. `POST /logout`
3. `GET /me`

## Route Admin Content

Base: `/api/admin` (wajib session admin)

1. `GET /csrf-token`
2. `GET /dashboard`
3. `GET /novels`
4. `POST /novels`
5. `PATCH /novels/:id`
6. `DELETE /novels/:id`
7. `POST /novels/:novelId/chapters`
8. `PATCH /chapters/:id`
9. `DELETE /chapters/:id`
10. `GET /blogs`
11. `POST /blogs`
12. `PATCH /blogs/:id`
13. `DELETE /blogs/:id`
14. `GET /categories`
15. `POST /categories`
16. `GET /tags`
17. `POST /tags`
18. `POST /uploads/cover` (multipart key: `cover`)
19. `POST /uploads/thumbnail` (multipart key: `thumbnail`)

## Alur Kerja Backend

1. Admin login dengan email/password.
2. Password diverifikasi lewat `argon2.verify`.
3. Jika valid, server menyimpan `adminId` pada session cookie.
4. Route `/api/admin/*` diproteksi middleware `requireAdminAuth`.
5. Request create/update/delete harus membawa CSRF token valid.
6. Semua input divalidasi di server (`zod`) dan disanitasi untuk field teks.
7. Slug dibuat unik secara otomatis.
8. Konten `DRAFT` tidak tampil di route publik.
9. Upload gambar dibatasi mime type (jpg/png/webp) dan ukuran (`UPLOAD_MAX_MB`).

## Security Dasar yang Sudah Diterapkan

1. ORM Prisma (query parameterized) untuk mencegah SQL injection.
2. Validasi input server-side.
3. Password admin hash argon2.
4. Session cookie: `httpOnly`, `sameSite`, `secure` (production).
5. CSRF protection untuk semua mutasi data.
6. Auth middleware untuk admin route.
7. Upload protection (mime + size + random filename).
8. Sanitasi HTML/text input.
9. Helmet + rate limit login.

## Quick Start

1. Copy env:

```bash
cp .env.example .env
```

2. Install dependency:

```bash
npm install
```

3. Generate prisma client dan migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed admin:

```bash
npm run prisma:seed
```

5. Jalankan server:

```bash
npm run dev
```
