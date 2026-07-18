import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { uploadAudioToBlob, uploadImageToBlob } from "@/lib/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 2 * 1024 * 1024;
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/ogg"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "ogg"]);
const MAX_AUDIO_SIZE = 12 * 1024 * 1024;

async function hasValidAudioSignature(file: File, extension: string) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (extension === "ogg") return String.fromCharCode(...bytes.slice(0, 4)) === "OggS";
  if (extension === "m4a") return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  return String.fromCharCode(...bytes.slice(0, 3)) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
}

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

  if (kind === "audio") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!AUDIO_TYPES.has(file.type) || !AUDIO_EXTENSIONS.has(extension)) {
      return NextResponse.json({ message: "Format audio harus MP3, M4A, atau OGG." }, { status: 400 });
    }
    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ message: "Maksimal ukuran audio 12 MB." }, { status: 400 });
    }
    if (!(await hasValidAudioSignature(file, extension))) {
      return NextResponse.json({ message: "Isi file tidak cocok dengan format audio." }, { status: 400 });
    }
    try {
      const url = await uploadAudioToBlob(file);
      return NextResponse.json({ message: "Upload audio berhasil.", data: { url } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload audio gagal.";
      return NextResponse.json({ message }, { status: 500 });
    }
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
