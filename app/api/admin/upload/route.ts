import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { uploadAudioToBlob, uploadImageToBlob } from "@/lib/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 2 * 1024 * 1024;
const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "ogg"]);
const MAX_AUDIO_SIZE = 12 * 1024 * 1024;

type AudioFormat = "mp3" | "m4a" | "ogg";

async function detectAudioFormat(file: File): Promise<AudioFormat | null> {
  const bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  if (String.fromCharCode(...bytes.slice(0, 4)) === "OggS") return "ogg";
  if (String.fromCharCode(...bytes.slice(4, 8)) === "ftyp") return "m4a";
  if (String.fromCharCode(...bytes.slice(0, 3)) === "ID3") return "mp3";
  for (let index = 0; index < bytes.length - 1; index += 1) {
    if (bytes[index] === 0xff && (bytes[index + 1] & 0xe0) === 0xe0) return "mp3";
  }
  return null;
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) {
    return admin;
  }

  const formData = await request.formData();
  const kind = String(formData.get("kind") || "");
  const file = formData.get("file");

  if (!new Set(["audio", "cover", "thumbnail"]).has(kind)) {
    return NextResponse.json({ message: "Jenis upload tidak valid." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File tidak ditemukan." }, { status: 400 });
  }

  if (kind === "audio") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!AUDIO_EXTENSIONS.has(extension)) {
      return NextResponse.json({ message: "Format audio harus MP3, M4A, atau OGG." }, { status: 400 });
    }
    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ message: "Maksimal ukuran audio 12 MB." }, { status: 400 });
    }
    const detectedFormat = await detectAudioFormat(file);
    if (!detectedFormat) {
      return NextResponse.json({ message: "Isi file tidak cocok dengan format audio." }, { status: 400 });
    }
    try {
      const url = await uploadAudioToBlob(file, detectedFormat);
      const normalized = extension !== detectedFormat;
      return NextResponse.json({ message: normalized ? `Upload berhasil. Format dikenali sebagai ${detectedFormat.toUpperCase()}.` : "Upload audio berhasil.", data: { url, format: detectedFormat, normalized } });
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
