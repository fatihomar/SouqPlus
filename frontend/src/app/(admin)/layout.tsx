'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LayoutDashboard, Users, Grid, LogOut, Search, Bell, Settings, FileText, ShieldCheck, Menu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('admin');

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success(t('logout'));
  };

  const mainMenuItems = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('listings'), href: '/admin/listings', icon: Grid },
    { name: t('reports'), href: '/admin/reports', icon: FileText },
  ];

  const systemMenuItems = [
    { name: t('settings'), href: '/admin/settings', icon: Settings },
    { name: t('logs'), href: '/admin/logs', icon: FileText },
  ];

  return (
    <aside className="w-[260px] bg-white border-e border-slate-100 min-h-screen flex flex-col font-sans">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-slate-50">
        <Link href="/admin" className="text-2xl font-black text-slate-900 tracking-tight">
          Souq<span className="text-primary">+</span>
        </Link>
      </div>

      {/* Admin Profile Badge */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('adminPanel')}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{t('superAdmin')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('main')}</p>
          <div className="space-y-1">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-slate-900 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('system')}</p>
          <div className="space-y-1">
            {systemMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-slate-900 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors w-full"
        >
          <LogOut className="w-5 h-5 text-slate-400 rtl:-scale-x-100" />
          <span className="text-sm">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

const AdminBottomNav = () => {
  const pathname = usePathname();
  const t = useTranslations('admin');
  
  const navItems = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('listings'), href: '/admin/listings', icon: Grid },
    { name: t('reports'), href: '/admin/reports', icon: FileText },
    { name: t('settings'), href: '/admin/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-slate-100 z-50 px-2 pb-safe pt-1 flex items-center justify-between">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2"
          >
            <item.icon 
              className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

const AdminTopbar = () => {
  const { user } = useAuthStore();
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="md:hidden">
          <Link href="/admin" className="text-xl font-black text-slate-900 tracking-tight">
            Souq<span className="text-primary">+</span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex relative w-96">
          <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            className="w-full h-11 bg-slate-50 border-none rounded-full ps-11 pe-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile Search Icon */}
        <button className="md:hidden relative text-slate-600 hover:text-primary transition-colors p-2">
          <Search className="w-5 h-5" />
        </button>

        <button className="relative text-slate-600 hover:text-primary transition-colors p-2 md:p-0">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute top-1 end-1 md:-top-1 md:-end-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-primary border-2 border-white rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold text-white">6</span>
        </button>
        
        <div className="flex items-center gap-3 md:ps-6 md:border-s border-slate-100">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-sm md:text-lg shrink-0 border border-primary/20">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block">
            <h4 className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || 'Admin'}</h4>
            <p className="text-[11px] text-slate-500 font-medium">{t('superAdmin')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('admin');
  const locale = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/');
        toast.error(t('notAuthorized'));
      }
    }
  }, [mounted, isAuthenticated, user, router, t]);

  if (!mounted || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-light border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">{t('authenticating')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
