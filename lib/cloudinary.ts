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

// Add this function for deleting images
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/public_id.ext
    const urlParts = imageUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    
    // If the URL contains version info (v1234567890), we need to handle it
    let cleanPublicId = publicId;
    const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
    if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
      // Rebuild public_id from the parts after version
      cleanPublicId = urlParts.slice(versionIndex + 1).join('/').replace(/\.[^/.]+$/, '');
    }
    
    const result = await cloudinary.uploader.destroy(cleanPublicId);
    
    if (result.result === 'ok') {
      console.log(`Successfully deleted image: ${cleanPublicId}`);
    } else if (result.result === 'not found') {
      console.warn(`Image not found for deletion: ${cleanPublicId}`);
    } else {
      console.warn(`Unexpected result when deleting image: ${result.result}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to extract public ID from Cloudinary URL (alternative method)
export function extractPublicId(cloudinaryUrl: string): string {
  try {
    const regex = /\/v\d+\/(.+)\./;
    const match = cloudinaryUrl.match(regex);
    return match ? match[1] : cloudinaryUrl.split('/').pop()?.split('.')[0] || '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
}

// Batch delete function (useful for cleanup operations)
export async function deleteMultipleImages(imageUrls: string[]): Promise<{
  successful: string[],
  failed: string[]
}> {
  const successful: string[] = [];
  const failed: string[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      await deleteImage(imageUrl);
      successful.push(imageUrl);
    } catch (error) {
      failed.push(imageUrl);
      console.error(`Failed to delete image ${imageUrl}:`, error);
    }
  }
  
  return { successful, failed };
}