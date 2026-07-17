"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  ArrowDown,
  ArrowUp,
  FileText,
  Folder,
  Home,
  ImageIcon,
  LayoutDashboard,
  Library,
  LogOut,
  Plus,
  RefreshCw,
  Rss,
  Save,
  Search,
  Tag,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";

type PublishStatus = "DRAFT" | "PUBLISHED";
type Section = "overview" | "blogs" | "novels" | "chapters" | "taxonomy" | "media" | "feed";

type TaxonomyItem = {
  id: number;
  name: string;
  slug: string;
};

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  status: PublishStatus;
  updatedAt?: string;
  categories: { category: TaxonomyItem }[];
  tags: { tag: TaxonomyItem }[];
};

type Novel = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  genre: string | null;
  coverUrl: string | null;
  status: PublishStatus;
  updatedAt?: string;
};

type ChapterSlide = {
  id?: number;
  clientId?: string;
  order: number;
  type: "image" | "text" | "image-text";
  imageUrl: string;
  title: string;
  content: string;
  caption: string;
  altText: string;
};

type Chapter = {
  id: number;
  novelId: number;
  title: string;
  slug: string;
  chapterNumber: number;
  content: string;
  status: PublishStatus;
  novel: { title: string; slug: string };
  slides: ChapterSlide[];
};

type FeedItem = { type: "blog" | "novel"; title: string; slug: string; updatedAt: string };

const blankBlog = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "<h2>Mulai menulis...</h2><p>Tulis artikel portfolio, pengalaman, atau pemikiranmu di sini.</p>",
  thumbnailUrl: "",
  status: "DRAFT" as PublishStatus,
  categoryIds: [] as number[],
  tagIds: [] as number[],
};

const blankNovel = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  genre: "",
  coverUrl: "",
  status: "DRAFT" as PublishStatus,
};

const blankChapter = {
  id: "",
  novelId: "",
  title: "",
  slug: "",
  chapterNumber: 1,
  content: "<p>Mulai menulis chapter novel di sini.</p>",
  status: "DRAFT" as PublishStatus,
  slides: [] as ChapterSlide[],
};

const menu = [
  { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "blogs" as const, label: "Blog Posts", icon: FileText },
  { id: "novels" as const, label: "Novel", icon: BookOpen },
  { id: "chapters" as const, label: "Chapters", icon: Library },
  { id: "taxonomy" as const, label: "Categories & Tags", icon: Folder },
  { id: "media" as const, label: "Media Library", icon: ImageIcon },
  { id: "feed" as const, label: "Published Feed", icon: Rss },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{children}</label>;
}

function inputClass() {
  return "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
}

function textareaClass() {
  return "min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
}

