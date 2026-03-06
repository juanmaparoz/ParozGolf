"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLeague } from "@/lib/use-league";
import { useCourses } from "@/lib/use-courses";

const DEFAULT_RULES = {
  use85Percent: true,
  use100Percent: true,
  useMatchInternal: true,
};

export function CreateLeagueForm() {
  const router = useRouter();
  const { createLeague, leagues } = useLeague();
  const { courses } = useCourses();
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenCourseId = courseId || courses[0]?.id;
    if (!name.trim() || !chosenCourseId) return;
    createLeague({
      name: name.trim(),
      courseId: chosenCourseId,
      rules: DEFAULT_RULES,
    });
    router.push("/liga");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Nueva liga</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crea una liga para organizar fechas y clasificaciones.
          </p>
        </div>
        <Link href="/liga" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a Liga
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 sm:p-6"
      >
        <div className="mb-4">
          <label htmlFor="league-name" className="mb-1 block text-sm font-medium text-slate-400">
            Nombre de la liga
          </label>
          <input
            id="league-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Liga CCM"
            className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 placeholder-slate-500"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="league-course" className="mb-1 block text-sm font-medium text-slate-400">
            Campo
          </label>
          <select
            id="league-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100"
            required
          >
            <option value="">— Elegir campo —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Crear liga
          </button>
          <Link
            href="/liga"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {leagues.length > 0 && (
        <p className="text-sm text-slate-500">
          Tienes {leagues.length} liga(s). La nueva será la activa. Puedes cambiar de liga desde la página Liga.
        </p>
      )}
    </div>
  );
}
