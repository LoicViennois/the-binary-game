import { expect, test } from '@playwright/test';

import { seedPlayers } from './helpers/players.helper';
import { ScoresPage } from './pages/scores.page';

test.describe('High scores page', () => {
  let scores: ScoresPage;

  test.beforeEach(async ({ page }) => {
    await seedPlayers(
      page,
      ['Alice', 'Bob'],
      [
        { name: 'Alice', game: 3, time: 9000 },
        { name: 'Alice', game: 3, time: 4000 },
        { name: 'Bob', game: 3, time: 6000 },
        { name: 'Bob', game: 4, time: 20000 },
      ],
    );
    scores = new ScoresPage(page);
  });

  test('ranks each player by best time with their number of solves', async () => {
    await scores.goto(3);

    await expect(scores.rows).toHaveCount(2);
    await expect(scores.rows.nth(0)).toContainText('Alice');
    await expect(scores.rows.nth(0)).toContainText('00:04:00');
    await expect(scores.rows.nth(0)).toContainText('2');
    await expect(scores.rows.nth(1)).toContainText('Bob');
  });

  test('switches grid size', async ({ page }) => {
    await scores.goto(3);
    await scores.sizeTab(4).click();

    await expect(page).toHaveURL(/size=4/);
    await expect(scores.rows).toHaveCount(1);
    await expect(scores.rows.first()).toContainText('Bob');

    await scores.sizeTab(5).click();
    await expect(
      page.getByText('Nobody has solved the 5 x 5 grid'),
    ).toBeVisible();
  });

  test('tells small screens that the largest grids are desktop only', async ({
    page,
  }) => {
    const hint = page.getByText('The 9 x 9 grid is only available on desktop');
    const playLink = page.getByRole('link', { name: 'Play 9 x 9' });

    await scores.goto(9);
    await expect(playLink).toBeVisible();
    await expect(hint).toBeHidden();

    await page.setViewportSize({ width: 600, height: 800 });
    await expect(hint).toBeVisible();
    await expect(playLink).toBeHidden();
  });

  test('goes back to the previous page, skipping grid size switches', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'High scores' })
      .click();
    await scores.sizeTab(4).click();
    await expect(page).toHaveURL(/size=4/);

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('goes home when opened directly', async ({ page }) => {
    await scores.goto(3);

    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('is reachable from the header', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'High scores' })
      .click();
    await expect(page).toHaveURL(/\/scores/);
  });
});
