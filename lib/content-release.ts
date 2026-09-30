export const PUBLIC_CONTENT_RELEASED = true;

export function getPublicContentHref(type: "blog" | "novel", path = "") {
  if (PUBLIC_CONTENT_RELEASED) {
    return `/${type}${path}`;
  }

  const params = new URLSearchParams({
    type,
    title: type === "blog" ? "Blog" : "Series",
  });
  return `/coming-soon?${params.toString()}`;
}
