const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

interface UploadOptions {
  folder?: string;
  filename?: string;
}

export async function uploadImage(
  file: Blob,
  { folder, filename }: UploadOptions = {}
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured");
  }

  const formData = new FormData();
  formData.append("file", file, filename ?? "upload.png");
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ?? "Image upload failed");
  }

  return data.secure_url as string;
}
