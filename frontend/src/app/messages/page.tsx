"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { messagesService } from "@/services/messages.service";
import { useAuthStore } from "@/store/auth.store";
import { Send, Image as ImageIcon, Loader2, Search, ChevronRight, Paperclip, CheckCheck, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function MessagesPage() {
  const t = useTranslations("messages");
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Load conversations initially
  const loadConversations = async () => {
    try {
      const res = await messagesService.getConversations();
      if (res.success) setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load messages for active user
  const loadMessages = async (userId: string) => {
    try {
      const res = await messagesService.getMessages(userId);
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Polling logic
  useEffect(() => {
    loadConversations();
    
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadConversations();
        if (activeUser) {
          loadMessages(activeUser.id);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      loadMessages(activeUser.id);
    }
  }, [activeUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    setIsSending(true);
    try {
      const res = await messagesService.sendMessage({
        receiverId: activeUser.id,
        content: newMessage
      });
      if (res.success) {
        setNewMessage("");
        setMessages([...messages, res.data]);
        loadConversations(); // Update side list
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الإرسال");
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="bg-white lg:rounded-3xl lg:border border-slate-100 lg:shadow-sm flex h-[calc(100vh-5rem)] lg:h-[80vh] overflow-hidden">
        
        {/* Sidebar (Conversations List) */}
        <div className={`w-full md:w-1/3 border-e border-slate-100 flex-col bg-slate-50/50 ${activeUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-xl">{t("title")}</h2>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pe-10 ps-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {t("noMatches")}
              </div>
            ) : (
              filteredConversations.map((conv, idx) => {
                const isActive = activeUser?.id === conv.user.id;
                // Parse date for short display (e.g., 06:16 AM or Yesterday)
                const msgDate = new Date(conv.lastMessage.createdAt);
                const isToday = new Date().toDateString() === msgDate.toDateString();
                const timeString = isToday 
                  ? msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : msgDate.toLocaleDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveUser(conv.user)}
                    className={`w-full text-end p-4 border-b border-slate-100 hover:bg-slate-100 transition-colors flex items-center gap-3 ${
                      isActive ? "bg-slate-100" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold shrink-0">
                        {conv.user.fullName.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 end-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-900 truncate" dir="auto">{conv.user.fullName}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap me-2" dir="ltr">{timeString}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-500"}`} dir="auto">
                          {conv.lastMessage.content || t("imageAttached")}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#facc15] text-slate-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`w-full md:w-2/3 flex-col bg-white ${activeUser ? 'fixed inset-0 z-[100] h-[100dvh] flex md:relative md:inset-auto md:z-auto md:h-auto' : 'hidden md:flex'}`}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white z-10">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button 
                    className="md:hidden p-2 -ms-2 text-slate-600 hover:bg-slate-100 rounded-full"
                    onClick={() => setActiveUser(null)}
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold">
                      {activeUser.fullName.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight" dir="auto">{activeUser.fullName}</h3>
                    <span className="text-[10px] text-green-500 font-medium">{t("onlineNow")}</span>
                  </div>
                </div>

                {/* Listing Card Context (if available) */}
                {(() => {
                  const msgWithListing = [...messages].reverse().find(m => m.listing);
                  if (!msgWithListing) return null;
                  return (
                    <a 
                      href={`/listings/${msgWithListing.listing.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors border border-slate-100 w-full md:w-auto"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-200 shrink-0">
                        {msgWithListing.listing.images?.[0] ? (
                          <img src={msgWithListing.listing.images[0]} alt="Listing" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pe-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate" dir="auto">{msgWithListing.listing.title}</h4>
                        <p className="text-xs text-slate-500 font-medium" dir="ltr">${msgWithListing.listing.price?.toLocaleString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
                    </a>
                  );
                })()}
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                <div className="text-center">
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{t("today")}</span>
                </div>
                
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isMine 
                          ? "bg-primary text-white rounded-tr-sm" 
                          : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"
                      }`} dir="auto">
                        {msg.content}
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="مرفق" className="mt-2 rounded-xl max-w-full h-auto" />
                        )}
                        <div className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${isMine ? "text-white/80" : "text-slate-400"}`} dir="ltr">
                          <span>{time}</span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-full p-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <button type="button" className="p-2.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("typeMessage")}
                    dir="auto"
                    className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ms-1 rtl:mr-1 rtl:ml-0" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <Send className="w-8 h-8 text-slate-300 ms-1 rtl:rotate-180" />
              </div>
              <p>{t("selectConversation")}</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
