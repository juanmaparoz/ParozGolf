"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-slate-500">Cargando...</p>
    </div>
  );
}
