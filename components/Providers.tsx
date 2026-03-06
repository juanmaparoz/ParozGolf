"use client";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import { SidebarProvider } from "@/components/SidebarContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </AuthProvider>
  );
}
