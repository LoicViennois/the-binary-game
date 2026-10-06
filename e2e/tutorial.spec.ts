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

  test('counts in binary on a single row, from 1 bit up to 5', async ({
    page,
  }) => {
    await clearStorage(page);
    await page.goto('/tutorial?step=2');

    const row = page.getByRole('region', { name: 'Try it' });
    const target = row.getByTestId('row-target');
    await expect(row.getByRole('button', { name: /^Bit worth/ })).toHaveCount(
      2,
    );
    await expect(target).toHaveText(/1$/);

    await row.getByRole('button', { name: 'Bit worth 1: off' }).click();
    await expect(target).toHaveAttribute('data-valid', 'true');
    await expect(row).toContainText('Sum: 1');
    await row.getByRole('button', { name: 'Next: make 2' }).click();
    await expect(
      row.getByRole('button', { name: 'Bit worth 2: off' }),
    ).toBeFocused();

    await row.getByRole('button', { name: 'Bit worth 1: on' }).click();
    await row.getByRole('button', { name: 'Bit worth 2: off' }).click();
    await row.getByRole('button', { name: 'Next: make 3' }).click();
    await row.getByRole('button', { name: 'Bit worth 1: off' }).click();
    await expect(row).toContainText('Sum: 2 + 1 = 3');
    await expect(row).toContainText('You counted to 3 in binary!');

    await page.goto('/tutorial?step=5');
    await expect(row.getByRole('button', { name: /^Bit worth/ })).toHaveCount(
      5,
    );
  });

  test('moves on to the game: a 2x2 then a 3x3 grid, without a timer', async ({
    page,
  }) => {
    await clearStorage(page);
    const game = new GamePage(page);
    await page.goto('/tutorial?step=5');

    await page.getByRole('link', { name: 'Next: play the game' }).click();
    await expect(page).toHaveURL(/\/tutorial\?step=6$/);
    await expect(page.getByRole('heading', { level: 2 })).toBeFocused();
    await expect(game.gridTable.getByRole('button')).toHaveCount(4);
    await expect(game.timer).toHaveCount(0);
    await game.solve(2);
    await expect(game.successOverlay).toBeVisible();
    await page.getByRole('link', { name: 'Next' }).click();

    await expect(page).toHaveURL(/\/tutorial\?step=7$/);
    await expect(game.gridTable.getByRole('button')).toHaveCount(9);
    await game.solve(3);
    await expect(game.successOverlay).toBeVisible();

    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/tutorial\?step=6$/);
  });

  test('jumps straight to a part', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/tutorial');

    await expect(page.getByRole('heading', { level: 2 })).toContainText(
      'One bit',
    );
    await page.getByRole('link', { name: 'Part 2: Play the game' }).click();
    await expect(page).toHaveURL(/\/tutorial\?step=6$/);
    await page.getByRole('link', { name: 'Part 1: Count in binary' }).click();
    await expect(page).toHaveURL(/\/tutorial$/);
  });

  test('ends on the first game, asking for a name if needed', async ({
    page,
  }) => {
    await clearStorage(page);
    await page.goto('/tutorial?step=7');

    await page.getByRole('link', { name: 'Play 3 x 3' }).click();
    await expect(page).toHaveURL(/\/\?next=3$/);
  });
});
