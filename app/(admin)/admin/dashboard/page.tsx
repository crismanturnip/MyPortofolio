import AdminDashboard from "@/components/admin-dashboard";
import { requireAdminPage } from "@/lib/admin";

export default async function AdminDashboardPage() {
  const admin = await requireAdminPage();
  return <AdminDashboard adminName={admin.name} />;
}
