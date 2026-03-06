"use client";

import Link from "next/link";
import { useCourses } from "@/lib/use-courses";

export function CourseList() {
  const { courses } = useCourses();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/courses/create"
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
        >
          Crear campo
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-dark-border">
        <table className="w-full min-w-[280px]">
          <thead className="bg-dark-surface">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Par total
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Hoyos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {courses.map((course) => (
              <tr key={course.id} className="bg-dark-bg">
                <td className="px-4 py-3 text-slate-100">{course.name}</td>
                <td className="px-4 py-3 text-slate-300">{course.parTotal}</td>
                <td className="px-4 py-3 text-slate-300">{course.holes.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
