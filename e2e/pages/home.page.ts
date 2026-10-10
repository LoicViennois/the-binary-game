import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly playButton: Locator;
  readonly newNameButton: Locator;
  readonly editPlayersButton: Locator;
  readonly players: Locator;
  readonly currentPlayer: Locator;
  readonly githubLink: Locator;
  readonly aboutButton: Locator;
  readonly highScoresLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#player-name');
    this.playButton = page.getByRole('button', { name: 'Play', exact: true });
    this.newNameButton = page.getByRole('button', { name: 'New name' });
    this.editPlayersButton = page.getByRole('button', {
      name: /Edit players|Done/,
    });
    this.players = page.getByRole('list', { name: 'Players on this device' });
    this.currentPlayer = page.getByTestId('current-player');
    this.githubLink = page
      .getByRole('banner')
      .getByRole('link', { name: 'GitHub repository' });
    this.aboutButton = page
      .getByRole('banner')
      .getByRole('button', { name: 'About' });
    this.highScoresLink = page
      .getByRole('banner')
      .getByRole('link', { name: 'High scores' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle('The Binary Game');
  }

  player(name: string): Locator {
    return this.players.getByRole('button', { name, exact: true });
  }

  gameLink(size: number): Locator {
    return this.page.getByRole('link', { name: `${size} x ${size}` });
  }

  async pickNewName(name: string): Promise<void> {
    await expect(this.nameInput.or(this.newNameButton)).toBeVisible();
    if (!(await this.nameInput.isVisible())) {
      await this.newNameButton.click();
    }
    await this.nameInput.fill(name);
    await this.playButton.click();
  }

  async removePlayer(name: string): Promise<void> {
    await this.editPlayersButton.click();
    await this.players.getByRole('button', { name: `Remove ${name}` }).click();
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Remove player' })
      .click();
    await expect(this.page.getByRole('dialog')).toBeHidden();
    await this.editPlayersButton.click();
  }

  async selectSize(size: number): Promise<void> {
    await this.gameLink(size).click();
    await expect(this.page).toHaveURL(new RegExp(`/play/${size}$`));
  }
}
