import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Verify file type
    const mime = file.type;
    if (!mime.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file must be an image (JPEG, PNG, WebP)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary credentials are set in environment, upload to Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(buffer, 'shawlghar_products');
        return NextResponse.json({
          success: true,
          url: cloudResult.url,
          provider: 'cloudinary',
        });
      } catch (cloudErr: any) {
        console.error('Cloudinary upload error, falling back to local:', cloudErr);
      }
    }

    // Fallback: Save into public/images/products directory
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const fileName = `${cleanBase}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/products/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      provider: 'local',
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
