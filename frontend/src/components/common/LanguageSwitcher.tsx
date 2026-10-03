"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useTransition, useState, useRef, useEffect } from "react";

const languages = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (nextLocale: string) => {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }
    
    // Set the cookie
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    setIsOpen(false);
    
    startTransition(() => {
      router.refresh();
    });
  };

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 disabled:opacity-50 font-medium"
        title="Change Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm uppercase">{currentLang.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 end-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-start px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                locale === lang.code ? 'font-bold text-primary bg-slate-50' : 'text-slate-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
