import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Paroz Golf",
  description: "Plataforma SaaS deportiva para gestión de golf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-dark-bg">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
