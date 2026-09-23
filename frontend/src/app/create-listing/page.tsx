"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function CreateListingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations('createListing');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isClient, isAuthenticated, user, router]);

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleSaveDraft = () => {
    toast.success(t('draftSaved'));
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pb-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('pageTitle')}</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {t('pageSubtitle')}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            className="rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 h-11 px-6 shadow-sm bg-white"
          >
            <Save className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
            {t('saveDraft')}
          </Button>
        </div>
        
        {/* Form handles the 2-column layout itself to manage state across both columns */}
        <CreateListingForm />
      </div>
    </DashboardLayout>
  );
}
