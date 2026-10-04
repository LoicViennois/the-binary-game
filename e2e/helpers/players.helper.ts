import type { Page } from '@playwright/test';

interface SeedScore {
  name: string;
  game: number;
  time: number;
}

/** Starts the page with the given names known on the device, the first one picked. Reloads keep test changes. */
export async function seedPlayers(page: Page, names: string[], scores: SeedScore[] = []): Promise<void> {
  await page.addInitScript(
    ({ names, scores }) => {
      if (sessionStorage.getItem('e2e-seeded')) {
        return;
      }
      sessionStorage.setItem('e2e-seeded', '1');
      const players = names.map((name) => ({ uid: name.toLowerCase(), name }));
      localStorage.setItem('tb_players', JSON.stringify(players));
      if (players[0]) {
        localStorage.setItem('tb_user', JSON.stringify(players[0]));
      }
      localStorage.setItem(
        'tb_high_scores',
        JSON.stringify(
          scores.map((s, i) => ({ id: `seed-${i}`, game: s.game, time: s.time, user: { uid: s.name.toLowerCase(), name: s.name } })),
        ),
      );
    },
    { names, scores },
  );
}

/** Only runs once: later reloads keep whatever the test changed. */
export async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-cleared')) {
      localStorage.clear();
      sessionStorage.setItem('e2e-cleared', '1');
    }
  });
}
