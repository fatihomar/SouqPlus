import multer from 'multer';

// استخدام Memory Storage لمعالجة الصورة بالذاكرة قبل الرفع للسحابة
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // الحد الأقصى لحجم الصورة الواحدة هو 5 ميغابايت
  }
  // يمكن ترك الفلترة الأولية هنا، ولكن sharp سيقوم بالفحص الدقيق
});

// تصدير ميدل وير الرفع، مهيأ لاستقبال مصفوفة من الصور تحت اسم 'images' وبحد أقصى 20 صورة
export default upload.array('images', 20);
