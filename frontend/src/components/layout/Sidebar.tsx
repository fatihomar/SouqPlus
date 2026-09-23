import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { messagesService } from "@/services/messages.service";
import { authService } from "@/services/auth.service";
import {
  Home,
  PlusCircle,
  Heart,
  MessageSquare,
  List,
  Bell,
  Settings,
  LogOut,
  User,
  X,
  Menu,
  DollarSign,
  LayoutDashboard
} from "lucide-react";
import { useTranslations } from "next-intl";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const t = useTranslations("sidebar");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      messagesService.getUnreadCount().then(res => {
        if (res.success) setUnreadCount(res.data.count);
      }).catch(() => {});
    }
  }, [user, pathname]);

  const navItems = [
    { name: t("home"), href: "/home", icon: Home, hideOnMobile: true },
    { name: t("myListings"), href: "/my-listings", icon: List, hideOnMobile: true },
    { name: t("offers"), href: "/offers", icon: DollarSign },
    { name: t("messages"), href: "/messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined, hideOnMobile: true },
    { name: t("notifications"), href: "/notifications", icon: Bell },
  ];

  const bottomItems = [
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      
      {/* Off-canvas Sidebar */}
      <aside 
        className={`fixed top-0 start-0 h-full w-[280px] bg-white border-e border-slate-100 z-50 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}`}
      >
        {/* Close Button (Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-4 end-4 p-2 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-10 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile Logo (No layoutId) */}
        <div className="pt-8 pb-6 px-8 flex md:hidden items-center mb-2">
          <Link href="/home" className="text-3xl font-black tracking-tight text-slate-900">
            Souq<span className="text-primary">+</span>
          </Link>
        </div>

        {/* Desktop Header (Matches Navbar, uses layoutId) */}
        <div className="hidden md:flex h-[88px] items-center gap-3 px-8 shrink-0 mb-2">
          <motion.button 
            layoutId="hamburger"
            onClick={onClose}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
          <Link href="/home" className="shrink-0 ms-2">
            <motion.div layoutId="logo" className="text-2xl font-black tracking-tight text-slate-900">
              Souq<span className="text-primary">+</span>
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 flex flex-col gap-1.5 pb-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/home' && pathname === '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-[15px] ${item.hideOnMobile ? 'hidden md:flex' : 'flex'} ${
                  isActive 
                    ? "bg-primary/10 text-primary-dark" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </div>
                {item.badge && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-slate-100 my-4 mx-4"></div>

          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-[15px] ${
                  isActive 
                    ? "bg-primary/10 text-primary-dark" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Link */}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-[15px] text-primary-dark bg-primary-50 hover:bg-primary-light mt-1"
            >
              <LayoutDashboard className="w-5 h-5 text-primary" strokeWidth={2.5} />
              {t("adminPanel")}
            </Link>
          )}

          {/* Auth Section */}
          {user ? (
            <button
              onClick={async () => {
                try {
                  await authService.logout();
                } catch (err) {}
                logout();
                window.location.href = '/login';
              }}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-[15px] text-slate-500 hover:bg-red-50 hover:text-red-600 mt-1"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" strokeWidth={2} />
              {t("logout")}
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-4 px-4 pb-4 border-t border-slate-100 pt-6">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full py-3 rounded-xl transition-all duration-200 font-bold text-[15px] text-center text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                {t("login") || "Login"}
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full py-3 rounded-xl transition-all duration-200 font-bold text-[15px] text-center text-white bg-slate-900 hover:bg-slate-800 shadow-md"
              >
                {t("signup") || "Sign Up"}
              </Link>
            </div>
          )}
        </nav>


      </aside>
    </>
  );
}
