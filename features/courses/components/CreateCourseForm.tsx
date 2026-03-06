"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourses } from "@/lib/use-courses";
import { getDefaultHoles, type HoleInput } from "@/lib/courses-store";

export function CreateCourseForm() {
  const router = useRouter();
  const { saveCourse } = useCourses();
  const [name, setName] = useState("");
  const [holes, setHoles] = useState<HoleInput[]>(() => getDefaultHoles());
  const [parTotalOverride, setParTotalOverride] = useState<number | null>(null);

  const calculatedParTotal = useMemo(() => {
    return holes.reduce((sum, h) => sum + h.par, 0);
  }, [holes]);

  const parTotal = parTotalOverride ?? calculatedParTotal;

  const updateHolePar = (holeNumber: number, newPar: number) => {
    setHoles((prev) =>
      prev.map((h) =>
        h.number === holeNumber ? { ...h, par: Math.max(3, Math.min(6, newPar)) } : h
      )
    );
    setParTotalOverride(null);
  };

  const handleParTotalChange = (value: number) => {
    setParTotalOverride(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCourse({ name: name.trim() || "Nuevo campo", parTotal, holes });
    router.push("/courses");
  };

  const frontNine = holes.filter((h) => h.number <= 9);
  const backNine = holes.filter((h) => h.number > 9);
  const frontNinePar = frontNine.reduce((sum, h) => sum + h.par, 0);
  const backNinePar = backNine.reduce((sum, h) => sum + h.par, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Crear campo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configura el par de cada hoyo
          </p>
        </div>
        <Link
          href="/courses"
          className="text-sm font-medium text-slate-400 hover:text-slate-200"
        >
          ← Volver a campos
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 sm:p-6"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="course-name" className="mb-1 block text-sm font-medium text-slate-400">
                Nombre del campo
              </label>
              <input
                id="course-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Campo Norte"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label htmlFor="par-total" className="mb-1 block text-sm font-medium text-slate-400">
                Par total
              </label>
              <input
                id="par-total"
                type="number"
                min={54}
                max={108}
                value={parTotal}
                onChange={(e) => handleParTotalChange(parseInt(e.target.value, 10) || 72)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                {parTotalOverride !== null && parTotalOverride !== calculatedParTotal ? (
                  <span className="text-amber-400">
                    Suma de hoyos: {calculatedParTotal} (editado manualmente)
                  </span>
                ) : (
                  "Calculado de la suma de los hoyos"
                )}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-slate-300">Par por hoyo</h2>
            
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Ida (1-9)</span>
                  <span className="text-xs text-slate-500">Par: {frontNinePar}</span>
                </div>
                <div className="grid grid-cols-9 gap-1">
                  {frontNine.map((hole) => (
                    <div key={hole.number} className="flex flex-col items-center">
                      <span className="mb-1 text-xs text-slate-500">{hole.number}</span>
                      <input
                        type="number"
                        min={3}
                        max={6}
                        value={hole.par}
                        onChange={(e) => updateHolePar(hole.number, parseInt(e.target.value, 10) || 4)}
                        className="w-full rounded border border-slate-600 bg-slate-900/50 px-1 py-1.5 text-center text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Vuelta (10-18)</span>
                  <span className="text-xs text-slate-500">Par: {backNinePar}</span>
                </div>
                <div className="grid grid-cols-9 gap-1">
                  {backNine.map((hole) => (
                    <div key={hole.number} className="flex flex-col items-center">
                      <span className="mb-1 text-xs text-slate-500">{hole.number}</span>
                      <input
                        type="number"
                        min={3}
                        max={6}
                        value={hole.par}
                        onChange={(e) => updateHolePar(hole.number, parseInt(e.target.value, 10) || 4)}
                        className="w-full rounded border border-slate-600 bg-slate-900/50 px-1 py-1.5 text-center text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Guardar campo
          </button>
          <Link
            href="/courses"
            className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
