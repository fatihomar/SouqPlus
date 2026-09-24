import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Menu, User as UserIcon, List, Heart, Settings, LogOut, ArrowRight, Home as HomeIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { notificationsService } from "@/services/notifications.service";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface NavbarProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  
  const topLevelRoutes = ['/home', '/', '/my-listings', '/messages', '/settings', '/explore', '/favorites', '/offers', '/notifications', '/create-listing', '/admin'];
  const isTopLevel = topLevelRoutes.includes(pathname);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    
    loadNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsService.getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    if (!showNotifications && unreadCount > 0) {
      try {
        await notificationsService.markAsRead();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    logout();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/explore`);
    }
  };

  return (
    <header className="h-[72px] md:h-[88px] bg-slate-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-40 transition-all">
      
      {/* Left side (Mobile Logo and Hamburger) */}
      <div className="flex items-center gap-3 min-w-[120px]">
        {/* Mobile Version (No layoutId, hidden on md) */}
        <div className="flex md:hidden items-center gap-3">
          {!isTopLevel ? (
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-colors shrink-0 shadow-sm"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          ) : onMenuClick ? (
            <button 
              onClick={onMenuClick}
              className="flex p-2.5 text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm rounded-xl transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          ) : null}
          <Link href="/home" className="shrink-0 ms-2 text-2xl font-black tracking-tight text-slate-900">
            Souq<span className="text-primary">+</span>
          </Link>
        </div>

        {/* Desktop Version (Uses layoutId, unmounts when sidebar is open) */}
        {!isSidebarOpen && (
          <div className="hidden md:flex items-center gap-3">
            {!isTopLevel ? (
              <button 
                onClick={() => router.back()}
                className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-full transition-colors shrink-0 shadow-sm"
                aria-label="رجوع"
              >
                <ArrowRight className="w-6 h-6 rtl:rotate-180" />
              </button>
            ) : onMenuClick ? (
              <motion.button 
                layoutId="hamburger"
                onClick={onMenuClick}
                className="flex p-2.5 text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm rounded-xl transition-colors shrink-0"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </motion.button>
            ) : null}
            <Link href="/home" className="shrink-0 ms-2">
              <motion.div layoutId="logo" className="text-2xl font-black tracking-tight text-slate-900">
                Souq<span className="text-primary">+</span>
              </motion.div>
            </Link>
          </div>
        )}
      </div>

      {/* Center (Desktop Search Bar) */}
      <div className="hidden md:flex flex-1 justify-center max-w-xl mx-8">
        {/* Search bar removed per user request */}
      </div>

      {/* Right Actions (Desktop & Mobile) */}
      <div className="flex items-center justify-end gap-3 sm:gap-6 min-w-[200px]">
        
        {/* Desktop Post Ad Button */}
        <Link href="/create-listing" className="hidden md:flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:shadow-md gap-2">
          <span className="text-xl leading-none -mt-0.5">+</span> {t("createListing")}
        </Link>

        {/* Favorites */}
        {isAuthenticated && (
          <Link 
            href="/favorites"
            className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex"
            aria-label={t("favorites")}
          >
            <Heart className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
          </Link>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifDropdownRef}>
          <button 
            onClick={handleOpenNotifications}
            className={`relative p-2.5 rounded-full transition-colors ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
          >
            <Bell className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-50 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 end-0 w-[300px] sm:w-[350px] rtl:origin-top-left ltr:origin-top-right bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">{t("notificationsTitle")}</h3>
                {unreadCount > 0 && <span className="text-xs font-bold text-primary-dark">{unreadCount} {t("newNotif")}</span>}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    {t("noNotifications")}
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const getNotifLink = () => {
                      if (notif.type === 'OFFER_RECEIVED') return '/offers?tab=received';
                      if (notif.type === 'MESSAGE_RECEIVED') {
                        const targetUser = notif.entityId || notif.actorId;
                        return targetUser ? `/messages?user=${targetUser}` : '/messages';
                      }
                      if (notif.content?.includes('عرض') || notif.content?.includes('offer')) return '/offers?tab=sent';
                      return null;
                    };
                    const link = getNotifLink();

                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          setShowNotifications(false);
                          if (link) router.push(link);
                        }}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${link ? 'cursor-pointer' : ''} ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center shrink-0 mt-1">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`} dir="auto">
                            {notif.payload && notif.payload.type ? t(notif.payload.type, { 
                              amount: notif.payload.amount?.toLocaleString() || '', 
                              title: notif.payload.listingTitle || '', 
                              name: notif.payload.actorName || '' 
                            }) : notif.content}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block" dir="ltr">
                            {new Date(notif.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative" ref={profileDropdownRef}>
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] transition-transform hover:scale-105 shrink-0 shadow-sm ring-2 ring-slate-100"
            >
              {user.fullName.charAt(0).toUpperCase()}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute top-12 end-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                  <div className="font-bold text-slate-900 truncate">{user.fullName}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{user.email}</div>
                </div>
                <Link href="/my-listings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-dark transition-colors">
                  <List className="w-4 h-4 text-slate-400" /> {t("myListings")}
                </Link>
                <Link href="/favorites" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-dark transition-colors md:hidden">
                  <Heart className="w-4 h-4 text-slate-400" /> {t("favorites")}
                </Link>
                <Link href="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-dark transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" /> {t("settings")}
                </Link>
                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> {t("logout")}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {!user && (
          <div className="hidden md:flex items-center gap-4 ms-2">
            <Link href="/login" className="text-[15px] font-bold text-slate-500 hover:text-slate-900 transition-colors px-2">
              {t("login") || "Login"}
            </Link>
            <Link href="/register" className="px-7 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-[15px] shadow-sm">
              {t("signup") || "Sign Up"}
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
