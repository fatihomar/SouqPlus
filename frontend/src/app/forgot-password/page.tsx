"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await authService.forgotPassword(email);
      // إظهار رسالة النجاح التي تحتوي على الكود
      toast.success(
        <div>
          <span>{data.message || t("mailWillArrive")}</span>
          <br/>
          <strong className="mt-2 text-lg text-primary block">{t("verificationCode")}{data.code}</strong>
        </div>, 
        { duration: 8000 }
      );
      
      // تأخير بسيط ليتمكن المستخدم من رؤية الكود، ثم الانتقال لصفحة الـ reset وتمرير الإيميل
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 4000);

    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-slate-50 p-0 md:p-4 font-sans py-0 md:py-10">
      <div className="w-full min-h-screen md:min-h-0 max-w-lg bg-white md:rounded-3xl shadow-none md:shadow-xl border-none md:border md:border-slate-100 p-6 sm:p-10 relative overflow-hidden flex flex-col justify-center">
          
        {/* Subtle background glow */}
        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -me-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 start-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -ms-20 -mb-20 pointer-events-none"></div>

          {/* Back Button */}
          <div className="flex justify-between items-center mb-6 relative z-10 -ms-2">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <div className="mb-8 relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("forgotTitle")}</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              {t("forgotSubtitle")}
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium text-xs">{t("emailLabel")}</Label>
              <Input 
                id="email" 
                type="email" 
                dir="ltr"
                placeholder={t("emailPlaceholder")} 
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:border-primary text-start"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-[15px] mt-8 shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("sendResetCode")}
            </Button>
          </form>

      </div>
    </div>
  );
}
