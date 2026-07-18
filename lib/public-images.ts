import { access } from "node:fs/promises";
import path from "node:path";

export const blogFallbackImages = ["/assets/images/img4.jpg", "/assets/images/img4.jpg", "/assets/images/img4.jpg"];
export const novelFallbackImages = ["/assets/images/project1.png", "/assets/images/project2.jpg", "/assets/images/project3.png"];
export const chapterFallbackImages = ["/assets/images/project1.png", "/assets/images/project2.jpg", "/assets/images/project3.png"];

async function localUploadExists(url: string) {
  try {
    await access(path.join(process.cwd(), "public", url.slice(1)));
    return true;
  } catch {
    return false;
  }
}

export async function resolvePublicImageUrl(url: string | null | undefined, fallback: string) {
  if (!url) {
    return fallback;
  }

  // Public pages must not depend on third-party hosts that can block hotlinks.
  if (/^https?:\/\//i.test(url)) {
    return fallback;
  }

  if (url.startsWith("/uploads/") && !(await localUploadExists(url))) {
    return fallback;
  }

  return url.startsWith("/uploads/") || url.startsWith("/assets/") ? url : fallback;
}
