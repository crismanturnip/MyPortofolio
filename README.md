# Crisman Portfolio & Content Studio

Website personal Crisman yang menyatukan portfolio, ruang baca blog/novel, dan Content Management System (CMS) admin dalam satu aplikasi Next.js.

Project ini memiliki tiga pengalaman utama:

- Portfolio di `/` untuk memperkenalkan profil, pendidikan, galeri, sertifikat, proyek, blog, novel, dan kontak.
- Reader publik di `/reader`, `/blog`, dan `/novel` untuk membaca artikel, novel, serta chapter yang sudah dipublikasikan.
- Content Studio di `/admin` untuk mengelola seluruh konten tanpa perlu mengubah kode secara manual.

## Daftar Isi

- [Tujuan Project](#tujuan-project)
- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Arsitektur UI](#arsitektur-ui)
- [Arsitektur Frontend](#arsitektur-frontend)
- [Arsitektur Backend dan API](#arsitektur-backend-dan-api)
- [Arsitektur Data](#arsitektur-data)
- [Alur Konten](#alur-konten)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Route dan Endpoint](#route-dan-endpoint)
- [Keamanan](#keamanan)
- [Environment Variables](#environment-variables)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Deployment](#deployment)
- [Perintah NPM](#perintah-npm)
- [Catatan Pengembangan](#catatan-pengembangan)

## Tujuan Project

Project ini dibuat sebagai identitas digital Crisman. Portfolio memberikan gambaran singkat tentang perjalanan, karya, dan kontak. Reader menjadi ruang baca untuk blog dan novel. CMS memberikan panel sederhana agar konten dapat ditulis, disimpan sebagai draft, dan dipublikasikan langsung tanpa redeploy aplikasi.

## Fitur Utama

### Portfolio

- Hero section dengan navigasi anchor.
- About Me dengan konten yang dapat dibuka/tutup melalui tombol `Read More`.
- Riwayat pendidikan.
- Galeri dengan slide otomatis, hover caption, dan popup preview.
- Sertifikat dan proyek dalam slider; gambar dapat dibuka sebagai popup.
- Section `My Blog` dan `My Series` yang mengambil konten published dari API.
- Contact card untuk Instagram, LinkedIn, dan email dengan SVG brand icon.
- Desain responsif untuk desktop dan mobile.

### Reader Publik

- Landing page `/reader` berisi artikel dan novel terbaru.
- Halaman daftar serta detail blog.
- Halaman daftar serta detail novel.
- Reader chapter biasa dan mode story slide.
- Music player opsional pada novel dan chapter dengan play/pause, seek, durasi, volume, loading, dan penanganan error.
- Musik chapter memiliki prioritas; chapter tanpa musik memakai musik novel sebagai fallback.
- Card, typography, navigasi chapter, focus state, dan spacing responsif untuk HP hingga desktop besar.
- Animasi ringan menghormati `prefers-reduced-motion`.
- Progress slide disimpan di `localStorage` browser.
- Dark/light theme reader disimpan di `localStorage` browser.
- Quote section dengan musik latar yang dipicu saat section terlihat; browser tetap dapat memblokir autoplay sampai ada interaksi pengguna.
- Seluruh konten publik hanya menampilkan data dengan status `PUBLISHED`.

### CMS Admin

- Login admin tunggal berbasis email dan password.
- CMS multi-halaman dengan dashboard ringkasan serta halaman khusus blog, novel, chapter, kategori, tag, dan media.
- Rich text editor berbasis Tiptap untuk blog dan chapter.
- Status `DRAFT` atau `PUBLISHED`.
- Slug URL dibuat otomatis dan dijaga agar unik.
- Upload cover novel, thumbnail blog, dan gambar slide.
- Pengaturan musik novel/chapter melalui URL atau upload MP3, M4A, dan OGG maksimal 12 MB.
- Preview draft novel dan chapter terautentikasi, `noindex`, dan memiliki progress story terpisah dari publik.
- Chapter dapat memiliki kumpulan slide berisi gambar, teks, atau kombinasi keduanya.

## Arsitektur Sistem

```text
Browser
  |
  +-- / ------------------------------> Portfolio statis
  |                                      app/public/index.html
  |                                      app/public/assets/*
  |
  +-- /reader, /blog, /novel ---------> Next.js public reader
  |                                      Server Components + React UI
  |
  +-- /admin --------------------------> Next.js CMS admin
  |                                      Server pages + client editor + cookie session
  |
  +-- /api/public/* -------------------> Published content API
  |
  +-- /api/admin/* --------------------> Auth, CRUD, taxonomy, upload
                                             |
                                             +--> Prisma ORM
                                             |      |
                                             |      +--> PostgreSQL
                                             |
                                             +--> Vercel Blob (production image storage)
```

Project menggunakan satu codebase dan satu runtime Next.js. Tidak ada backend Express atau frontend terpisah yang aktif. Dokumen `docs/backend/README.md` adalah arsip implementasi lama dan bukan sumber runtime saat ini.

## Arsitektur UI

### 1. Portfolio (`/`)

Portfolio menggunakan HTML, CSS, dan JavaScript statis yang dilayani oleh Next.js route handler. Bagian ini sengaja dipertahankan sebagai halaman ringan dan visual, dengan sumber utama berikut:

```text
app/route.ts
  -> membaca app/public/index.html
      -> memuat assets/css/style.css
      -> memuat assets/js/script.js
      -> memuat assets/images/* dan assets/audio/*
```

Komponen UI utama:

| Area | Peran UI |
| --- | --- |
| Navbar | Navigasi ke setiap section portfolio dan menu mobile. |
| Home | Identitas, CTA ke About dan Contact, social shortcut. |
| About | Ringkasan profil dan konten tambahan yang dapat dibuka. |
| Education | Timeline pendidikan. |
| Gallery | Carousel otomatis, hover caption, dan lightbox. |
| Certificates | Carousel sertifikat dengan preview gambar. |
| Projects | Carousel karya dengan judul dan deskripsi. |
| My Blog / My Series | Kartu konten dinamis dari API published. |
| Contact | Tautan Instagram, LinkedIn, dan email. |

### 2. Reader Publik

Reader menggunakan bahasa visual yang lebih tenang dibanding portfolio: panel, card, reader typography, dark/light mode, dan layout baca yang fokus pada konten. `PublicShell` menyediakan header, menu mobile, theme switcher, serta footer yang dipakai halaman reader.

```text
PublicShell
  +-- Header: logo, navigasi, theme switcher, mobile menu
  +-- Main: reader / blog / novel / chapter
  +-- Footer: navigasi, kategori, sosial media
```

### 3. Admin CMS

Admin memakai workspace multi-halaman. Layout terautentikasi menyediakan sidebar desktop, drawer mobile, header, penanda menu aktif, dan logout. Setiap jenis konten memiliki halaman daftar dan editor sendiri sehingga form tidak saling berbagi state.

```text
Admin login
  -> session cookie
  -> shared admin layout
      -> Dashboard ringkasan
      -> Daftar / editor blog
      -> Daftar / editor novel
      -> Daftar chapter / editor slide
      -> Pengelola kategori dan tag
      -> Upload media
```

## Arsitektur Frontend

### Next.js App Router

Frontend React memakai Next.js App Router. Route group dipakai untuk memisahkan area publik dan admin tanpa mengubah URL.

```text
app/
  (public)/     halaman reader, blog, novel, chapter
  (admin)/      login dan workspace CMS multi-halaman
  api/          endpoint backend internal
  public/       sumber portfolio HTML/CSS/JS
```

### Rendering Strategy

- `/` memakai `force-dynamic` route handler karena membaca file HTML portfolio.
- `/reader`, `/blog`, dan `/novel` memakai `force-dynamic`; konten baru dari CMS muncul pada request berikutnya tanpa build ulang.
- Halaman detail menggunakan slug dan membaca data yang hanya berstatus `PUBLISHED`.
- Form admin, theme reader, audio quotes, dan story reader memakai Client Components; daftar admin mengambil data awal melalui Server Components.
- Halaman daftar/detail publik membaca database melalui Prisma di server untuk menjaga akses database tetap di backend.

### State di Browser

| Data | Lokasi | Kegunaan |
| --- | --- | --- |
| Reader theme | `localStorage` | Mengingat mode dark atau light. |
| Story progress | `localStorage` | Mengingat slide terakhir chapter. |
| Form editor admin | React state | Menjaga input editor sebelum request API. |
| Admin session | HTTP-only cookie | Tidak dapat dibaca JavaScript browser. |

## Arsitektur Backend dan API

Backend berada dalam Next.js Route Handlers pada `app/api`. Tidak ada service backend kedua yang wajib dijalankan.

```text
Request admin
  -> proxy.ts memfilter akses awal
  -> requireAdminApi / requireAdminPage
  -> validasi Zod
  -> Prisma
  -> PostgreSQL

Request publik
  -> Prisma query status PUBLISHED
  -> sanitize rich text
  -> resolve image / fallback image
  -> JSON response atau Server Component
```

### Modul Backend

| Modul | Tanggung jawab |
| --- | --- |
| `lib/prisma.ts` | Singleton Prisma Client. |
| `lib/session.ts` | Membuat, membaca, memverifikasi, dan menghapus HMAC session cookie. |
| `lib/admin.ts` | Guard admin untuk halaman dan API. |
| `lib/validators.ts` | Schema Zod untuk login, konten, taxonomy, dan slide. |
| `lib/slug.ts` | Normalisasi slug. |
| `lib/slug-unique.ts` | Menjamin slug unik sebelum data disimpan. |
| `lib/blob.ts` | Upload ke Vercel Blob atau upload lokal saat development. |
| `lib/sanitize-html.ts` | Sanitasi rich text sebelum dirender publik. |
| `lib/public-images.ts` | Fallback gambar saat URL kosong atau upload lokal tidak ditemukan. |

## Arsitektur Data

Database memakai PostgreSQL melalui Prisma. Sumber schema berada di `prisma/schema.prisma`.

```text
Admin

Blog --< BlogCategoryOnBlog >-- BlogCategory
  |
  +--< BlogTagOnBlog >-- BlogTag

Novel --< Chapter --< ChapterSlide
```

| Model | Fungsi |
| --- | --- |
| `Admin` | Akun tunggal untuk mengakses CMS. |
| `Blog` | Artikel dengan excerpt, thumbnail, rich text, status, kategori, dan tag. |
| `BlogCategory` | Kategori artikel. |
| `BlogTag` | Tag artikel. |
| `Novel` | Data utama novel, summary, genre, cover, status, dan musik fallback opsional. |
| `Chapter` | Chapter dari novel, rich text, nomor, slug, status, dan musik opsional. |
| `ChapterSlide` | Slide opsional dari chapter untuk mode story reader. |

Status publikasi memakai enum berikut:

```text
DRAFT      -> hanya terlihat di admin
PUBLISHED  -> tampil di reader dan API publik
```

## Alur Konten

```text
1. Admin login di /admin/login
2. Admin membuat atau mengubah blog / novel / chapter
3. Server memvalidasi payload dengan Zod
4. Prisma menyimpan data ke PostgreSQL
5. Jika status PUBLISHED, konten tersedia untuk reader dan API publik
6. Portfolio memanggil /api/public/portfolio-feed
7. Kartu My Blog dan My Series di portfolio diperbarui dari feed tersebut
```

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI library | React 19 |
| Bahasa | TypeScript, JavaScript, HTML, CSS |
| Styling reader/admin | Tailwind CSS 4 dan CSS global |
| Styling portfolio | CSS statis di `app/public/assets/css/style.css` |
| Editor | Tiptap |
| Icon | Lucide React, Boxicons, SVG brand icon |
| Database | PostgreSQL |
| ORM | Prisma |
| Validasi | Zod |
| Password hash | bcryptjs |
| Storage gambar production | Vercel Blob |
| Carousel portfolio | Swiper CDN |
| Deployment target | Vercel atau Node.js server yang mendukung Next.js |

## Struktur Folder

```text
.
├── app/
│   ├── (admin)/admin/                 # Login dan halaman workspace CMS
│   ├── (public)/                      # Reader, blog, novel, chapter
│   ├── api/
│   │   ├── admin/                     # Auth, CRUD, taxonomy, upload
│   │   └── public/                    # API published dan portfolio feed
│   ├── assets/[...path]/route.ts      # Penyaji CSS, JS, gambar, audio portfolio
│   ├── uploads/[...path]/route.ts     # Penyaji upload lokal saat development
│   ├── public/                        # HTML/CSS/JS portfolio statis
│   ├── globals.css                    # Style global reader dan admin
│   ├── layout.tsx                     # Root layout + metadata dasar
│   └── route.ts                       # Route root portfolio
├── components/
│   ├── admin/                          # Shell, form, list, taxonomy, dan media CMS
│   ├── admin-login-form.tsx
│   ├── public-shell.tsx
│   ├── quote-music-player.tsx
│   ├── rich-text-editor.tsx
│   └── story-reader.tsx
├── lib/                               # Prisma, auth, upload, validator, slug
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── docs/                              # Dokumentasi tambahan dan arsip
├── proxy.ts                           # Proteksi awal route admin
├── next.config.ts
└── package.json
```

## Route dan Endpoint

### Halaman

| URL | Deskripsi |
| --- | --- |
| `/` | Portfolio utama. |
| `/reader` | Landing reader dan konten terbaru. |
| `/blog` | Daftar blog published. |
| `/blog/[slug]` | Detail blog published. |
| `/novel` | Daftar novel published. |
| `/novel/[slug]` | Detail novel serta daftar chapter. |
| `/novel/[slug]/chapter/[chapterSlug]` | Reader chapter atau story slide. |
| `/admin/login` | Login CMS. |
| `/admin/dashboard` | Dashboard CMS yang diproteksi. |
| `/admin/blogs` | Daftar blog. |
| `/admin/blogs/new` | Membuat blog. |
| `/admin/blogs/[id]/edit` | Mengedit blog. |
| `/admin/novels` | Daftar novel. |
| `/admin/novels/new` | Membuat novel. |
| `/admin/novels/[id]/edit` | Mengedit novel. |
| `/admin/novels/[id]/chapters` | Mengelola chapter novel. |
| `/admin/chapters/[id]/edit` | Mengedit konten dan slide chapter. |
| `/admin/categories` | Mengelola kategori blog. |
| `/admin/tags` | Mengelola tag blog. |
| `/admin/media` | Mengunggah gambar dan menyalin URL media. |
| `/admin/preview/novels/[id]` | Preview novel draft yang hanya dapat diakses admin. |
| `/admin/preview/chapters/[id]` | Preview chapter atau story draft yang hanya dapat diakses admin. |

### Public API

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/public/portfolio-feed` | Feed blog dan novel untuk portfolio. |
| `GET` | `/api/public/blogs` | Semua blog published. |
| `GET` | `/api/public/blogs/[slug]` | Detail blog published. |
| `GET` | `/api/public/novels` | Semua novel published beserta chapter published. |
| `GET` | `/api/public/novels/[slug]` | Detail novel published. |
| `GET` | `/api/public/novels/[slug]/chapters/[chapterSlug]` | Detail chapter published. |

Public API mengizinkan CORS untuk konsumsi portfolio. Jangan gunakan endpoint admin sebagai public API.

### Admin API

Semua endpoint berikut membutuhkan session admin kecuali login.

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/api/admin/auth/login` | Login admin. |
| `POST` | `/api/admin/auth/logout` | Logout admin. |
| `GET` | `/api/admin/auth/me` | Identitas session aktif. |
| `GET`, `POST` | `/api/admin/blogs` | Daftar dan buat blog. |
| `PATCH`, `DELETE` | `/api/admin/blogs/[id]` | Ubah atau hapus blog. |
| `GET`, `POST` | `/api/admin/novels` | Daftar dan buat novel. |
| `PATCH`, `DELETE` | `/api/admin/novels/[id]` | Ubah atau hapus novel. |
| `GET`, `POST` | `/api/admin/chapters` | Daftar dan buat chapter. |
| `PATCH`, `DELETE` | `/api/admin/chapters/[id]` | Ubah atau hapus chapter. |
| `GET`, `POST` | `/api/admin/categories` | Daftar dan buat kategori blog. |
| `PATCH`, `DELETE` | `/api/admin/categories/[id]` | Ubah kategori atau hapus jika belum digunakan. |
| `GET`, `POST` | `/api/admin/tags` | Daftar dan buat tag blog. |
| `PATCH`, `DELETE` | `/api/admin/tags/[id]` | Ubah tag atau hapus jika belum digunakan. |
| `POST` | `/api/admin/upload` | Upload cover, thumbnail, slide, atau audio. |

## Keamanan

Yang telah diterapkan saat ini:

- Password admin disimpan sebagai hash bcrypt, bukan plaintext.
- Session memakai signed HMAC cookie dengan atribut `httpOnly` dan `sameSite=lax`.
- API admin serta halaman dashboard memeriksa session admin.
- Query database menggunakan Prisma untuk menghindari SQL injection dari query manual.
- Payload login, blog, novel, chapter, taxonomy, dan slide diperiksa dengan Zod.
- Konten rich text disanitasi sebelum diberikan ke pembaca publik.
- Upload gambar dibatasi ke JPEG, PNG, atau WebP dengan ukuran maksimum 2 MB.
- Upload audio dibatasi ke MP3, M4A, atau OGG dengan ukuran maksimum 12 MB; MIME, ekstensi, dan signature file divalidasi.
- Field musik `musicTitle`, `musicArtist`, dan `musicUrl` bersifat opsional pada `Novel` dan `Chapter`.
- Route penyaji asset dan upload memvalidasi path untuk mencegah path traversal.
- Hanya konten berstatus `PUBLISHED` yang dapat dibaca dari route publik.

Sebelum rilis publik, tambahkan rate limiting login, security headers, dan sanitasi HTML berbasis parser khusus bila CMS akan digunakan oleh lebih dari satu orang atau menerima konten dari pihak lain.

## Environment Variables

Buat file `.env` berdasarkan `.env.example`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
ADMIN_EMAIL="your-admin@example.com"
ADMIN_PASSWORD="change-this-strong-password"
ADMIN_SESSION_SECRET="replace-with-min-32-char-random-secret"
BLOB_READ_WRITE_TOKEN="vercel-blob-read-write-token"
```

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | URL koneksi PostgreSQL. |
| `ADMIN_EMAIL` | Ya untuk production seed | Email akun admin pertama. |
| `ADMIN_PASSWORD` | Ya untuk production seed | Password akun admin pertama. Gunakan password kuat. |
| `ADMIN_SESSION_SECRET` | Ya | Secret minimal 32 karakter untuk menandatangani cookie session. |
| `BLOB_READ_WRITE_TOKEN` | Ya di Vercel | Token Vercel Blob untuk upload gambar production. |

Jangan pernah melakukan commit pada file `.env`.

## Menjalankan Secara Lokal

### Prasyarat

- Node.js versi LTS terbaru.
- PostgreSQL aktif dan `DATABASE_URL` valid.
- npm.

### Instalasi

```bash
npm install
```

### Konfigurasi environment

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Lalu isi nilai `.env` dengan database dan kredensial admin Anda.

### Database

Untuk development lokal:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Jalankan server development

```bash
npm run dev
```

Buka:

- Portfolio: `http://localhost:3000`
- Reader: `http://localhost:3000/reader`
- Admin login: `http://localhost:3000/admin/login`
- Public feed: `http://localhost:3000/api/public/portfolio-feed`

Saat development tanpa `BLOB_READ_WRITE_TOKEN`, gambar upload disimpan sementara pada `public/uploads`. Folder ini diabaikan oleh Git dan tidak boleh dijadikan storage production.

## Deployment

### Target yang Direkomendasikan

Vercel direkomendasikan karena project telah memakai Vercel Blob. Aplikasi juga dapat dijalankan pada server Node.js yang mendukung Next.js dan PostgreSQL.

### Checklist Sebelum Deploy

1. Push branch `main` ke repository GitHub.
2. Buat database PostgreSQL production.
3. Tambahkan semua environment variable production pada hosting.
4. Jalankan migration production:

```bash
npm run prisma:deploy
```

5. Seed admin pertama dengan environment production yang sudah benar:

```bash
npm run prisma:seed
```

6. Hubungkan Vercel Blob dan isi `BLOB_READ_WRITE_TOKEN`.
7. Jalankan pemeriksaan lokal:

```bash
npm run lint
npm run build
```

8. Setelah deploy, verifikasi `/`, `/reader`, `/blog`, `/novel`, `/admin/login`, dan upload media.

### Build Manual

```bash
npm run build
npm run start
```

Jangan deploy hanya sebagai static hosting atau hanya mengunggah `index.html`. Project membutuhkan runtime Next.js untuk route dinamis, admin, API, database, session, dan upload.

## Perintah NPM

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan Next.js development server. |
| `npm run build` | Membuat production build. |
| `npm run start` | Menjalankan hasil production build. |
| `npm run lint` | Type checking TypeScript. |
| `npm run typecheck` | Alias type checking TypeScript. |
| `npm run prisma:generate` | Membuat Prisma Client. |
| `npm run prisma:migrate` | Membuat dan menerapkan migration development. |
| `npm run prisma:deploy` | Menerapkan migration yang sudah ada ke production. |
| `npm run prisma:seed` | Membuat atau memperbarui admin awal. |

## Catatan Pengembangan

- Sumber CSS, JavaScript, dan gambar portfolio yang aktif berada di `app/public/assets/`.
- File `app/public/style.css`, `app/public/script.js`, serta gambar langsung di `app/public/` adalah salinan lama. Jangan gunakan sebagai sumber perubahan utama.
- `docs/RUNTIME_MAP.md` memetakan file yang aktif dan non-runtime.
- `content/` dan `docs/backend/README.md` bersifat referensi/arsip, bukan bagian dari runtime produksi.
- File hasil build, log, screenshot audit, upload lokal, dan `.env` sudah dikecualikan melalui `.gitignore` dan `.vercelignore`.

## Status Kesiapan

Project sudah memiliki build production yang lulus serta route publik/admin yang terintegrasi dalam satu aplikasi. Sebelum deployment final, pastikan database production, Vercel Blob, variable environment, migration, dan akun admin sudah diverifikasi.
