import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LocationMapPlaceholder() {
  const t = useTranslations("components.listingCard");

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-[420px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t("locationPreview")}</h3>
            <p className="text-xs font-medium text-slate-500">{t("interactiveMap")}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
          Soon
        </span>
      </div>

      {/* Map Fake UI */}
      <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Fake Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm shadow flex items-center justify-center animate-pulse mb-2">
            <MapPin className="w-6 h-6 text-slate-400" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Map Loading...</span>
        </div>

      </div>

      <p className="text-[11px] text-slate-400 font-medium text-center mt-4">
        Location map integration is pending. Location data is still saved in the backend.
      </p>

    </div>
  );
}
