import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-full w-full flex-1">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
