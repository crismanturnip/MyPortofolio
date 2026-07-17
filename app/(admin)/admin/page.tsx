import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

export default async function AdminEntryPage() {
  const session = await getAdminSession();
  if (session?.adminId) {
    redirect("/admin/dashboard");
  }
  redirect("/admin/login");
}
