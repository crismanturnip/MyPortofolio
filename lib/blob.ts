import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { getLocalUploadRoot } from "@/lib/upload-path";

export async function uploadImageToBlob(file: File, folder: "covers" | "thumbnails") {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) {
      throw new Error("BLOB_READ_WRITE_TOKEN harus diatur untuk upload gambar di Vercel.");
    }

    const uploadDir = path.join(getLocalUploadRoot(), folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(getLocalUploadRoot(), filename), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${filename}`;
  }

  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}

export async function uploadAudioToBlob(file: File, detectedFormat?: "mp3" | "m4a" | "ogg") {
  const ext = detectedFormat || file.name.split(".").pop()?.toLowerCase() || "mp3";
  const filename = `audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const contentType = ext === "mp3" ? "audio/mpeg" : ext === "m4a" ? "audio/mp4" : "audio/ogg";

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) {
      throw new Error("BLOB_READ_WRITE_TOKEN harus diatur untuk upload audio di Vercel.");
    }
    const uploadDir = path.join(getLocalUploadRoot(), "audio");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(getLocalUploadRoot(), filename), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${filename}`;
  }

  const blob = await put(filename, file, { access: "public", contentType });
  return blob.url;
}
