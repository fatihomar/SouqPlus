"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { LayoutGroup } from "framer-motion";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change only on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <LayoutGroup>
      <div className="flex min-h-screen bg-slate-50/50 font-sans">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content Area (Full Width) */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 w-full transition-all duration-300 ease-in-out">
          <Navbar isSidebarOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-x-hidden p-4 md:p-8">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </LayoutGroup>
  );
}
