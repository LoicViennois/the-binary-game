import { expect, type Locator, type Page } from '@playwright/test';

export class AboutModalPage {
  readonly page: Page;
  readonly modal: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly commitLink: Locator;
  readonly licenseLink: Locator;
  readonly githubIssuesLink: Locator;
  readonly redditFeedbackLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByRole('dialog');
    this.title = this.modal.getByRole('heading', { level: 2 });
    this.closeButton = this.modal.getByRole('button', { name: 'Close' });
    this.commitLink = this.modal.getByTestId('commit-link');
    this.licenseLink = this.modal.locator(
      'a[href*="github.com/LoicViennois/the-binary-game/blob/main/LICENSE"]',
    );
    this.githubIssuesLink = this.modal.locator(
      'a[href*="github.com/LoicViennois/the-binary-game/issues"]',
    );
    this.redditFeedbackLink = this.modal.locator(
      'a[href*="reddit.com/message"]',
    );
  }

  async waitForOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
    await expect(this.title).toHaveText('Licence notice');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.modal).toBeHidden();
  }
}
