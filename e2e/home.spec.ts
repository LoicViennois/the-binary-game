import { expect, test } from '@playwright/test';

import { seedPlayers } from './helpers/players.helper';
import { HomePage } from './pages/home.page';

test.describe('Home - grid selection', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    await seedPlayers(page, ['Player']);
    home = new HomePage(page);
    await home.goto();
  });

  test('displays available grid sizes and navigates to the selected game', async () => {
    for (const size of [3, 4, 5, 6, 7, 8]) {
      await expect(home.gameLink(size)).toBeVisible();
    }

    await home.selectSize(3);
    await home.goto();
    await home.selectSize(4);
  });

  test('offers the largest grid sizes on tablet and desktop only', async ({
    page,
  }) => {
    for (const size of [9, 10, 11]) {
      await expect(home.gameLink(size)).toBeVisible();
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    for (const size of [9, 10, 11]) {
      await expect(home.gameLink(size)).toBeVisible();
    }

    await page.setViewportSize({ width: 600, height: 800 });
    await expect(home.gameLink(8)).toBeVisible();
    for (const size of [9, 10, 11]) {
      await expect(home.gameLink(size)).toBeHidden();
    }
  });
});
