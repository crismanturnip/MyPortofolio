import AdminShell from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin";

export default async function AdminStudioLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
