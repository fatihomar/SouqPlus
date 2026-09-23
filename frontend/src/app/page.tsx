"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function SplashScreen() {
  const t = useTranslations("home");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/home");
      } else {
        router.push("/onboarding");
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated, isClient]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background glowing dots/particles */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-primary/50 rounded-full blur-[1px]" />
        <div className="absolute top-[30%] right-[25%] w-4 h-4 bg-primary/40 rounded-full blur-[2px]" />
        <div className="absolute top-[40%] left-[15%] w-2 h-2 bg-primary/60 rounded-full blur-[1px]" />
        <div className="absolute bottom-[40%] right-[20%] w-5 h-5 bg-primary/30 rounded-full blur-[3px]" />
        <div className="absolute bottom-[25%] left-[25%] w-4 h-4 bg-primary/40 rounded-full blur-[2px]" />
        <div className="absolute bottom-[15%] right-[35%] w-3 h-3 bg-primary/50 rounded-full blur-[1px]" />
        
        {/* Large subtle background glow */}
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[80px]" />
      </motion.div>

      {/* Main Logo & Text */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
          Souq<span className="text-primary">+</span>
        </h1>
        <p className="mt-3 text-base text-slate-500 font-medium">{t("aiSmartMarketplace")}</p>
      </motion.div>
    </div>
  );
}
