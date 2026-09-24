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
