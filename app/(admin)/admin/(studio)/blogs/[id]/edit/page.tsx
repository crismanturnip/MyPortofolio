import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/blog-form";
import { prisma } from "@/lib/prisma";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export default async function EditBlogPage({ params }: Props) { const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const [blog, categories, tags] = await Promise.all([prisma.blog.findUnique({ where: { id }, include: { categories: { include: { category: true } }, tags: { include: { tag: true } } } }), prisma.blogCategory.findMany({ orderBy: { name: "asc" } }), prisma.blogTag.findMany({ orderBy: { name: "asc" } })]); if (!blog) notFound(); return <BlogForm initial={blog} categories={categories} tags={tags} />; }
