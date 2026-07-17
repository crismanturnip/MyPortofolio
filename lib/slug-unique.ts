import { makeSlug } from "@/lib/slug";

export async function ensureUniqueSlug(
  preferred: string,
  exists: (slug: string) => Promise<boolean>
) {
  const base = makeSlug(preferred) || "post";
  let slug = base;
  let i = 1;
  while (await exists(slug)) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}
