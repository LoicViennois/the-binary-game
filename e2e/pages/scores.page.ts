import { expect, type Locator, type Page } from '@playwright/test';

export class ScoresPage {
  readonly page: Page;
  readonly rows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.getByTestId('high-scores').locator('tbody tr');
  }

  async goto(size?: number): Promise<void> {
    await this.page.goto(size ? `/scores?size=${size}` : '/scores');
    await expect(
      this.page.getByRole('heading', { name: 'High scores' }),
    ).toBeVisible();
  }

  sizeTab(size: number): Locator {
    return this.page
      .getByRole('navigation', { name: 'Grid size' })
      .getByRole('link', { name: `${size} x ${size}` });
  }
}
