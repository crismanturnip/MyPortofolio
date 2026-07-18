import { z } from "zod";

export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const imageUrlSchema = z
  .string()
  .url()
  .or(z.string().regex(/^\/uploads\/[A-Za-z0-9/_.,-]+$/))
  .or(z.string().regex(/^\/assets\/[A-Za-z0-9/_.,-]+$/))
  .or(z.literal(""));

const audioUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "URL audio harus menggunakan HTTP atau HTTPS.")
  .or(z.string().regex(/^\/uploads\/audio\/[A-Za-z0-9/_.,-]+$/))
  .or(z.string().regex(/^\/assets\/audio\/[A-Za-z0-9/_.,-]+$/))
  .or(z.literal(""));

const musicFields = {
  musicTitle: z.string().max(160).optional().default(""),
  musicArtist: z.string().max(160).optional().default(""),
  musicUrl: audioUrlSchema.optional().default("")
};

const slideTypeSchema = z.enum(["image", "text", "image-text"]);

export const chapterSlideSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  order: z.coerce.number().int().positive(),
  type: slideTypeSchema,
  imageUrl: imageUrlSchema.optional().default(""),
  title: z.string().optional().default(""),
  content: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  altText: z.string().optional().default("")
});

export const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional().default(""),
  excerpt: z.string().optional().default(""),
  content: z.string().min(1),
  thumbnailUrl: imageUrlSchema.optional().default(""),
  status: publishStatusSchema,
  categoryIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  tagIds: z.array(z.coerce.number().int().positive()).optional().default([])
});

export const novelSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional().default(""),
  summary: z.string().min(1),
  genre: z.string().optional().default(""),
  coverUrl: imageUrlSchema.optional().default(""),
  status: publishStatusSchema,
  ...musicFields
});

export const chapterSchema = z.object({
  novelId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().optional().default(""),
  chapterNumber: z.coerce.number().int().positive(),
  content: z.string().optional().default(""),
  thumbnailUrl: imageUrlSchema.optional().default(""),
  status: publishStatusSchema,
  slides: z.array(chapterSlideSchema).optional().default([]),
  ...musicFields
});

export const taxonomySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().default("")
});
