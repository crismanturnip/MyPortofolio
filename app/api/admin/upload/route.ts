import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { uploadImageToBlob } from "@/lib/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const formData = await request.formData();
  const kind = String(formData.get("kind") || "");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File tidak ditemukan." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Format file harus jpg/png/webp." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "Maksimal ukuran file 2MB." }, { status: 400 });
  }

  try {
    const folder = kind === "cover" ? "covers" : "thumbnails";
    const url = await uploadImageToBlob(file, folder);
    return NextResponse.json({ message: "Upload berhasil.", data: { url } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
