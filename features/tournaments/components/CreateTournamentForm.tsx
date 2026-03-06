"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourses } from "@/lib/use-courses";
import { useTournaments } from "@/lib/use-tournaments";

export function CreateTournamentForm() {
  const router = useRouter();
  const { saveTournament } = useTournaments();
  const { courses } = useCourses();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [use85Percent, setUse85Percent] = useState(true);
  const [use100Percent, setUse100Percent] = useState(true);
  const [useMatchInternal, setUseMatchInternal] = useState(true);

  useEffect(() => {
    if (courses.length > 0 && !courseId) setCourseId(courses[0].id);
  }, [courses, courseId]);
  const selectedCourse = courses.find((c) => c.id === courseId);

  const handleSave = () => {
    saveTournament({
      name: name.trim() || "Torneo sin nombre",
      date: date || new Date().toISOString().slice(0, 10),
      courseId,
      players: [],
      status: "draft",
      rules: {
        use85Percent,
        use100Percent,
        useMatchInternal,
      },
    });
    router.push("/tournaments");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Crear torneo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configura el torneo y guárdalo para verlo en la lista
          </p>
        </div>
        <Link
          href="/tournaments"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
        >
          ← Volver a torneos
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-200">
            Datos del torneo
          </h2>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-slate-400"
              >
                Nombre torneo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Ej: Copa Primavera 2025"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-sm font-medium text-slate-400"
              >
                Fecha
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="course"
                className="mb-1 block text-sm font-medium text-slate-400"
              >
                Cancha
              </label>
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="mt-2 space-y-3 border-t border-slate-700/50 pt-4">
              <legend className="text-sm font-medium text-slate-400">
                Reglas de handicap
              </legend>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={use85Percent}
                  onChange={(e) => setUse85Percent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-300">85%</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={use100Percent}
                  onChange={(e) => setUse100Percent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-300">100%</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={useMatchInternal}
                  onChange={(e) => setUseMatchInternal(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-300">Match interno</span>
              </label>
            </fieldset>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-700/50 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Guardar torneo
              </button>
              <Link
                href="/tournaments"
                className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-200">
            Vista previa · Cancha
          </h2>
          {selectedCourse ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-slate-500">Par total</p>
                <p className="text-2xl font-bold text-slate-100">
                  {selectedCourse.parTotal}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/50">
                      <th className="px-3 py-2 text-left font-medium text-slate-500">
                        Hoyo
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-500">
                        Par
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-500">
                        Hcp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {selectedCourse.holes.map((hole) => (
                      <tr key={hole.number} className="bg-slate-800/30">
                        <td className="px-3 py-2 text-slate-200">
                          {hole.number}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {hole.par}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {hole.handicapIndex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Selecciona una cancha.</p>
          )}
        </section>
      </div>
    </div>
  );
}
