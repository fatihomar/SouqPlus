"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { X, Search, MapPin, DollarSign, Car, Home, Calendar, Maximize, Settings2 } from 'lucide-react';

interface FiltersSidebarProps {
  initialFilters: any;
  onFilterChange: (filters: any) => void;
  onClose?: () => void; // للموبايل
}

export default function FiltersSidebar({ initialFilters, onFilterChange, onClose }: FiltersSidebarProps) {
  const t = useTranslations("filters");
  
  // حالة الفلاتر المحلية
  const [filters, setFilters] = useState<any>(initialFilters);

  // استخدام تقنية Debounce على كامل الـ state الخاص بالفلاتر بـ 500ms
  const debouncedFilters = useDebounce(filters, 500);

  // إرسال الفلاتر المحدثة إلى الصفحة الرئيسية عندما يتغير الـ debounced value
  useEffect(() => {
    // نمنع الإرسال التلقائي في أول رندر إذا كانت الفلاتر لم تتغير فعلياً
    if (JSON.stringify(debouncedFilters) !== JSON.stringify(initialFilters)) {
      onFilterChange(debouncedFilters);
    }
  }, [debouncedFilters]);

  // تحديث حالة الفلاتر المحلية عند الكتابة
  const handleChange = (key: string, value: any) => {
    setFilters((prev: any) => {
      const newFilters = { ...prev, [key]: value };
      if (value === "" || value === "ALL") {
        delete newFilters[key]; // حذف الفلتر إذا تم تفريغه
      }
      return newFilters;
    });
  };

  const category = filters.category; // لمعرفة هل هو سيارة أم عقار أم الكل

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full flex flex-col">
      {/* هيدر الفلاتر للموبايل */}
      <div className="flex justify-between items-center mb-6 lg:mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          {t('advancedFilters')}
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-2 lg:hidden bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pe-1 space-y-6 custom-scrollbar">
        
        {/* فلتر البحث النصي */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-slate-400" /> {t('searchKeyword')}
          </label>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* فلتر السعر */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-400" /> {t('priceUSD')}
          </label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder={t('from')} 
              value={filters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            <input 
              type="number" 
              placeholder={t('to')} 
              value={filters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* فلتر المدينة */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" /> {t('city')}
          </label>
          <input 
            type="text"
            placeholder={t('cityPlaceholder') || "Enter city..."}
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* فلاتر السيارات */}
        {category === 'CAR' && (
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" /> {t('carFeatures')}
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{t('condition')}</label>
              <select 
                value={filters.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">{t('all')}</option>
                <option value="NEW">{t('new')}</option>
                <option value="USED">{t('used')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> {t('yearOfManufacture')}
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder={t('fromYear')} 
                  value={filters.minYear || ''}
                  onChange={(e) => handleChange('minYear', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <input 
                  type="number" 
                  placeholder={t('toYear')} 
                  value={filters.maxYear || ''}
                  onChange={(e) => handleChange('maxYear', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{t('brand')}</label>
              <input 
                type="text" 
                placeholder={t('brandPlaceholder')} 
                value={filters.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        )}

        {/* فلاتر العقارات */}
        {category === 'REAL_ESTATE' && (
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> {t('propertyFeatures')}
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{t('propertyType')}</label>
              <select 
                value={filters.propertyType || ''}
                onChange={(e) => handleChange('propertyType', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">{t('all')}</option>
                <option value="APARTMENT">{t('apartment')}</option>
                <option value="VILLA">{t('villa')}</option>
                <option value="OFFICE">{t('office')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-slate-400" /> {t('areaSqM')}
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder={t('minArea')} 
                  value={filters.minArea || ''}
                  onChange={(e) => handleChange('minArea', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <input 
                  type="number" 
                  placeholder={t('maxArea')} 
                  value={filters.maxArea || ''}
                  onChange={(e) => handleChange('maxArea', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('bedrooms')}</label>
                <input 
                  type="number" 
                  placeholder={t('numRooms')} 
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('bathrooms')}</label>
                <input 
                  type="number" 
                  placeholder={t('numBaths')} 
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-2">
        {onClose && (
          <button 
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm"
          >
            عرض النتائج
          </button>
        )}
        <button 
          onClick={() => {
            const resetFilters = category ? { category } : {};
            setFilters(resetFilters);
            onFilterChange(resetFilters);
            if (onClose) onClose();
          }}
          className="w-full py-3 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors"
        >
          {t('clearFilters')}
        </button>
      </div>
    </div>
  );
}
