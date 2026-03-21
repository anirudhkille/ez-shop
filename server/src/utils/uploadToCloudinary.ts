import cloudinary from '@/config/cloudinary';

export const uploadToCloudinary = async (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'ez-shop/categories',
          format: 'avif', // convert to avif
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(fileBuffer);
  });
};
