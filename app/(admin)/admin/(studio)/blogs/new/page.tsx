import BlogForm from "@/components/admin/blog-form";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function NewBlogPage() { const [categories, tags] = await Promise.all([prisma.blogCategory.findMany({ orderBy: { name: "asc" } }), prisma.blogTag.findMany({ orderBy: { name: "asc" } })]); return <BlogForm categories={categories} tags={tags} />; }
