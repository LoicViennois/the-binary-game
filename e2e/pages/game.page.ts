import { expect, type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly timer: Locator;
  readonly stopButton: Locator;
  readonly homeButton: Locator;
  readonly restartButton: Locator;
  readonly successOverlay: Locator;
  readonly failureOverlay: Locator;
  readonly highScoresToggle: Locator;
  readonly highScoresPanel: Locator;
  readonly highScoresTableRows: Locator;
  readonly gridTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timer = page.getByTestId('timer').locator('visible=true');
    this.stopButton = page.getByRole('button', { name: 'Stop' });
    this.homeButton = page.getByRole('button', { name: 'Home' });
    this.restartButton = page.getByRole('button', { name: 'Restart' });
    this.successOverlay = page.locator('[data-testid="result-overlay"][data-result="success"]');
    this.failureOverlay = page.locator('[data-testid="result-overlay"][data-result="failure"]');
    this.highScoresToggle = page.getByTestId('high-scores-toggle');
    this.highScoresPanel = page.getByTestId('high-scores-panel');
    this.highScoresTableRows = this.highScoresPanel.getByTestId('high-scores').locator('tbody tr');
    this.gridTable = page.getByTestId('grid');
  }

  async goto(size: number): Promise<void> {
    await this.page.goto(`/play/${size}`);
    await expect(this.page).toHaveURL(new RegExp(`/play/${size}$`));
  }

  getBox(row: number, col: number): Locator {
    return this.gridTable.locator('tr').nth(row).getByRole('button').nth(col);
  }

  async getBoxValue(row: number, col: number): Promise<string> {
    const text = await this.getBox(row, col).innerText();
    return text.trim();
  }

  async clickBox(row: number, col: number): Promise<void> {
    await this.getBox(row, col).click();
  }

  private rowTarget(row: number): Locator {
    return this.gridTable.getByTestId('row-target').nth(row);
  }

  private colTarget(col: number): Locator {
    return this.gridTable.getByTestId('col-target').nth(col);
  }

  async getRowTarget(row: number): Promise<number> {
    const text = await this.rowTarget(row).innerText();
    return parseInt(text.trim(), 10);
  }

  async isRowValid(row: number): Promise<boolean> {
    return (await this.rowTarget(row).getAttribute('data-valid')) === 'true';
  }

  async isColValid(col: number): Promise<boolean> {
    return (await this.colTarget(col).getAttribute('data-valid')) === 'true';
  }

  async toggleHighScores(): Promise<void> {
    await this.highScoresToggle.click();
  }

  async openHighScoresIfMobile(): Promise<void> {
    if (await this.highScoresToggle.isVisible()) {
      await this.highScoresToggle.click();
    }
  }

  async stopGame(): Promise<void> {
    await this.stopButton.click();
    await expect(this.failureOverlay).toBeVisible();
    await expect(this.restartButton).toBeVisible();
    await expect(this.homeButton).toBeVisible();
  }

  async restartGame(): Promise<void> {
    await this.restartButton.click();
    await expect(this.failureOverlay).toBeHidden();
    await expect(this.stopButton).toBeVisible();
  }

  async returnHome(): Promise<void> {
    await this.homeButton.click();
    await expect(this.page).toHaveURL(/\/$/);
  }

  /**
   * Solves the binary puzzle by reading each row target,
   * converting it to binary, and clicking any boxes that must be 1.
   */
  async solve(size: number): Promise<void> {
    for (let r = 0; r < size; r++) {
      const target = await this.getRowTarget(r);
      const binaryStr = target.toString(2).padStart(size, '0');
      for (let c = 0; c < size; c++) {
        const currentValue = await this.getBoxValue(r, c);
        if (binaryStr[c] !== currentValue) {
          await this.clickBox(r, c);
        }
      }
    }
  }
}
