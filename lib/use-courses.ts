"use client";

import { useState, useCallback, useEffect } from "react";
import type { Course } from "@/types/course";
import { getAllCourses, saveCourse as persistCourse, type CreateCourseInput } from "./courses-store";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);

  const refresh = useCallback(() => {
    setCourses(getAllCourses());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveCourse = useCallback((input: CreateCourseInput) => {
    const created = persistCourse(input);
    setCourses(getAllCourses());
    return created;
  }, []);

  return { courses, saveCourse, refresh };
}
