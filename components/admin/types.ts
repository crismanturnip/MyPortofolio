export type PublishStatus = "DRAFT" | "LOCKED" | "PUBLISHED";

export type TaxonomyItem = {
  id: number;
  name: string;
  slug: string;
};

export type BlogEditorData = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  status: PublishStatus;
  categories: { category: TaxonomyItem }[];
  tags: { tag: TaxonomyItem }[];
};

export type NovelEditorData = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  genre: string | null;
  coverUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  musicUrl: string | null;
  musicVolume: number;
  status: PublishStatus;
};

export type ChapterSlideData = {
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

export type ChapterEditorData = {
  id: number;
  novelId: number;
  title: string;
  slug: string;
  chapterNumber: number;
  content: string;
  thumbnailUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  musicUrl: string | null;
  musicVolume: number;
  status: PublishStatus;
  slides: Array<{
    id: number;
    order: number;
    type: string;
    imageUrl: string | null;
    title: string | null;
    content: string | null;
    caption: string | null;
    altText: string | null;
  }>;
};

export type NovelOption = { id: number; title: string; musicTitle?: string | null; musicArtist?: string | null; musicUrl?: string | null; musicVolume?: number };
