import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadController {
  async uploadImages(req, res, next) {
    let uploadedCloudinaryIds = [];
    try {
      if (!req.files || req.files.length === 0) {
        const err = new Error('لم يتم إرفاق أي صور للرفع');
        err.statusCode = 400;
        throw err;
      }

      const { listingId } = req.body;
      if (listingId) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) {
          const err = new Error('الإعلان غير موجود');
          err.statusCode = 404;
          throw err;
        }
        if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
          const err = new Error('غير مصرح لك بإضافة صور لهذا الإعلان');
          err.statusCode = 403;
          throw err;
        }
      }

      // Check max total size (e.g. 50MB for the whole request just in case)
      const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        const err = new Error('إجمالي حجم الملفات يتجاوز الحد المسموح (50MB)');
        err.statusCode = 413;
        throw err;
      }

      const uploadPromises = req.files.map(async (file) => {
        // 1. Parse image with sharp
        const image = sharp(file.buffer);
        const metadata = await image.metadata().catch(() => {
          const err = new Error('ملف غير مدعوم أو تالف');
          err.statusCode = 400;
          throw err;
        });

        // 2. Validate format
        const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
        if (!allowedFormats.includes(metadata.format)) {
          const err = new Error('صيغة الملف غير مدعومة');
          err.statusCode = 400;
          throw err;
        }

        // 3. Validate dimensions to prevent decompression bombs
        if (!metadata.width || !metadata.height || metadata.width > 8000 || metadata.height > 8000 || metadata.width * metadata.height > 40000000) {
          const err = new Error('أبعاد الصورة ضخمة جداً أو غير صالحة');
          err.statusCode = 400;
          throw err;
        }

        // 4. Sanitize & Convert to WEBP
        const processedBuffer = await image
          .webp({ quality: 80 }) // Converts to WebP (and implicitly drops EXIF because withMetadata() is NOT called)
          .toBuffer();

        // 5. Upload to Cloudinary
        const publicId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'souq_listings',
              public_id: publicId,
              format: 'webp',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) return reject(error);
              uploadedCloudinaryIds.push(result.public_id);
              resolve(result.secure_url);
            }
          );
          uploadStream.end(processedBuffer);
        });
      });

      const imageUrls = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: 'تم رفع الصور بنجاح',
        data: {
          urls: imageUrls
        }
      });
    } catch (error) {
      // Rollback: delete any successfully uploaded images from Cloudinary
      if (uploadedCloudinaryIds.length > 0) {
        try {
          await Promise.all(uploadedCloudinaryIds.map(id => cloudinary.uploader.destroy(id)));
        } catch (cleanupError) {
          console.error('Failed to cleanup orphaned images:', cleanupError);
        }
      }
      next(error);
    }
  }
}

export default new UploadController();
