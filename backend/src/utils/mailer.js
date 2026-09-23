import nodemailer from 'nodemailer';

// إنشاء أداة النقل (Transporter) باستخدام إعدادات Gmail
export const transporter = nodemailer.createTransport({
  service: 'gmail', // أو اسم مزود الخدمة الخاص بك
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * دالة لإرسال إيميل استعادة كلمة المرور بتصميم HTML جميل
 * @param {string} to - البريد الإلكتروني للمستلم
 * @param {string} resetLink - الرابط السري للاستعادة
 */
export const sendResetPasswordEmail = async (to, resetLink) => {
  try {
    const mailOptions = {
      from: `"Souq+ Security" <${process.env.SMTP_USER}>`,
      to: to,
      subject: 'إعادة تعيين كلمة المرور - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Souq+</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #334155; margin-top: 0;">طلب إعادة تعيين كلمة المرور</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
              لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
              الرابط أدناه صالح لمدة <strong>15 دقيقة</strong> فقط لدواعي أمنية.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #eab308; color: #0f172a; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                تعيين كلمة مرور جديدة
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
              إذا لم تطلب تغيير كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. لن يتم تغيير كلمة المرور الخاصة بك.
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Souq+ All rights reserved.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email successfully sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending email:', error);
    // Even if it fails, we don't throw to prevent User Enumeration,
    // but in a real app, you might want to handle this gracefully.
    return false;
  }
};

