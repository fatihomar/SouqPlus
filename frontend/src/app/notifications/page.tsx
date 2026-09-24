"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { notificationsService } from "@/services/notifications.service";
import { useTranslations } from "next-intl";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء جلب الإشعارات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await notificationsService.markAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifLink = (notif: any) => {
    if (notif.type === 'OFFER_RECEIVED') return '/offers?tab=received';
    if (notif.type === 'MESSAGE_RECEIVED') {
      const targetUser = notif.entityId || notif.actorId;
      return targetUser ? `/messages?user=${targetUser}` : '/messages';
    }
    if (notif.content?.includes('عرض') || notif.content?.includes('offer')) return '/offers?tab=sent';
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-light text-primary-dark rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">{t("title")}</h1>
          </div>

          <button 
            onClick={handleMarkAsRead}
            disabled={!notifications.some(n => !n.isRead)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {t("markAllRead")}
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <Bell className="w-8 h-8" />
            </div>
            {t("empty")}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {notifications.map((notif) => {
              const link = getNotifLink(notif);
              return (
                <div 
                  key={notif.id} 
                  onClick={() => {
                    if (link) router.push(link);
                  }}
                  className={`p-5 border-b border-slate-50 transition-colors flex gap-4 items-start ${link ? 'cursor-pointer hover:bg-slate-50' : ''} ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${!notif.isRead ? 'bg-primary-light text-primary-dark' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm md:text-base leading-relaxed ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {notif.payload && notif.payload.type ? t(notif.payload.type, { 
                        amount: notif.payload.amount?.toLocaleString() || '', 
                        title: notif.payload.listingTitle || '', 
                        name: notif.payload.actorName || '' 
                      }) : notif.content}
                    </p>
                    <span className="text-xs font-medium text-slate-400 mt-2 block">
                      {new Date(notif.createdAt).toLocaleDateString('ar')} - {new Date(notif.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-3"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
