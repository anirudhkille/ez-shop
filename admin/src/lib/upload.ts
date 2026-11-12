import { clientFetch } from "@/lib/client-api";

interface UploadOptions {
  folder?: string;
  filename?: string;
}

export async function uploadImage(
  file: Blob,
  { folder, filename }: UploadOptions = {}
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, filename ?? "upload.png");
  if (folder) formData.append("folder", folder);

  const res = await clientFetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.data?.url) {
    throw new Error(data?.message ?? "Image upload failed");
  }

  return data.data.url as string;
}
