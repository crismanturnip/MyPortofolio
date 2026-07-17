import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  return NextResponse.json({
    data: { id: admin.id, email: admin.email, name: admin.name }
  });
}
