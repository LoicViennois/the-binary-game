import { expect, test } from '@playwright/test';

import { clearStorage } from './helpers/players.helper';
import { AboutModalPage } from './pages/about-modal.page';
import { HomePage } from './pages/home.page';

test.describe('Navigation & Modals', () => {
  let home: HomePage;
  let aboutModal: AboutModalPage;

  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    home = new HomePage(page);
    aboutModal = new AboutModalPage(page);
    await home.goto();
  });

  test('redirects legacy and unknown routes to home', async ({ page }) => {
    for (const path of ['/login', '/home', '/non-existent-route']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
    }
  });

  test('sends a game link opened without a name to the name picker, then starts that game', async ({
    page,
  }) => {
    await page.goto('/play/4');
    await expect(page).toHaveURL(/\/\?next=4$/);

    await home.pickNewName('Newbie');
    await expect(page).toHaveURL(/\/play\/4$/);
  });

  test('contains valid external GitHub repository link', async () => {
    await expect(home.githubLink).toBeVisible();
    await expect(home.githubLink).toHaveAttribute(
      'href',
      'https://github.com/LoicViennois/the-binary-game',
    );
    await expect(home.githubLink).toHaveAttribute('target', '_blank');
  });

  test('contains valid build-info link in bottom left corner with short sha', async () => {
    await expect(home.buildInfo).toBeVisible();
    await expect(home.buildInfoLink).toHaveText(/^[0-9a-f]{7}$/i);
    await expect(home.buildInfoLink).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/LoicViennois\/the-binary-game\/commit\/[0-9a-f]{40}$/i,
    );
    await expect(home.buildInfoLink).toHaveAttribute('target', '_blank');

    const shortSha = (await home.buildInfoLink.innerText()).trim();
    const href = await home.buildInfoLink.getAttribute('href');
    expect(href).toContain(shortSha);
  });

  test('opens and closes the About modal dialog', async () => {
    await home.aboutButton.click();
    await aboutModal.waitForOpen();

    await expect(aboutModal.commitLink).toHaveText(/^[0-9a-f]{7}$/i);
    await expect(aboutModal.licenseLink).toBeVisible();
    await expect(aboutModal.githubIssuesLink).toBeVisible();
    await expect(aboutModal.redditFeedbackLink).toBeVisible();
    await expect(aboutModal.sponsorLink).toHaveAttribute(
      'href',
      'https://github.com/sponsors/LoicViennois',
    );

    await aboutModal.close();
  });

  test('defaults to the dark theme even when the system prefers light', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('switches to the light theme and remembers the choice', async ({
    page,
  }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
