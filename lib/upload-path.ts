import path from "node:path";

export function getLocalUploadRoot() {
  const configured = process.env.LOCAL_UPLOAD_DIR?.trim();
  return configured ? path.resolve(configured) : path.join(process.cwd(), "public", "uploads");
}
