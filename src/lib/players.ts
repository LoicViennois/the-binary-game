import { getAllScores, removeScoresOf } from './high-scores';
import { createStore } from './store';
import { readJson, removeItem, writeJson } from './storage';

/** A name someone plays under on this device; scores are saved against it. */
export interface Player {
  uid: string;
  name: string;
}

const PLAYERS_KEY = 'tb_players';
const CURRENT_KEY = 'tb_user';

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 12;
const NAME_PATTERN = /^[a-zA-Z0-9À-ÖØ-öø-ÿ]*$/;

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= NAME_MIN_LENGTH && trimmed.length <= NAME_MAX_LENGTH && NAME_PATTERN.test(trimmed);
}

function toUid(name: string): string {
  return name.trim().toLowerCase();
}

function loadCurrent(): Player | null {
  const stored = readJson<Player>(CURRENT_KEY);
  return stored?.name ? stored : null;
}

/** Known players; before this list existed, they are recovered from the current player and saved scores. */
function loadPlayers(current: Player | null): Player[] {
  const stored = readJson<Player[]>(PLAYERS_KEY);
  if (stored) {
    return stored;
  }
  const byUid = new Map<string, Player>();
  if (current) {
    byUid.set(current.uid, current);
  }
  for (const { user } of getAllScores()) {
    if (!byUid.has(user.uid)) {
      byUid.set(user.uid, { uid: user.uid, name: user.name });
    }
  }
  return [...byUid.values()];
}

const initialCurrent = loadCurrent();
const players = createStore<Player[]>(loadPlayers(initialCurrent));
const current = createStore<Player | null>(initialCurrent);

function savePlayers(next: Player[]): void {
  writeJson(PLAYERS_KEY, next);
  players.set(next);
}

function saveCurrent(player: Player | null): void {
  if (player) {
    writeJson(CURRENT_KEY, player);
  } else {
    removeItem(CURRENT_KEY);
  }
  current.set(player);
}

export const usePlayers = players.use;
export const useCurrentPlayer = current.use;

export function getCurrentPlayer(): Player | null {
  return current.get();
}

export function selectPlayer(uid: string): void {
  const player = players.get().find((p) => p.uid === uid);
  if (player) {
    saveCurrent(player);
  }
}

/** Picks a name, reusing the existing player when the name is already known on this device. */
export function pickName(name: string): Player {
  const uid = toUid(name);
  const existing = players.get().find((p) => p.uid === uid);
  const player = existing ?? { uid, name: name.trim() };
  if (!existing) {
    savePlayers([...players.get(), player]);
  }
  saveCurrent(player);
  return player;
}

/** Forgets a player and deletes their scores from this device. */
export function removePlayer(uid: string): void {
  savePlayers(players.get().filter((p) => p.uid !== uid));
  removeScoresOf(uid);
  if (current.get()?.uid === uid) {
    saveCurrent(null);
  }
}
