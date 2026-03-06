import type { Course } from "@/types/course";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

export interface PlayerForPoints {
  playerId: string;
  adjusted85: number;
}

const PAIR_A_INDEXES = [0, 1];
const PAIR_B_INDEXES = [2, 3];

export function computePairPoints(
  playersWithInfo: PlayerForPoints[],
  scores: Record<number, Record<string, number>>,
  course: Course
): { pointsA: number; pointsB: number } {
  let totalA = 0;
  let totalB = 0;

  for (let holeNum = 1; holeNum <= 18; holeNum++) {
    const holeData = course.holes.find((h) => h.number === holeNum);
    const hcpIndex = holeData?.handicapIndex ?? 1;
    const holeScores = scores[holeNum] ?? {};
    const nets = playersWithInfo.map((p) => {
      const gross = holeScores[p.playerId] ?? 0;
      const str = strokesOnHole(p.adjusted85, hcpIndex);
      return Math.max(0, gross - str);
    });
    const validIndices = playersWithInfo
      .map((_, i) => i)
      .filter((i) => (holeScores[playersWithInfo[i].playerId] ?? 0) > 0);
    if (validIndices.length === 0) continue;

    const validNets = validIndices.map((i) => nets[i]);
    const bestNet = Math.min(...validNets);
    const worstNet = Math.max(...validNets);
    const bestIndices = validIndices.filter((i) => nets[i] === bestNet);
    const worstIndices = validIndices.filter((i) => nets[i] === worstNet);

    const bestFromA = bestIndices.filter((i) => PAIR_A_INDEXES.includes(i)).length;
    const bestFromB = bestIndices.filter((i) => PAIR_B_INDEXES.includes(i)).length;
    if (bestFromA > 0 && bestFromB > 0) {
      totalA += 0.5;
      totalB += 0.5;
    } else if (bestFromA > 0) totalA += 1;
    else if (bestFromB > 0) totalB += 1;

    const worstFromA = worstIndices.filter((i) => PAIR_A_INDEXES.includes(i)).length;
    const worstFromB = worstIndices.filter((i) => PAIR_B_INDEXES.includes(i)).length;
    if (worstFromA > 0 && worstFromB > 0) {
      totalA += 0.5;
      totalB += 0.5;
    } else if (worstFromA > 0) totalA += 1;
    else if (worstFromB > 0) totalB += 1;
  }

  return { pointsA: totalA, pointsB: totalB };
}
