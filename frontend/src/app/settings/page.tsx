"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Globe, Settings as SettingsIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary-light text-primary-dark rounded-xl">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{t("settings")}</h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {locale === 'ar' ? 'اللغة والمنطقة' : 'Language & Region'}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === 'ar' ? 'تغيير لغة العرض الخاصة بالموقع' : 'Change the display language of the website'}
            </p>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {locale === 'ar' ? 'لغة الموقع' : 'Display Language'}
                </h3>
                <p className="text-sm text-slate-500">
                  {locale === 'ar' ? 'اختر اللغة المفضلة لك' : 'Choose your preferred language'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
