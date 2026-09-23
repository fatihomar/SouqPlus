import { BrainCircuit, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AIAssistantPlaceholder() {
  const t = useTranslations("components.aiAssistant");

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-28 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t("title")}</h3>
            <p className="text-xs font-medium text-slate-500">{t("subtitle")}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-primary-light text-primary-dark text-[10px] font-bold rounded-full uppercase tracking-wider">
          {t("comingSoon")}
        </span>
      </div>

      {/* Suggested Price (Placeholder) */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100/60">
        <div className="flex items-center gap-2 mb-2 text-slate-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{t("suggestedPrice")}</span>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-black text-slate-400 blur-[4px] select-none">1,250,000</span>
          <span className="text-sm font-bold text-slate-400 mb-1">{t("sar")}</span>
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          {t("pricingNotice")}
        </p>
      </div>

      {/* Quality Score (Placeholder) */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100/60">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{t("qualityScore")}</span>
        </div>
        
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-slate-300 w-[60%] rounded-full"></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>{t("good")}</span>
          <span>{t("excellent")}</span>
        </div>
      </div>

      {/* Description Generator (Placeholder) */}
      <button className="w-full h-12 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
        <Sparkles className="w-4 h-4" />
        {t("generateDesc")}
      </button>

      <div className="mt-4 flex gap-2 items-start p-3 bg-primary-50 text-primary-dark rounded-xl">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium leading-snug">
          {t("developmentNotice")}
        </p>
      </div>

    </div>
  );
}
