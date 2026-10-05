import { expect, test } from '@playwright/test';

import { clearStorage, seedPlayers } from './helpers/players.helper';
import { HomePage } from './pages/home.page';
import { ScoresPage } from './pages/scores.page';

test.describe('Players', () => {
  test.describe('first visit', () => {
    let home: HomePage;

    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      home = new HomePage(page);
      await home.goto();
    });

    test('asks for a name before showing the grids', async () => {
      await expect(home.nameInput).toBeVisible();
      await expect(home.gameLink(3)).toBeHidden();
      await expect(home.currentPlayer).toBeHidden();
    });

    test('rejects invalid names', async () => {
      await expect(home.playButton).toBeDisabled();

      await home.nameInput.fill('ab');
      await expect(home.playButton).toBeDisabled();
      await home.nameInput.blur();
      await expect(home.nameInput).toHaveAttribute('aria-invalid', 'true');

      await home.nameInput.fill('thisnameiswaytoolong');
      await expect(home.playButton).toBeDisabled();

      await home.nameInput.fill('user@test');
      await expect(home.playButton).toBeDisabled();
    });

    test('picking a name shows the grids and the name in the header', async () => {
      await home.pickNewName('Tester');

      await expect(home.currentPlayer).toHaveAccessibleName(/Tester/);
      await expect(home.player('Tester')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(home.gameLink(3)).toBeVisible();
    });
  });

  test.describe('returning players', () => {
    let home: HomePage;

    test.beforeEach(async ({ page }) => {
      await seedPlayers(
        page,
        ['Alice', 'Bob'],
        [
          { name: 'Alice', game: 3, time: 5000 },
          { name: 'Bob', game: 3, time: 7000 },
        ],
      );
      home = new HomePage(page);
      await home.goto();
    });

    test('lists every name used on the device and switches between them', async () => {
      await expect(home.player('Alice')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(home.player('Bob')).toHaveAttribute('aria-pressed', 'false');

      await home.player('Bob').click();
      await expect(home.player('Bob')).toHaveAttribute('aria-pressed', 'true');
      await expect(home.currentPlayer).toHaveAccessibleName(/Bob/);
    });

    test('remembers names after reload and reuses an existing name instead of duplicating it', async ({
      page,
    }) => {
      await home.pickNewName('Carol');
      await page.reload();
      await expect(home.player('Carol')).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await home.pickNewName('alice');
      await expect(home.player('Alice')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(
        home.players.getByRole('button', { name: /alice/i }),
      ).toHaveCount(1);
    });

    test('removes a player and their scores from the device', async ({
      page,
    }) => {
      await home.removePlayer('Bob');

      await expect(
        home.players.getByRole('button', { name: /Bob/ }),
      ).toHaveCount(0);
      await expect(home.player('Alice')).toBeVisible();

      const scores = new ScoresPage(page);
      await scores.goto(3);
      await expect(scores.rows).toHaveCount(1);
      await expect(scores.rows.first()).toContainText('Alice');
    });

    test('removing the current player asks to pick another before playing', async () => {
      await home.removePlayer('Alice');

      await expect(home.currentPlayer).toBeHidden();
      await expect(home.gameLink(3)).toBeHidden();

      await home.player('Bob').click();
      await expect(home.gameLink(3)).toBeVisible();
    });
  });

  test('recovers names saved by earlier versions from the last player and saved scores', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('e2e-legacy')) {
        return;
      }
      sessionStorage.setItem('e2e-legacy', '1');
      localStorage.clear();
      localStorage.setItem(
        'tb_user',
        JSON.stringify({ uid: 'zoe', name: 'Zoe' }),
      );
      localStorage.setItem(
        'tb_high_scores',
        JSON.stringify([
          {
            id: 'old-1',
            game: 3,
            time: 8000,
            user: { uid: 'max', name: 'Max' },
          },
        ]),
      );
    });
    const home = new HomePage(page);
    await home.goto();

    await expect(home.player('Zoe')).toHaveAttribute('aria-pressed', 'true');
    await expect(home.player('Max')).toHaveAttribute('aria-pressed', 'false');
  });
});
