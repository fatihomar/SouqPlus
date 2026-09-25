"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useTranslations } from "next-intl";

export default function Login() {
  const router = useRouter();
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setCredentials(response.data.user);
      toast.success(t("welcomeBackToast"));
      if (response.data.user.role === 'ADMIN') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      const code = error.response?.data?.error?.code;
      if (code) {
        toast.error(te(code as any) || error.response?.data?.error?.message);
      } else {
        toast.error(t("errorInvalidCredentials"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-10 relative flex flex-col pt-12 sm:pt-20">

          {/* Back Button */}
          <div className="mb-8 relative z-10">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 rtl:rotate-180"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <div className="mb-10 text-center sm:text-start">
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight">{t("loginTitle")}</h1>
            <p className="text-slate-500 mt-2 text-[15px] font-medium">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium text-xs">{t("emailLabel")}</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                dir="ltr"
                placeholder={t("emailPlaceholder")} 
                className="h-[52px] rounded-2xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-start px-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium text-xs">{t("passwordLabel")}</Label>
              <div className="relative" dir="ltr">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  dir="ltr"
                  placeholder={t("passwordPlaceholder")} 
                  className="h-[52px] rounded-2xl border-slate-200 bg-white pe-11 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary tracking-widest placeholder:tracking-normal text-start ps-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-[52px] rounded-2xl font-bold text-base mt-8 hover:scale-[1.02] transition-transform">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("loginButton")}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">{t("orContinueWith") || "أو المتابعة باستخدام"}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                window.location.href = `${backendUrl}/auth/google`;
              }}
              className="w-full h-[52px] rounded-2xl font-bold text-base bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("continueWithGoogle") || "Continue with Google"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500 relative z-10">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              {t("registerLink")}
            </Link>
          </p>
      </div>
    </div>
  );
}
