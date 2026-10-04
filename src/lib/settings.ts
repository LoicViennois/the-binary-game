import { createStore } from './store';
import { readJson, writeJson } from './storage';

export interface Settings {
  /** Shows each bit's place value along the edges of the grid. */
  valueHints: boolean;
}

const STORAGE_KEY = 'tb_settings';
const DEFAULTS: Settings = { valueHints: true };

const settings = createStore<Settings>({
  ...DEFAULTS,
  ...readJson<Partial<Settings>>(STORAGE_KEY),
});

export const useSettings = settings.use;

export function updateSettings(changes: Partial<Settings>): void {
  const next = { ...settings.get(), ...changes };
  writeJson(STORAGE_KEY, next);
  settings.set(next);
}
