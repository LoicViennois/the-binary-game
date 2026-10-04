import { createStore } from './store';
import { readJson, writeJson } from './storage';

export type Theme = 'light' | 'dark';

// Keep in sync with the pre-paint script in index.html.
const STORAGE_KEY = 'tb_theme';
const THEME_COLORS: Record<Theme, string> = { light: '#f1f3f7', dark: '#11141b' };

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

function systemTheme(): Theme {
  return systemQuery.matches ? 'dark' : 'light';
}

function storedTheme(): Theme | null {
  const stored = readJson<Theme>(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

const theme = createStore<Theme>(storedTheme() ?? systemTheme());

function apply(next: Theme): void {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next]);
  theme.set(next);
}

// Follow the system until the player picks a theme.
systemQuery.addEventListener('change', () => {
  if (!storedTheme()) {
    apply(systemTheme());
  }
});

apply(theme.get());

export const useTheme = theme.use;

export function toggleTheme(): void {
  const next: Theme = theme.get() === 'dark' ? 'light' : 'dark';
  writeJson(STORAGE_KEY, next);
  apply(next);
}
