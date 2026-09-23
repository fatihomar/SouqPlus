"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    
    // Set the cookie
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Use startTransition for a smoother React rendering update alongside router.refresh()
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 disabled:opacity-50 font-medium"
      title={locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm">{locale === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );
}
