// utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Enforces HTTPS
});

// Add this interface to your utils/cloudinary.ts
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
}

export const uploadFile = async (
  file: File, 
  folder: string = 'courses'
): Promise<CloudinaryUploadResult> => {  
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => error ? reject(error) : resolve(result as CloudinaryUploadResult)
    ).end(bytes);
  });
};

export default cloudinary;