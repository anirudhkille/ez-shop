import { uploadToR2 } from "@/utils/upload-to-r2";
import { AppError } from "@/utils/app-error";

export const uploadImage = async (
  file: Express.Multer.File | undefined,
  folder: unknown,
) => {
  if (!file) {
    throw new AppError("Image file is required", 400);
  }

  return uploadToR2(
    typeof folder === "string" && folder.trim() ? folder : "uploads",
    file.buffer,
  );
};
