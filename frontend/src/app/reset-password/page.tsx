"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { useTranslations } from "next-intl";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error(t("errorCodeLength"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("errorPasswordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("errorPasswordsMatch"));
      return;
    }

    try {
      setIsLoading(true);
      const data = await authService.resetPassword({ email, code, newPassword });
      toast.success(data.message || t("resetSuccess"));
      router.push("/login");
    } catch (error: any) {
      const code = error.response?.data?.error?.code;
      if (code) {
        toast.error(te(code as any) || error.response?.data?.error?.message);
      } else {
        toast.error(t("resetFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-5 relative z-10">
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
          readOnly={!!emailParam}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-slate-700 font-medium text-xs">{t("codeLabel")}</Label>
        <Input 
          id="code" 
          type="text" 
          dir="ltr"
          placeholder={t("codePlaceholder")} 
          className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:border-primary tracking-[0.5em] font-mono text-center"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-slate-700 font-medium text-xs">{t("newPasswordLabel")}</Label>
        <div className="relative">
          <Input 
            id="newPassword" 
            type={showPassword ? "text" : "password"} 
            dir="ltr"
            placeholder={t("newPasswordPlaceholder")} 
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 ps-10 focus-visible:ring-primary focus-visible:border-primary tracking-widest placeholder:tracking-normal text-start"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-xs">{t("confirmPasswordLabel")}</Label>
        <div className="relative">
          <Input 
            id="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"} 
            dir="ltr"
            placeholder={t("newPasswordPlaceholder")} 
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 ps-10 focus-visible:ring-primary focus-visible:border-primary tracking-widest placeholder:tracking-normal text-start"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-[15px] mt-8 shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("verifyResetButton")}
      </Button>
    </form>
  );
}

export default function ResetPassword() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-slate-50 p-0 md:p-4 font-sans py-0 md:py-10">
      <div className="w-full min-h-screen md:min-h-0 max-w-lg bg-white md:rounded-3xl shadow-none md:shadow-xl border-none md:border md:border-slate-100 p-6 sm:p-10 relative overflow-hidden flex flex-col justify-center">
          
        {/* Subtle background glow */}
        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -me-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 start-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -ms-20 -mb-20 pointer-events-none"></div>

          <div className="mb-8 relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("resetTitle")}</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              {t("resetSubtitle")}
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>

      </div>
    </div>
  );
}
