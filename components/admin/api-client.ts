export async function adminRequest<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(result.message || "Permintaan gagal diproses.");
  }

  return result as T;
}

export async function uploadAdminImage(file: File, kind: "cover" | "thumbnail") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  const result = await adminRequest<{ data: { url: string } }>("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  return result.data.url;
}

export async function uploadAdminAudio(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", "audio");
  const result = await adminRequest<{ data: { url: string } }>("/api/admin/upload", { method: "POST", body: formData });
  return result.data.url;
}
