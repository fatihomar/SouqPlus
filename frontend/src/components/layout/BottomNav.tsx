"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Plus, MessageSquare, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { messagesService } from "@/services/messages.service";
import { useAuthStore } from "@/store/auth.store";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      messagesService.getUnreadCount().then(res => {
        if (res.success) setUnreadCount(res.data.count);
      }).catch(() => {});
    }
  }, [user, pathname]);

  const navItems = [
    { name: t("home"), href: "/home", icon: Home },
    { name: t("myListings"), href: "/my-listings", icon: List },
    { name: t("createListing"), href: "/create-listing", icon: Plus, isPrimary: true },
    { name: t("messages"), href: "/messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: t("account"), href: "/settings", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-slate-100 px-6 py-3 flex flex-row items-center justify-between z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            <div className="relative">
              <Icon 
                className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-slate-400'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              {item.badge && (
                <div className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center border-2 border-white font-bold">
                  {item.badge}
                </div>
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
