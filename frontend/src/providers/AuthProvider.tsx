"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setCredentials, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response.data) {
          setCredentials(response.data);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setCredentials, logout]);

  return <>{children}</>;
}
