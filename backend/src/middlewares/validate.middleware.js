/**
 * Generic Validation Middleware using Zod
 * يقوم هذا الملف بالتحقق من البيانات المدخلة قبل وصولها للـ Controller
 * ويرجع الأخطاء برموز (Error Codes) لترجمتها في الواجهة الأمامية.
 * @param {import('zod').AnyZodObject} schema 
 */
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const issues = error.errors || error.issues || [];
      const formattedErrors = issues.map(err => ({
        path: err.path.join('.'),
        code: err.message, // We use Zod's custom error message as the Error Code (e.g. ERR_REQUIRED)
        type: err.code
      }));

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: formattedErrors
      });
    }

    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

export default validate;
