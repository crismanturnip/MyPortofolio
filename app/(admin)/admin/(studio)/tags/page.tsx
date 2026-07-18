import { PageHeader } from "@/components/admin/admin-ui";
import TaxonomyManager from "@/components/admin/taxonomy-manager";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function TagsPage() { const items = await prisma.blogTag.findMany({ orderBy: { name: "asc" } }); return <div className="grid gap-6"><PageHeader title="Tag" description="Kelola label khusus untuk membantu klasifikasi blog." /><TaxonomyManager title="Tag" singular="Tag" endpoint="/api/admin/tags" items={items} /></div>; }
