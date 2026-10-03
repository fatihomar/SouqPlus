import multer from 'multer';
import prisma from '../config/prisma.js';

// استخدام Memory Storage لمعالجة الصورة بالذاكرة قبل الرفع للسحابة
const storage = multer.memoryStorage();

const uploadMiddleware = async (req, res, next) => {
  try {
    // قراءة الإعدادات من قاعدة البيانات أو استخدام القيم الافتراضية
    const sizeSetting = await prisma.systemSetting.findUnique({ where: { key: 'MAX_IMAGE_SIZE_MB' } });
    const numSetting = await prisma.systemSetting.findUnique({ where: { key: 'MAX_IMAGES_PER_LISTING' } });

    const maxFileSizeMB = sizeSetting ? parseInt(sizeSetting.value) : 5;
    const maxImages = numSetting ? parseInt(numSetting.value) : 20;

    const upload = multer({ 
      storage: storage,
      limits: {
        fileSize: maxFileSizeMB * 1024 * 1024,
      }
    }).array('images', maxImages);

    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: `عذراً، الحد الأقصى لحجم الصورة هو ${maxFileSizeMB} ميجابايت.` });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: `عذراً، الحد الأقصى لعدد الصور هو ${maxImages} صور.` });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الصور.' });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

export default uploadMiddleware;
