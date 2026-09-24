"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Smartphone, Home, Car, Laptop, DoorOpen,
  ShoppingBag, Search, BarChart3, Handshake, ShieldCheck
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const t = useTranslations("onboarding.steps");
  const tFeatures = useTranslations("onboarding.aiFeatures");

  const onboardingSteps = [
  {
    title: t("step1Title"),
    description: t("step1Desc"),
    illustration: (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative w-32 h-56 border-[6px] border-slate-800 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-xl">
          <div className="absolute top-2 w-10 h-1 bg-slate-800 rounded-full" />
          <DoorOpen className="w-12 h-12 text-slate-800" strokeWidth={1.5} />
        </div>
        <div className="absolute top-8 start-0 p-3 bg-white rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: "0s" }}>
          <Car className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-12 -start-2 p-3 bg-white rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: "0.2s" }}>
          <Home className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
        </div>
        <div className="absolute top-24 -end-4 p-3 bg-white rounded-2xl shadow-lg animate-bounce" style={{ animationDelay: "0.4s" }}>
          <Laptop className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
        </div>
      </div>
    )
  },
  {
    title: t("step2Title"),
    description: t("step2Desc"),
    illustration: (
      <div className="relative w-64 h-64 flex flex-col items-center justify-center pt-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-24 h-24 bg-white border-2 border-primary rounded-2xl shadow-lg flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="w-full mt-6 space-y-2 z-20">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Search className="w-4 h-4 text-primary" /></div>
            <span className="text-[11px] font-semibold text-slate-700">{tFeatures("conversationalSearch")}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="p-1.5 bg-primary/10 rounded-lg"><BarChart3 className="w-4 h-4 text-primary" /></div>
            <span className="text-[11px] font-semibold text-slate-700">{tFeatures("marketInsights")}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-sm border border-slate-100">
            <div className="p-1.5 bg-primary/10 rounded-lg"><Handshake className="w-4 h-4 text-primary" /></div>
            <span className="text-[11px] font-semibold text-slate-700">{tFeatures("assistedNegotiations")}</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: t("step3Title"),
    description: t("step3Desc"),
    illustration: (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-32 h-32 bg-white/90 backdrop-blur border-2 border-primary/20 rounded-[2.5rem] shadow-2xl flex items-center justify-center">
          <ShieldCheck className="w-16 h-16 text-primary" strokeWidth={1.5} />
        </div>
        <div className="absolute w-48 h-48 border border-primary/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-56 h-56 border border-slate-200 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <span className="absolute top-10 end-8 text-xs font-bold text-primary">★</span>
        <span className="absolute bottom-12 start-6 text-xs font-bold text-slate-400">★</span>
      </div>
    )
  }
  ];

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 md:py-8 px-2 md:px-0">
        <button 
          onClick={() => { if(step > 0) setStep(step - 1); else router.push("/home"); }}
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-xl font-bold tracking-tight text-slate-900">
          Souq<span className="text-primary">+</span>
        </div>
        <div className="w-10 h-10"></div> {/* Spacer to center the logo */}
      </div>

      <div className="w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center pb-10">
        
        {/* Left Side: Mobile Mockup / Illustration Area */}
        <div className="flex flex-col items-center justify-center order-1 md:order-1 h-[350px] md:h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {onboardingSteps[step].illustration}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Content Area */}
        <div className="flex flex-col justify-center order-2 md:order-2 h-full">
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center md:text-start"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {onboardingSteps[step].title}
                </h2>
                <p className="text-slate-500 text-sm md:text-base max-w-sm mx-auto md:mx-0">
                  {onboardingSteps[step].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-10">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mx-auto md:mx-0">
            <Button 
              onClick={nextStep} 
              className="w-full font-semibold rounded-xl h-12 text-base"
            >
              {step === onboardingSteps.length - 1 ? t("getStarted") : t("next")}
            </Button>
            {step < onboardingSteps.length - 1 && (
              <Button 
                variant="ghost" 
                onClick={() => router.push("/home")}
                className="w-full sm:w-auto text-slate-500 hover:text-slate-900 font-semibold"
              >
                {t("skip")}
              </Button>
            )}
          </div>
          
          {step === onboardingSteps.length - 1 && (
            <div className="mt-6 text-center md:text-start">
              <p className="text-sm text-slate-500 font-medium">
                {t("alreadyHaveAccount")}{" "}
                <button onClick={() => router.push("/login")} className="text-slate-900 font-bold hover:underline">
                  {t("logIn")}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
