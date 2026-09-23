'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Globe, Save, Monitor, Shield, Image as ImageIcon, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { getSettings, updateSettings } from '@/services/admin.service';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    PLATFORM_NAME: 'Souq+',
    MAINTENANCE_MODE: 'false',
    MAX_IMAGE_SIZE_MB: '5',
    MAX_IMAGES_PER_LISTING: '10',
    REQUIRE_LISTING_APPROVAL: 'false'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (error) {
        toast.error(t('noData'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateSettings(settings);
      if (res.success) {
        toast.success(t('saveChanges') + ' ' + (locale === 'ar' ? 'بنجاح' : 'Successful'));
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      toast.error(t('noData'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('settings')}</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? t('loading') : t('saveChanges')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('general')}</h2>
              <p className="text-[11px] text-slate-500 md:hidden">Platform & Maintenance</p>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('platformName')}</label>
              <input 
                type="text" 
                value={settings.PLATFORM_NAME}
                onChange={(e) => handleChange('PLATFORM_NAME', e.target.value)}
                className="w-full h-12 md:h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">{t('maintenanceMode')}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{(locale === 'ar' ? 'إيقاف المنصة مؤقتاً للصيانة' : 'Temporarily disable the platform')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.MAINTENANCE_MODE === 'true'} onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.checked ? 'true' : 'false')} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Listing Moderation Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('listingModeration')}</h2>
              <p className="text-[11px] text-slate-500 md:hidden">Images & Approvals</p>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('maxImageSize')}</label>
                <input 
                  type="number" 
                  value={settings.MAX_IMAGE_SIZE_MB}
                  onChange={(e) => handleChange('MAX_IMAGE_SIZE_MB', e.target.value)}
                  className="w-full h-12 md:h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('maxImagesPerListing')}</label>
                <input 
                  type="number" 
                  value={settings.MAX_IMAGES_PER_LISTING}
                  onChange={(e) => handleChange('MAX_IMAGES_PER_LISTING', e.target.value)}
                  className="w-full h-12 md:h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">{t('listingModeration')}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{(locale === 'ar' ? 'مراجعة الإعلانات قبل النشر' : 'Review listings before publishing')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.REQUIRE_LISTING_APPROVAL === 'true'} onChange={(e) => handleChange('REQUIRE_LISTING_APPROVAL', e.target.checked ? 'true' : 'false')} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-dark shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('defaultLanguage')}</h2>
              <p className="text-[11px] text-slate-500 md:hidden">{t('interfaceLocalization')}</p>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              {(locale === 'ar' ? 'هذا الإعداد يغير لغة الواجهة الخاصة بك حالياً فقط، لا يتم حفظه في قاعدة البيانات العامة.' : 'This setting changes your current interface language only, not saved globally.')}
            </p>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Save Button */}
      <button 
        onClick={handleSave}
        disabled={saving}
        className="md:hidden w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? t('loading') : t('saveChanges')}
      </button>

      {/* Logout Button (Mobile Only bottom) */}
      <div className="md:hidden pt-8 pb-4">
        <button
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>

    </div>
  );
}
