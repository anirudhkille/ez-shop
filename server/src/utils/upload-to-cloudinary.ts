import cloudinary from "@/config/cloudinary";

export const uploadToCloudinary = async (
  folder: string,
  fileBuffer: Buffer,
) => {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `ez-shop/${folder}`,
            format: "avif", // convert to avif
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          },
        )
        .end(fileBuffer);
    },
  );
};
