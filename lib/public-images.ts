import { access } from "node:fs/promises";
import path from "node:path";
import { getLocalUploadRoot } from "@/lib/upload-path";

export const blogFallbackImages = ["/placeholders/blog-thumbnail.svg"];
export const novelFallbackImages = ["/placeholders/novel-cover.svg"];
export const chapterFallbackImages = ["/placeholders/chapter-thumbnail.svg"];

async function localUploadExists(url: string) {
  const uploadRoot = getLocalUploadRoot();
  const relativePath = url.slice("/uploads/".length);
  const filePath = path.resolve(uploadRoot, relativePath);

  if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
    return false;
  }

  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolvePublicImageUrl(url: string | null | undefined, fallback: string) {
  if (!url) {
    return fallback;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/uploads/") && !(await localUploadExists(url))) {
    return fallback;
  }

  return url.startsWith("/uploads/") || url.startsWith("/assets/") ? url : fallback;
}
