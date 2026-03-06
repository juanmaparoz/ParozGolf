"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { findUserByEmailAndPassword } from "@/mocks/mockUsers";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const user = findUserByEmailAndPassword(email.trim(), password);
    if (!user) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    login(user.playerId ?? null);
    router.push("/dashboard");
  };

  if (!isInitialized || isAuthenticated) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-dark-border bg-dark-surface p-6 shadow-lg">
        <p className="text-slate-500">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-dark-border bg-dark-surface p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">
        Iniciar sesión
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-400"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-400"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 pr-10 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-dark-border hover:text-slate-300"
              title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}
        <button
          type="submit"
          className="mt-2 rounded-lg bg-slate-600 py-2 font-medium text-white transition hover:bg-slate-500"
        >
          Entrar
        </button>
      </form>

      <div className="mt-6 border-t border-dark-border pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          Acceso rápido (demo)
        </p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Admin (soporte)", email: "admin@gmail.com" },
            { label: "Super Admin (soporte)", email: "superadmin@gmail.com" },
            { label: "Carlos Méndez", email: "carlos@ccm.com" },
            { label: "Elena Ruiz", email: "elena@ccm.com" },
          ].map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword("123456");
                setError("");
              }}
              className="rounded-lg border border-dark-border bg-dark-bg/50 px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-slate-600 hover:bg-dark-bg hover:text-slate-100"
            >
              <span className="font-medium">{account.label}</span>
              <span className="ml-2 text-slate-500">{account.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
