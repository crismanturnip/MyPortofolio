import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session?.adminId) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return admin;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session?.adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
