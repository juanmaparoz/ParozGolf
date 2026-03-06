import type { Course } from "@/types/course";
import type { HoleNumber, HandicapIndex } from "@/types/hole";

const holes: { number: HoleNumber; par: number; handicapIndex: HandicapIndex }[] = [
  { number: 1, par: 4, handicapIndex: 11 },
  { number: 2, par: 5, handicapIndex: 5 },
  { number: 3, par: 3, handicapIndex: 15 },
  { number: 4, par: 4, handicapIndex: 3 },
  { number: 5, par: 4, handicapIndex: 9 },
  { number: 6, par: 5, handicapIndex: 1 },
  { number: 7, par: 3, handicapIndex: 17 },
  { number: 8, par: 4, handicapIndex: 7 },
  { number: 9, par: 4, handicapIndex: 13 },
  { number: 10, par: 4, handicapIndex: 12 },
  { number: 11, par: 5, handicapIndex: 2 },
  { number: 12, par: 3, handicapIndex: 18 },
  { number: 13, par: 4, handicapIndex: 4 },
  { number: 14, par: 4, handicapIndex: 10 },
  { number: 15, par: 5, handicapIndex: 6 },
  { number: 16, par: 3, handicapIndex: 16 },
  { number: 17, par: 4, handicapIndex: 8 },
  { number: 18, par: 4, handicapIndex: 14 },
];

export const mockCourse: Course = {
  id: "course-ccm",
  name: "Campo CCM - 18 hoyos",
  parTotal: 72,
  holes,
};

/** Lista de campos para listados (incluye el mock principal) */
export const mockCourses: Course[] = [mockCourse];
