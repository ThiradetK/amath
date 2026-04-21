/**
 * endgame.ts
 * ──────────────────────────────────────────────────────────────
 * Pure functions for A-Math end-game detection and score finalisation.
 * This module is intentionally stateless — it receives snapshots and
 * returns new snapshots.  Import into the server or any test suite.
 *
 * Covered cases
 * ─────────────
 * Case A  EMPTY_HAND   — bag empty AND one player used all tiles
 * Case B  ALL_PASS     — consecutive-pass threshold reached
 * Case C  TIMEOUT_STALL— server auto-passed every connected player twice
 *                        (same counter as Case B, different label for UI)
 * Case D  DISCONNECT   — all remaining players disconnect (handled in server,
 *                        not here — we just surface the endgame calculation)
 *
 * Tie-breaking
 * ────────────
 * Official rule: ties are honoured — all top scorers are co-winners.
 * No secondary tiebreaker is applied.
 */

import type { Tile } from "./types";

// ─── Minimal types needed by this module ─────────────────

export interface EndgamePlayer {
  id: string;
  name: string;
  score: number;
  rack: Tile[];
  rackPenalty?: number; // set by finaliseGame
  emptyHandBonus?: number; // set by finaliseGame
  finalScore?: number; // set by finaliseGame
}

export type GameEndReason =
  | "EMPTY_HAND" // Case A — someone emptied their rack after bag ran out
  | "ALL_PASS" // Case B — consecutive pass threshold hit
  | "TIMEOUT_STALL" // Case C — every player timed out repeatedly
  | "DISCONNECT"; // Case D — forced end due to disconnection

export interface EndgameResult {
  reason: GameEndReason;
  players: EndgamePlayer[]; // with final scores computed
  winners: EndgamePlayer[]; // all players with top score (tie support)
  primaryWinner: EndgamePlayer; // first among winners (for simple display)
}

// ─── Detection: should the game end? ─────────────────────

export interface EndgameCheckInput {
  tileBagCount: number;
  players: Array<{ rack: Tile[] }>;
  consecutivePasses: number;
  /** Use connectedPlayers * 2 as the pass threshold. */
  connectedPlayerCount: number;
  totalPlayerCount: number;
}

/**
 * Returns the reason the game should end, or null if it should continue.
 * Call this AFTER applying any move (place / pass / exchange).
 */
export function checkGameEnd(input: EndgameCheckInput): GameEndReason | null {
  const {
    tileBagCount,
    players,
    consecutivePasses,
    connectedPlayerCount,
    totalPlayerCount,
  } = input;

  // Case A: bag empty AND at least one player emptied their hand
  const bagEmpty = tileBagCount === 0;
  const anyoneEmptiedHand = players.some((p) => p.rack.length === 0);
  if (bagEmpty && anyoneEmptiedHand) return "EMPTY_HAND";

  // Edge case of Case A: all players emptied hands (shouldn't happen in
  // turn-based but guard anyway)
  const allEmptied = players.every((p) => p.rack.length === 0);
  if (allEmptied) return "EMPTY_HAND";

  // Case B / C: consecutive-pass threshold
  // Threshold = max(connectedPlayers * 2, totalPlayers * 2)
  // Using total prevents the edge-case where 1 connected player passes
  // twice and immediately ends the game.
  const passThreshold = Math.max(
    connectedPlayerCount * 2,
    totalPlayerCount * 2,
  );
  if (consecutivePasses >= passThreshold) return "ALL_PASS";

  return null;
}

// ─── Finalisation: compute final scores ───────────────────

/**
 * Compute final scores according to official A-Math scoring rules:
 *
 *  1. Each player LOSES points equal to the sum of tiles remaining in
 *     their rack.
 *  2. If exactly one player emptied their rack (EMPTY_HAND only), that
 *     player GAINS the sum of all other players' rack penalties as a
 *     bonus.
 *  3. Highest adjusted score wins.  Ties are honoured.
 *
 * This function is PURE — it clones players and never mutates originals.
 */
export function finaliseGame(
  players: EndgamePlayer[],
  reason: GameEndReason,
): EndgameResult {
  // Deep-clone so we don't mutate caller's state
  const finalPlayers: EndgamePlayer[] = players.map((p) => ({
    ...p,
    rack: [...p.rack],
    rackPenalty: 0,
    emptyHandBonus: 0,
    finalScore: p.score,
  }));

  // Step 1: deduct rack penalties
  for (const p of finalPlayers) {
    const penalty = p.rack.reduce((sum, t) => sum + (t.points || 0), 0);
    p.rackPenalty = penalty;
    p.finalScore = (p.finalScore ?? p.score) - penalty;
  }

  // Step 2: empty-hand bonus (Case A only)
  if (reason === "EMPTY_HAND") {
    const emptyHandPlayers = finalPlayers.filter((p) => p.rack.length === 0);
    if (emptyHandPlayers.length === 1) {
      const finisher = emptyHandPlayers[0];
      const bonus = finalPlayers
        .filter((p) => p.id !== finisher.id)
        .reduce((sum, p) => sum + (p.rackPenalty ?? 0), 0);
      finisher.emptyHandBonus = bonus;
      finisher.finalScore = (finisher.finalScore ?? 0) + bonus;
    }
    // If multiple players have empty hands (edge case): no bonus awarded
    // to anyone — this would only happen if two players played last tile
    // simultaneously (impossible in turn-based, but safe to ignore)
  }

  // Step 3: determine winner(s)
  const maxScore = Math.max(...finalPlayers.map((p) => p.finalScore ?? 0));
  const winners = finalPlayers.filter((p) => (p.finalScore ?? 0) === maxScore);
  const primaryWinner = winners[0]; // stable sort: first in array

  return {
    reason,
    players: finalPlayers,
    winners,
    primaryWinner,
  };
}

// ─── Convenience: consecutivePasses counter update ────────

export type MoveType = "place" | "pass" | "exchange" | "timeout" | "disconnect";

/**
 * Returns the updated consecutivePasses counter after a move.
 *  - "place" (successful tile placement) → resets to 0
 *  - everything else → increments by 1
 */
export function updateConsecutivePasses(
  current: number,
  moveType: MoveType,
): number {
  return moveType === "place" ? 0 : current + 1;
}
