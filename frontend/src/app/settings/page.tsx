"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Globe, Settings as SettingsIcon, User, Save } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const { user, setCredentials } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!fullName.trim() || fullName === user?.fullName) return;
    try {
      setIsSaving(true);
      const res = await authService.updateProfile({ fullName });
      if (res.success) {
        setCredentials(res.data);
        toast.success(locale === 'ar' ? 'تم تحديث الاسم بنجاح' : locale === 'tr' ? 'Ad başarıyla güncellendi' : 'Name updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating name');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary-light text-primary-dark rounded-xl">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{t("settings")}</h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {locale === 'ar' ? 'اللغة والمنطقة' : locale === 'tr' ? 'Dil ve Bölge' : 'Language & Region'}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === 'ar' ? 'تغيير لغة العرض الخاصة بالموقع' : locale === 'tr' ? 'Web sitesinin görüntüleme dilini değiştirin' : 'Change the display language of the website'}
            </p>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {locale === 'ar' ? 'لغة الموقع' : locale === 'tr' ? 'Site Dili' : 'Display Language'}
                </h3>
                <p className="text-sm text-slate-500">
                  {locale === 'ar' ? 'اختر اللغة المفضلة لك' : locale === 'tr' ? 'Tercih ettiğiniz dili seçin' : 'Choose your preferred language'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {locale === 'ar' ? 'الملف الشخصي' : locale === 'tr' ? 'Profil' : 'Profile'}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === 'ar' ? 'تحديث بيانات ملفك الشخصي' : locale === 'tr' ? 'Profil bilgilerinizi güncelleyin' : 'Update your profile information'}
            </p>
          </div>
          
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {locale === 'ar' ? 'الاسم الكامل' : locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
                </h3>
                <p className="text-sm text-slate-500">
                  {locale === 'ar' ? 'الاسم الذي يظهر للمستخدمين الآخرين' : locale === 'tr' ? 'Diğer kullanıcılara görünen adınız' : 'The name displayed to other users'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل اسمك الجديد' : 'Enter your new name'}
                className="h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64"
              />
              <Button 
                onClick={handleSaveName}
                disabled={isSaving || !fullName.trim() || fullName === user?.fullName}
                className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {locale === 'ar' ? 'حفظ' : locale === 'tr' ? 'Kaydet' : 'Save'}
                </span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