function StatusPill({ status }: { status: PublishStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
        status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
      }`}
    >
      {status}
    </span>
  );
}

function selectedNumbers(options: HTMLCollectionOf<HTMLOptionElement>) {
  return Array.from(options).map((option) => Number(option.value));
}

function wordCount(html: string) {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [active, setActive] = useState<Section>("overview");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [tags, setTags] = useState<TaxonomyItem[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState("Memuat data CMS...");
  const [blogForm, setBlogForm] = useState(blankBlog);
  const [novelForm, setNovelForm] = useState(blankNovel);
  const [chapterForm, setChapterForm] = useState(blankChapter);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [tagForm, setTagForm] = useState({ name: "", slug: "" });
  const [mediaPreview, setMediaPreview] = useState("");

  const stats = useMemo(() => {
    const publishedBlogs = blogs.filter((blog) => blog.status === "PUBLISHED").length;
    const publishedNovels = novels.filter((novel) => novel.status === "PUBLISHED").length;
    const publishedChapters = chapters.filter((chapter) => chapter.status === "PUBLISHED").length;
    return [
      { label: "Total Tulisan", value: blogs.length + novels.length + chapters.length, icon: Boxes, hint: "Blog, novel, dan chapter" },
      { label: "Blog Published", value: publishedBlogs, icon: FileText, hint: `${blogs.length - publishedBlogs} draft` },
      { label: "Novel Published", value: publishedNovels, icon: BookOpen, hint: `${publishedChapters} chapter live` },
      { label: "Taxonomy", value: categories.length + tags.length, icon: Tag, hint: "Kategori dan tag" },
    ];
  }, [blogs, novels, chapters, categories, tags]);

  const latestItems = useMemo(
    () =>
      [
        ...blogs.map((item) => ({ kind: "Blog", title: item.title, status: item.status })),
        ...novels.map((item) => ({ kind: "Novel", title: item.title, status: item.status })),
        ...chapters.map((item) => ({ kind: "Chapter", title: item.title, status: item.status })),
      ].slice(0, 6),
    [blogs, novels, chapters]
  );

  async function request(path: string, init?: RequestInit) {
    const res = await fetch(path, init);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : { message: await res.text() };
    if (!res.ok) {
      throw new Error(data.message || "Permintaan gagal.");
    }
    return data;
  }

  async function loadAll() {
    try {
      const [blogResult, novelResult, chapterResult, categoryResult, tagResult, feedResult] = await Promise.all([
        request("/api/admin/blogs"),
        request("/api/admin/novels"),
        request("/api/admin/chapters"),
        request("/api/admin/categories"),
        request("/api/admin/tags"),
        request("/api/public/portfolio-feed"),
      ]);
      setBlogs(blogResult.data);
      setNovels(novelResult.data);
      setChapters(chapterResult.data);
      setCategories(categoryResult.data);
      setTags(tagResult.data);
      setFeed(feedResult.data);
      setStatus("Semua data CMS berhasil dimuat.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  useEffect(() => {
    loadAll().catch(() => null);
  }, []);

  async function handleLogout() {
    await request("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function uploadImage(file: File, kind: "cover" | "thumbnail") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    const result = await request("/api/admin/upload", { method: "POST", body: formData });
    return String(result.data.url);
  }

  async function uploadEditorImage(file: File) {
    const url = await uploadImage(file, "thumbnail");
    setStatus("Gambar berhasil dimasukkan ke editor.");
    return url;
  }

  function addChapterSlide(type: ChapterSlide["type"] = "text") {
    setChapterForm((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          clientId: createClientId(),
          order: current.slides.length + 1,
          type,
          imageUrl: "",
          title: "",
          content: type === "text" ? "Tulis narasi slide di sini." : "",
          caption: "",
          altText: "",
        },
      ],
    }));
  }

  function updateChapterSlide(index: number, patch: Partial<ChapterSlide>) {
    setChapterForm((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...patch } : slide)),
    }));
  }

  function removeChapterSlide(index: number) {
    if (!window.confirm("Hapus slide ini?")) return;
    setChapterForm((current) => ({
      ...current,
      slides: current.slides
        .filter((_, slideIndex) => slideIndex !== index)
        .map((slide, slideIndex) => ({ ...slide, order: slideIndex + 1 })),
    }));
  }

  function moveChapterSlide(index: number, direction: -1 | 1) {
    setChapterForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.slides.length) return current;
      const slides = [...current.slides];
      const currentSlide = slides[index];
      slides[index] = slides[nextIndex];
      slides[nextIndex] = currentSlide;
      return {
        ...current,
        slides: slides.map((slide, slideIndex) => ({ ...slide, order: slideIndex + 1 })),
      };
    });
  }

  async function saveBlog(targetStatus?: PublishStatus) {
    try {
      const payload = { ...blogForm, id: undefined, status: targetStatus || blogForm.status };
      const method = blogForm.id ? "PATCH" : "POST";
      const path = blogForm.id ? `/api/admin/blogs/${blogForm.id}` : "/api/admin/blogs";
      await request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setBlogForm(blankBlog);
      setStatus(targetStatus === "PUBLISHED" ? "Blog berhasil dipublikasikan." : "Blog berhasil disimpan.");
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function saveNovel(targetStatus?: PublishStatus) {
    try {
      const payload = { ...novelForm, id: undefined, status: targetStatus || novelForm.status };
      const method = novelForm.id ? "PATCH" : "POST";
      const path = novelForm.id ? `/api/admin/novels/${novelForm.id}` : "/api/admin/novels";
      await request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setNovelForm(blankNovel);
      setStatus("Novel berhasil disimpan.");
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function saveChapter(targetStatus?: PublishStatus) {
    try {
      const payload = {
        ...chapterForm,
        id: undefined,
        novelId: Number(chapterForm.novelId),
        status: targetStatus || chapterForm.status,
        slides: chapterForm.slides.map((slide, index) => ({ ...slide, order: index + 1 })),
      };
      const method = chapterForm.id ? "PATCH" : "POST";
      const path = chapterForm.id ? `/api/admin/chapters/${chapterForm.id}` : "/api/admin/chapters";
      await request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setChapterForm(blankChapter);
      setStatus("Chapter berhasil disimpan.");
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function saveCategory() {
    try {
      await request("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      setCategoryForm({ name: "", slug: "" });
      setStatus("Kategori berhasil dibuat.");
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function saveTag() {
    try {
      await request("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tagForm),
      });
      setTagForm({ name: "", slug: "" });
      setStatus("Tag berhasil dibuat.");
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function removeItem(path: string, message: string) {
    try {
      await request(path, { method: "DELETE" });
      setStatus(message);
      await loadAll();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-slate-950 text-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 font-black text-white">C</div>
            <div>
              <p className="font-bold">Crisman Admin</p>
              <p className="text-xs text-slate-400">Personal CMS</p>
            </div>
          </div>
          <nav className="grid gap-1 px-3">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active === item.id ? "bg-emerald-500/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            <a href="/reader" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-200">
              <Home size={18} />
              Lihat Situs Publik
            </a>
            <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Crisman Studio</p>
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
                {active === "overview" ? `Selamat datang, ${adminName}` : menu.find((item) => item.id === active)?.label}
              </h1>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-11 w-72 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400">
                <Search size={17} />
                Cari konten...
              </div>
              <button onClick={() => setActive("blogs")} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white">
                <Plus size={17} />
                Buat Baru
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  active === item.id ? "bg-slate-950 text-white" : "bg-white text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">{status}</p>
            <button onClick={loadAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {active === "overview" ? (
            <section className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Icon size={22} />
                        </div>
                        <BarChart3 className="text-slate-300" size={20} />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-500">{stat.label}</p>
                      <p className="mt-1 text-3xl font-black">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.hint}</p>
                    </article>
                  );
                })}
              </div>
              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black">Tulisan Terbaru</h2>
                    <button className="text-sm font-bold text-emerald-700" onClick={() => setActive("feed")}>Lihat semua</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {latestItems.length === 0 ? <p className="py-6 text-sm text-slate-500">Belum ada konten.</p> : null}
                    {latestItems.map((item, index) => (
                      <div key={`${item.kind}-${item.title}-${index}`} className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-bold">{item.title}</p>
                          <p className="text-sm text-slate-500">{item.kind}</p>
                        </div>
                        <StatusPill status={item.status} />
                      </div>
                    ))}
                  </div>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black">Tulis Cepat</h2>
                  <div className="mt-4 grid gap-3">
                    <button onClick={() => setActive("blogs")} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50">
                      <FileText className="text-emerald-700" />
                      <span><strong className="block">Tulis Blog</strong><span className="text-sm text-slate-500">Buat artikel baru</span></span>
                    </button>
                    <button onClick={() => setActive("chapters")} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50">
                      <BookOpen className="text-blue-700" />
                      <span><strong className="block">Tulis Chapter</strong><span className="text-sm text-slate-500">Lanjutkan cerita novel</span></span>
                    </button>
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {active === "blogs" ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
              <div className="grid gap-4">
                <PanelTitle title="Buat Postingan Blog" subtitle="Tulis artikel dengan editor WYSIWYG dan preview pembaca." />
                <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FieldLabel>Judul Postingan</FieldLabel>
                      <input className={inputClass()} value={blogForm.title} onChange={(e) => setBlogForm((x) => ({ ...x, title: e.target.value }))} placeholder="Judul artikel blog" />
                    </div>
                    <div>
                      <FieldLabel>Slug URL</FieldLabel>
                      <input className={inputClass()} value={blogForm.slug} onChange={(e) => setBlogForm((x) => ({ ...x, slug: e.target.value }))} placeholder="slug-artikel" />
                    </div>
                    <div>
                      <FieldLabel>Excerpt</FieldLabel>
                      <input className={inputClass()} value={blogForm.excerpt} onChange={(e) => setBlogForm((x) => ({ ...x, excerpt: e.target.value }))} placeholder="Ringkasan singkat" />
                    </div>
                  </div>
                  <ImageUpload
                    label="Thumbnail"
                    value={blogForm.thumbnailUrl}
                    onChange={(url) => setBlogForm((x) => ({ ...x, thumbnailUrl: url }))}
                    onUpload={(file) => uploadImage(file, "thumbnail")}
                  />
                  <RichTextEditor value={blogForm.content} onChange={(content) => setBlogForm((x) => ({ ...x, content }))} onUploadImage={uploadEditorImage} />
                </div>
              </div>
              <aside className="grid content-start gap-4">
                <PublishPanel
                  status={blogForm.status}
                  onStatus={(value) => setBlogForm((x) => ({ ...x, status: value }))}
                  onDraft={() => saveBlog("DRAFT")}
                  onPublish={() => saveBlog("PUBLISHED")}
                  words={wordCount(blogForm.content)}
                />
                <TaxonomyPicker
                  categories={categories}
                  tags={tags}
                  categoryIds={blogForm.categoryIds}
                  tagIds={blogForm.tagIds}
                  onCategory={(ids) => setBlogForm((x) => ({ ...x, categoryIds: ids }))}
                  onTag={(ids) => setBlogForm((x) => ({ ...x, tagIds: ids }))}
                />
                <ContentList
                  title="Daftar Blog"
                  items={blogs.map((blog) => ({
                    id: blog.id,
                    title: blog.title,
                    meta: `/blog/${blog.slug}`,
                    status: blog.status,
                    onEdit: () => {
                      setBlogForm({
                        id: String(blog.id),
                        title: blog.title,
                        slug: blog.slug,
                        excerpt: blog.excerpt || "",
                        content: blog.content,
                        thumbnailUrl: blog.thumbnailUrl || "",
                        status: blog.status,
                        categoryIds: blog.categories.map(({ category }) => category.id),
                        tagIds: blog.tags.map(({ tag }) => tag.id),
                      });
                    },
                    onDelete: () => removeItem(`/api/admin/blogs/${blog.id}`, "Blog berhasil dihapus."),
                  }))}
                />
              </aside>
            </section>
          ) : null}

          {active === "novels" ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_330px]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <PanelTitle title="Kelola Novel" subtitle="Atur identitas novel, cover, genre, dan sinopsis." />
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                  <ImageUpload label="Cover Novel" value={novelForm.coverUrl} onChange={(url) => setNovelForm((x) => ({ ...x, coverUrl: url }))} onUpload={(file) => uploadImage(file, "cover")} portrait />
                  <div className="grid gap-4">
                    <div>
                      <FieldLabel>Title Novel</FieldLabel>
                      <input className={inputClass()} value={novelForm.title} onChange={(e) => setNovelForm((x) => ({ ...x, title: e.target.value }))} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <FieldLabel>Slug Novel</FieldLabel>
                        <input className={inputClass()} value={novelForm.slug} onChange={(e) => setNovelForm((x) => ({ ...x, slug: e.target.value }))} />
                      </div>
                      <div>
                        <FieldLabel>Genre</FieldLabel>
                        <input className={inputClass()} value={novelForm.genre} onChange={(e) => setNovelForm((x) => ({ ...x, genre: e.target.value }))} placeholder="Fantasi, Drama" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Synopsis</FieldLabel>
                      <textarea className={textareaClass()} value={novelForm.summary} onChange={(e) => setNovelForm((x) => ({ ...x, summary: e.target.value }))} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveNovel("DRAFT")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold"><Save size={16} /> Simpan Draft</button>
                      <button onClick={() => saveNovel("PUBLISHED")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Publikasikan</button>
                    </div>
                  </div>
                </div>
              </div>
              <ContentList
                title="Daftar Novel"
                items={novels.map((novel) => ({
                  id: novel.id,
                  title: novel.title,
                  meta: `${novel.genre || "Tanpa genre"} • /novel/${novel.slug}`,
                  status: novel.status,
                  onEdit: () => setNovelForm({
                    id: String(novel.id),
                    title: novel.title,
                    slug: novel.slug,
                    summary: novel.summary,
                    genre: novel.genre || "",
                    coverUrl: novel.coverUrl || "",
                    status: novel.status,
                  }),
                  onDelete: () => removeItem(`/api/admin/novels/${novel.id}`, "Novel berhasil dihapus."),
                }))}
              />
            </section>
          ) : null}

          {active === "chapters" ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_330px]">
              <div className="grid gap-4">
                <PanelTitle title="Tulis Chapter Novel" subtitle="Editor panjang untuk cerita, dialog, quote, gambar, dan preview." />
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <FieldLabel>Pilih Novel</FieldLabel>
                      <select className={inputClass()} value={chapterForm.novelId} onChange={(e) => setChapterForm((x) => ({ ...x, novelId: e.target.value }))}>
                        <option value="">Pilih novel</option>
                        {novels.map((novel) => <option key={novel.id} value={novel.id}>{novel.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Nomor Chapter</FieldLabel>
                      <input className={inputClass()} type="number" min={1} value={chapterForm.chapterNumber} onChange={(e) => setChapterForm((x) => ({ ...x, chapterNumber: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <FieldLabel>Judul Chapter</FieldLabel>
                      <input className={inputClass()} value={chapterForm.title} onChange={(e) => setChapterForm((x) => ({ ...x, title: e.target.value }))} />
                    </div>
                    <div>
                      <FieldLabel>Slug Chapter</FieldLabel>
                      <input className={inputClass()} value={chapterForm.slug} onChange={(e) => setChapterForm((x) => ({ ...x, slug: e.target.value }))} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <RichTextEditor value={chapterForm.content} onChange={(content) => setChapterForm((x) => ({ ...x, content }))} onUploadImage={uploadEditorImage} minHeightClassName="min-h-[480px]" />
                  </div>
                  <SlideEditor
                    slides={chapterForm.slides}
                    onAdd={addChapterSlide}
                    onChange={updateChapterSlide}
                    onRemove={removeChapterSlide}
                    onMove={moveChapterSlide}
                    onUpload={async (file) => uploadImage(file, "thumbnail")}
                  />
                </div>
              </div>
              <aside className="grid content-start gap-4">
                <PublishPanel
                  status={chapterForm.status}
                  onStatus={(value) => setChapterForm((x) => ({ ...x, status: value }))}
                  onDraft={() => saveChapter("DRAFT")}
                  onPublish={() => saveChapter("PUBLISHED")}
                  words={wordCount(chapterForm.content)}
                />
                <ContentList
                  title="Daftar Chapter"
                  items={chapters.map((chapter) => ({
                    id: chapter.id,
                    title: `Ch ${chapter.chapterNumber}: ${chapter.title}`,
                    meta: chapter.novel.title,
                    status: chapter.status,
                    onEdit: () => setChapterForm({
                      id: String(chapter.id),
                      novelId: String(chapter.novelId),
                      title: chapter.title,
                      slug: chapter.slug,
                      chapterNumber: chapter.chapterNumber,
                      content: chapter.content,
                      status: chapter.status,
                      slides: (chapter.slides || []).map((slide, index) => ({
                        id: slide.id,
                        clientId: String(slide.id ?? createClientId()),
                        order: index + 1,
                        type: slide.type,
                        imageUrl: slide.imageUrl || "",
                        title: slide.title || "",
                        content: slide.content || "",
                        caption: slide.caption || "",
                        altText: slide.altText || "",
                      })),
                    }),
                    onDelete: () => removeItem(`/api/admin/chapters/${chapter.id}`, "Chapter berhasil dihapus."),
                  }))}
                />
              </aside>
            </section>
          ) : null}

          {active === "taxonomy" ? (
            <section className="grid gap-5 lg:grid-cols-2">
              <TaxonomyPanel title="Kategori" form={categoryForm} onForm={setCategoryForm} onSave={saveCategory} items={categories} />
              <TaxonomyPanel title="Tag" form={tagForm} onForm={setTagForm} onSave={saveTag} items={tags} />
            </section>
          ) : null}

          {active === "media" ? (
            <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <PanelTitle title="Media Library" subtitle="Upload gambar untuk thumbnail, cover, atau editor." />
                <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-400 hover:bg-blue-50">
                  <UploadCloud className="text-blue-600" size={34} />
                  <span className="mt-3 font-bold">Klik untuk upload gambar</span>
                  <span className="text-sm text-slate-500">PNG, JPG, WEBP maksimal 2MB</span>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const url = await uploadImage(file, "thumbnail");
                      setMediaPreview(url);
                      setStatus("Media berhasil diupload.");
                    }}
                  />
                </label>
                {mediaPreview ? <img className="mt-5 aspect-video w-full rounded-2xl object-cover" src={mediaPreview} alt="Preview media" /> : null}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <PanelTitle title="Media dari Konten" subtitle="Gambar yang sedang dipakai oleh blog dan novel." />
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[...blogs.map((b) => b.thumbnailUrl), ...novels.map((n) => n.coverUrl)].filter(Boolean).map((url) => (
                    <img key={url} src={String(url)} alt="Media" className="aspect-video rounded-2xl object-cover" />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {active === "feed" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <PanelTitle title="Published Feed" subtitle="Konten published yang tampil di portfolio dan API feed." />
              <div className="mt-5 divide-y divide-slate-100">
                {feed.length === 0 ? <p className="py-8 text-sm text-slate-500">Belum ada feed published.</p> : null}
                {feed.map((item) => (
                  <a key={`${item.type}-${item.slug}`} href={item.type === "blog" ? `/blog/${item.slug}` : `/novel/${item.slug}`} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.type}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Published</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
  portrait,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  portrait?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className={`grid gap-3 ${portrait ? "" : "md:grid-cols-[180px_1fr]"}`}>
        {value ? (
          <img className={`${portrait ? "aspect-[3/4]" : "aspect-video"} w-full rounded-2xl border border-slate-200 object-cover`} src={value} alt={label} />
        ) : (
          <div className={`${portrait ? "aspect-[3/4]" : "aspect-video"} grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400`}>
            Belum ada gambar
          </div>
        )}
        <div className="grid content-center gap-2">
          <input className={inputClass()} value={value} onChange={(event) => onChange(event.target.value)} placeholder="/uploads/..." />
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <UploadCloud size={16} />
            Pilih File
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                onChange(await onUpload(file));
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function SlideEditor({
  slides,
  onAdd,
  onChange,
  onRemove,
  onMove,
  onUpload,
}: {
  slides: ChapterSlide[];
  onAdd: (type?: ChapterSlide["type"]) => void;
  onChange: (index: number, patch: Partial<ChapterSlide>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-black text-slate-950">Slide AU Reader</h3>
          <p className="text-sm text-slate-500">Tambahkan slide untuk reader carousel. Jika kosong, chapter tetap tampil sebagai artikel biasa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onAdd("text")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            <Plus size={15} />
            Teks
          </button>
          <button type="button" onClick={() => onAdd("image")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            <ImageIcon size={15} />
            Gambar
          </button>
          <button type="button" onClick={() => onAdd("image-text")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
            <Plus size={15} />
            Gambar + Teks
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {slides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Belum ada slide. Tambahkan slide untuk mengaktifkan reader carousel pada chapter ini.
          </div>
        ) : null}

        {slides.map((slide, index) => (
          <div key={slide.id ?? slide.clientId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="lg:w-44">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.altText || slide.title || `Slide ${index + 1}`} className="h-full w-full object-contain" />
                  ) : (
                    <div className="grid h-full place-items-center p-4 text-center text-xs font-bold text-slate-400">Preview slide {index + 1}</div>
                  )}
                </div>
                <p className="mt-2 text-center text-xs font-bold text-slate-500">Slide {index + 1}</p>
              </div>

              <div className="grid flex-1 gap-3">
                <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                  <div>
                    <FieldLabel>Tipe Slide</FieldLabel>
                    <select className={inputClass()} value={slide.type} onChange={(event) => onChange(index, { type: event.target.value as ChapterSlide["type"] })}>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="image-text">Image + Text</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Judul Kecil</FieldLabel>
                    <input className={inputClass()} value={slide.title} onChange={(event) => onChange(index, { title: event.target.value })} placeholder="Opsional" />
                  </div>
                </div>

                {slide.type !== "text" ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <div>
                      <FieldLabel>URL Gambar</FieldLabel>
                      <input className={inputClass()} value={slide.imageUrl} onChange={(event) => onChange(index, { imageUrl: event.target.value })} placeholder="/uploads/..." />
                    </div>
                    <label className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 md:mt-5">
                      <UploadCloud size={16} />
                      Upload
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          onChange(index, { imageUrl: await onUpload(file) });
                        }}
                      />
                    </label>
                  </div>
                ) : null}

                {slide.type !== "image" ? (
                  <div>
                    <FieldLabel>Narasi</FieldLabel>
                    <textarea className={textareaClass()} value={slide.content} onChange={(event) => onChange(index, { content: event.target.value })} placeholder="Tulis narasi, chat, atau isi slide." />
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel>Caption</FieldLabel>
                    <input className={inputClass()} value={slide.caption} onChange={(event) => onChange(index, { caption: event.target.value })} placeholder="Opsional" />
                  </div>
                  <div>
                    <FieldLabel>Alt Text</FieldLabel>
                    <input className={inputClass()} value={slide.altText} onChange={(event) => onChange(index, { altText: event.target.value })} placeholder="Deskripsi gambar untuk aksesibilitas" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">
                    <ArrowUp size={14} />
                    Naik
                  </button>
                  <button type="button" disabled={index === slides.length - 1} onClick={() => onMove(index, 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">
                    <ArrowDown size={14} />
                    Turun
                  </button>
                  <button type="button" onClick={() => onRemove(index)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishPanel({
  status,
  onStatus,
  onDraft,
  onPublish,
  words,
}: {
  status: PublishStatus;
  onStatus: (status: PublishStatus) => void;
  onDraft: () => void;
  onPublish: () => void;
  words: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-black">Publikasi</h3>
      <div className="mt-4 grid gap-3">
        <div>
          <FieldLabel>Status</FieldLabel>
          <select className={inputClass()} value={status} onChange={(event) => onStatus(event.target.value as PublishStatus)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onDraft} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">Simpan Draft</button>
          <button onClick={onPublish} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Publikasikan</button>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="flex justify-between"><span>Jumlah kata</span><strong>{words}</strong></p>
          <p className="mt-2 flex justify-between"><span>Estimasi baca</span><strong>{Math.max(1, Math.ceil(words / 180))} menit</strong></p>
        </div>
      </div>
    </div>
  );
}

function TaxonomyPicker({
  categories,
  tags,
  categoryIds,
  tagIds,
  onCategory,
  onTag,
}: {
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  categoryIds: number[];
  tagIds: number[];
  onCategory: (ids: number[]) => void;
  onTag: (ids: number[]) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-black">Kategori & Tag</h3>
      <div className="mt-4 grid gap-3">
        <div>
          <FieldLabel>Kategori</FieldLabel>
          <select className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm" multiple value={categoryIds.map(String)} onChange={(event) => onCategory(selectedNumbers(event.currentTarget.selectedOptions))}>
            {categories.length === 0 ? <option>Buat kategori dulu</option> : null}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Tag</FieldLabel>
          <select className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm" multiple value={tagIds.map(String)} onChange={(event) => onTag(selectedNumbers(event.currentTarget.selectedOptions))}>
            {tags.length === 0 ? <option>Buat tag dulu</option> : null}
            {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </div>
        <p className="text-xs text-slate-400">Tahan Ctrl untuk memilih lebih dari satu.</p>
      </div>
    </div>
  );
}

function ContentList({
  title,
  items,
}: {
  title: string;
  items: { id: number; title: string; meta: string; status: PublishStatus; onEdit: () => void; onDelete: () => void }[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">Belum ada data.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
              </div>
              <StatusPill status={item.status} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={item.onEdit} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">Edit</button>
              <button onClick={item.onDelete} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxonomyPanel({
  title,
  form,
  onForm,
  onSave,
  items,
}: {
  title: string;
  form: { name: string; slug: string };
  onForm: (form: { name: string; slug: string }) => void;
  onSave: () => void;
  items: TaxonomyItem[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <PanelTitle title={title} subtitle={`Kelola ${title.toLowerCase()} untuk blog.`} />
      <div className="mt-5 grid gap-3">
        <input className={inputClass()} placeholder={`Nama ${title}`} value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} />
        <input className={inputClass()} placeholder="Slug optional" value={form.slug} onChange={(event) => onForm({ ...form, slug: event.target.value })} />
        <button onClick={onSave} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Simpan {title}</button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{item.name}</span>
        ))}
      </div>
    </div>
  );
}
