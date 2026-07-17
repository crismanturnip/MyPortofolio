import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.adminId) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
