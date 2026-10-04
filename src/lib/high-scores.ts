import { createStore } from './store';
import { readJson, writeJson } from './storage';

export interface ScoreOwner {
  uid: string;
  name: string;
}

export interface HighScore {
  id: string;
  game: number;
  user: ScoreOwner;
  time: number;
}

export interface Ranking {
  user: ScoreOwner;
  /** Best time in milliseconds. */
  best: number;
  solves: number;
}

const STORAGE_KEY = 'tb_high_scores';

const scores = createStore<HighScore[]>(
  readJson<HighScore[]>(STORAGE_KEY) ?? [],
);

function save(next: HighScore[]): void {
  writeJson(STORAGE_KEY, next);
  scores.set(next);
}

export const useAllScores = scores.use;

export function getAllScores(): HighScore[] {
  return scores.get();
}

/** Each player's best time on the given grid, fastest first. */
export function rankPlayers(all: HighScore[], game: number): Ranking[] {
  const byPlayer = new Map<string, Ranking>();
  for (const score of all) {
    if (score.game !== game) {
      continue;
    }
    const entry = byPlayer.get(score.user.uid);
    if (entry) {
      entry.solves += 1;
      entry.best = Math.min(entry.best, score.time);
    } else {
      byPlayer.set(score.user.uid, {
        user: score.user,
        best: score.time,
        solves: 1,
      });
    }
  }
  return [...byPlayer.values()].sort((a, b) => a.best - b.best);
}

export function getPersonalBest(game: number, uid: string): number | undefined {
  return rankPlayers(scores.get(), game).find((r) => r.user.uid === uid)?.best;
}

export function addHighScore(
  game: number,
  user: ScoreOwner,
  time: number,
): void {
  const score: HighScore = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    game,
    user: { uid: user.uid, name: user.name },
    time,
  };
  save([...scores.get(), score]);
}

export function countScores(uid: string): number {
  return scores.get().filter((s) => s.user.uid === uid).length;
}

export function removeScoresOf(uid: string): void {
  save(scores.get().filter((s) => s.user.uid !== uid));
}
