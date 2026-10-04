import { expect, type Page, test } from '@playwright/test';

import { clearStorage, seedPlayers } from './helpers/players.helper';
import { GamePage } from './pages/game.page';
import { HomePage } from './pages/home.page';

const tutorialLink = (page: Page) =>
  page.getByRole('link', { name: /tutorial/i });

test.describe('Tutorial', () => {
  test('is linked next to the demo for newcomers', async ({ page }) => {
    await clearStorage(page);
    const home = new HomePage(page);
    await home.goto();

    await expect(page.getByRole('region', { name: 'Try it' })).toBeVisible();
    await tutorialLink(page).click();
    await expect(page).toHaveURL(/\/tutorial$/);
  });

  test('stays reachable from home once a name is picked', async ({ page }) => {
    await seedPlayers(page, ['Learner']);
    const home = new HomePage(page);
    await home.goto();

    await tutorialLink(page).click();
    await expect(page).toHaveURL(/\/tutorial$/);
  });

  test('walks from one row to a 2x2 then a 3x3 grid, without a timer', async ({
    page,
  }) => {
    await clearStorage(page);
    const game = new GamePage(page);
    await page.goto('/tutorial');

    await expect(page.getByRole('heading', { level: 2 })).toContainText(
      'Read a binary number',
    );
    await expect(page.getByRole('region', { name: 'Try it' })).toBeVisible();
    await page.getByRole('link', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/tutorial\?step=2$/);
    await expect(page.getByRole('heading', { level: 2 })).toBeFocused();
    await expect(game.gridTable.getByRole('button')).toHaveCount(4);
    await expect(game.timer).toHaveCount(0);
    await game.solve(2);
    await expect(game.successOverlay).toBeVisible();
    await page.getByRole('link', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/tutorial\?step=3$/);
    await expect(game.gridTable.getByRole('button')).toHaveCount(9);
    await game.solve(3);
    await expect(game.successOverlay).toBeVisible();

    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/tutorial\?step=2$/);
  });

  test('ends on the first game, asking for a name if needed', async ({
    page,
  }) => {
    await clearStorage(page);
    await page.goto('/tutorial?step=3');

    await page.getByRole('link', { name: 'Play 3 x 3' }).click();
    await expect(page).toHaveURL(/\/\?next=3$/);
  });
});
