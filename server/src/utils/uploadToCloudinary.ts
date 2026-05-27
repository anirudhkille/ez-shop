import cloudinary from '@/config/cloudinary';

export const uploadToCloudinary = async (folder:string,fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `ez-shop/${folder}`,
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
