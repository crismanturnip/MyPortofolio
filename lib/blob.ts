import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export async function uploadImageToBlob(file: File, folder: "covers" | "thumbnails") {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) {
      throw new Error("BLOB_READ_WRITE_TOKEN harus diatur untuk upload gambar di Vercel.");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(process.cwd(), "public", "uploads", filename), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${filename}`;
  }

  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}
