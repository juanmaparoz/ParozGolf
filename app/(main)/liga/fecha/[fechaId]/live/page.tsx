"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLeague } from "@/lib/use-league";
import { useFechas } from "@/lib/use-fechas";
import { FechaLiveView } from "@/features/liga/components/FechaLiveView";

export default function FechaLivePage() {
  const params = useParams();
  const fechaId = typeof params.fechaId === "string" ? params.fechaId : null;
  const { league } = useLeague();
  const { getFechaById } = useFechas(league?.id ?? null);
  const fecha = fechaId && league ? getFechaById(fechaId) : null;

  if (!league) {
    return (
      <div className="p-4">
        <p className="text-slate-500">Cargando liga...</p>
      </div>
    );
  }

  if (!fechaId || !fecha) {
    return (
      <div className="p-4">
        <p className="text-slate-500">Fecha no encontrada.</p>
        <Link href="/liga" className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300">
          ← Volver a Liga
        </Link>
      </div>
    );
  }

  return <FechaLiveView league={league} fecha={fecha} />;
}
