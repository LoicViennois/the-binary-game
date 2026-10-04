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
});
