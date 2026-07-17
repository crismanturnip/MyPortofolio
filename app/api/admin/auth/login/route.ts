import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Payload login tidak valid." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
    if (!admin) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    await createAdminSession(admin.id);
    return NextResponse.json({
      message: "Login berhasil.",
      data: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan login." }, { status: 500 });
  }
}
