import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(fileBuffer: Buffer, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: fileName,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(fileBuffer);
  });
}

export async function uploadMultipleImages(files: { buffer: Buffer; fileName: string }[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file.buffer, file.fileName));
  return Promise.all(uploadPromises);
}