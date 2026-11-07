import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if environment variables exist
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder = 'shawlghar_products'
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
