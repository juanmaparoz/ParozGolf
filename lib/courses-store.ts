import type { Course } from "@/types/course";
import type { HoleNumber, HandicapIndex } from "@/types/hole";
import { mockCourse } from "@/mocks/mockCourse";

const STORAGE_KEY = "golf-saas-courses";

function getStored(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Course[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllCourses(): Course[] {
  return [mockCourse, ...getStored()];
}

/** Genera 18 hoyos por defecto par 72 (4 par 3, 10 par 4, 4 par 5) con handicap index 1-18 */
function defaultHoles(parTotal: number): { number: HoleNumber; par: number; handicapIndex: HandicapIndex }[] {
  const par3 = 4;
  const par5 = 4;
  const par4 = 18 - par3 - par5;
  const holes: { number: HoleNumber; par: number; handicapIndex: HandicapIndex }[] = [];
  const holeNumbers: HoleNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const pars: number[] = [
    ...Array(par3).fill(3),
    ...Array(par4).fill(4),
    ...Array(par5).fill(5),
  ];
  for (let i = 0; i < 18; i++) {
    holes.push({
      number: holeNumbers[i],
      par: pars[i] ?? 4,
      handicapIndex: (i + 1) as HandicapIndex,
    });
  }
  return holes;
}

export interface HoleInput {
  number: HoleNumber;
  par: number;
  handicapIndex: HandicapIndex;
}

export interface CreateCourseInput {
  name: string;
  parTotal: number;
  holes?: HoleInput[];
}

export function getDefaultHoles(): HoleInput[] {
  return defaultHoles(72);
}

export function saveCourse(input: CreateCourseInput): Course {
  const stored = getStored();
  const id = `course-${Date.now()}`;
  const holes = input.holes ?? defaultHoles(input.parTotal);
  const parTotal = input.parTotal;
  const course: Course = { id, name: input.name.trim() || "Sin nombre", parTotal, holes };
  stored.push(course);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
  return course;
}
