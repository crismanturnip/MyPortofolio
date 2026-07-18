import { PageHeader } from "@/components/admin/admin-ui";
import TaxonomyManager from "@/components/admin/taxonomy-manager";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function CategoriesPage() { const items = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } }); return <div className="grid gap-6"><PageHeader title="Kategori" description="Atur kategori yang digunakan untuk mengelompokkan blog." /><TaxonomyManager title="Kategori" singular="Kategori" endpoint="/api/admin/categories" items={items} /></div>; }
