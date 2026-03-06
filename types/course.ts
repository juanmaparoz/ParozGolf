import type { Hole } from "./hole";

export interface Course {
  id: string;
  name: string;
  parTotal: number;
  holes: Hole[];
}
