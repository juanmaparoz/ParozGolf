import type { Course } from "@/types/course";
import type { FechaPair } from "@/types/fecha";

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

export interface PairPointsOptions {
  pairs?: FechaPair[];
  /** @deprecated usar pairs[] */
  pairA?: FechaPair;
  /** @deprecated usar pairs[] */
  pairB?: FechaPair;
}

export interface GroupPointsResult {
  pairA: FechaPair;
  pairB: FechaPair;
  pointsA: number;
  pointsB: number;
}

export function computeAllGroupPoints(
  allPlayers: PlayerForPoints[],
  scores: Record<number, Record<string, number>>,
  course: Course,
  options?: PairPointsOptions
): GroupPointsResult[] {
  const results: GroupPointsResult[] = [];

  if (options?.pairs && options.pairs.length >= 2) {
    for (let i = 0; i < options.pairs.length - 1; i += 2) {
      const pairA = options.pairs[i];
      const pairB = options.pairs[i + 1];
      const groupPlayerIds = [pairA.player1Id, pairA.player2Id, pairB.player1Id, pairB.player2Id];
      const groupPlayers = allPlayers.filter((p) => groupPlayerIds.includes(p.playerId));
      const { pointsA, pointsB } = computeGroupPoints(groupPlayers, scores, course, pairA, pairB);
      results.push({ pairA, pairB, pointsA, pointsB });
    }
  } else if (options?.pairA && options?.pairB) {
    const pairA = options.pairA;
    const pairB = options.pairB;
    const groupPlayerIds = [pairA.player1Id, pairA.player2Id, pairB.player1Id, pairB.player2Id];
    const groupPlayers = allPlayers.filter((p) => groupPlayerIds.includes(p.playerId));
    const { pointsA, pointsB } = computeGroupPoints(groupPlayers, scores, course, pairA, pairB);
    results.push({ pairA, pairB, pointsA, pointsB });
  } else {
    const groupPlayers = allPlayers.slice(0, 4);
    const pairA = { player1Id: groupPlayers[0]?.playerId ?? "", player2Id: groupPlayers[1]?.playerId ?? "" };
    const pairB = { player1Id: groupPlayers[2]?.playerId ?? "", player2Id: groupPlayers[3]?.playerId ?? "" };
    const { pointsA, pointsB } = computeGroupPoints(groupPlayers, scores, course, pairA, pairB);
    results.push({ pairA, pairB, pointsA, pointsB });
  }

  return results;
}

function computeGroupPoints(
  groupPlayers: PlayerForPoints[],
  scores: Record<number, Record<string, number>>,
  course: Course,
  pairA: FechaPair,
  pairB: FechaPair
): { pointsA: number; pointsB: number } {
  let totalA = 0;
  let totalB = 0;

  const pairAIds = new Set([pairA.player1Id, pairA.player2Id]);
  const pairBIds = new Set([pairB.player1Id, pairB.player2Id]);

  for (let holeNum = 1; holeNum <= 18; holeNum++) {
    const holeData = course.holes.find((h) => h.number === holeNum);
    const hcpIndex = holeData?.handicapIndex ?? 1;
    const holeScores = scores[holeNum] ?? {};
    
    const playerNets = groupPlayers.map((p) => {
      const gross = holeScores[p.playerId] ?? 0;
      const str = strokesOnHole(p.adjusted85, hcpIndex);
      return { playerId: p.playerId, net: Math.max(0, gross - str), gross };
    });
    
    const validPlayers = playerNets.filter((p) => p.gross > 0);
    if (validPlayers.length === 0) continue;

    const validNets = validPlayers.map((p) => p.net);
    const bestNet = Math.min(...validNets);
    const worstNet = Math.max(...validNets);
    
    const bestPlayers = validPlayers.filter((p) => p.net === bestNet);
    const worstPlayers = validPlayers.filter((p) => p.net === worstNet);

    const bestFromA = bestPlayers.filter((p) => pairAIds.has(p.playerId)).length;
    const bestFromB = bestPlayers.filter((p) => pairBIds.has(p.playerId)).length;
    if (bestFromA > 0 && bestFromB > 0) {
      totalA += 0.5;
      totalB += 0.5;
    } else if (bestFromA > 0) totalA += 1;
    else if (bestFromB > 0) totalB += 1;

    const worstFromA = worstPlayers.filter((p) => pairAIds.has(p.playerId)).length;
    const worstFromB = worstPlayers.filter((p) => pairBIds.has(p.playerId)).length;
    if (worstFromA > 0 && worstFromB > 0) {
      totalA += 0.5;
      totalB += 0.5;
    } else if (worstFromA > 0) totalA += 1;
    else if (worstFromB > 0) totalB += 1;
  }

  return { pointsA: totalA, pointsB: totalB };
}

/** @deprecated usar computeAllGroupPoints */
export function computePairPoints(
  playersWithInfo: PlayerForPoints[],
  scores: Record<number, Record<string, number>>,
  course: Course,
  options?: PairPointsOptions
): { pointsA: number; pointsB: number } {
  const results = computeAllGroupPoints(playersWithInfo, scores, course, options);
  if (results.length === 0) return { pointsA: 0, pointsB: 0 };
  return { pointsA: results[0].pointsA, pointsB: results[0].pointsB };
}
