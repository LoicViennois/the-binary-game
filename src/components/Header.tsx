import { Link } from '@tanstack/react-router';
import { Info, Trophy } from 'lucide-react';
import { useState } from 'react';

import { repoUrl } from '../lib/build-info';
import { useCurrentPlayer } from '../lib/players';
import { AboutDialog } from './AboutDialog';
import { GitHubIcon } from './GitHubIcon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const SHORT_NAME_LENGTH = 8;

const iconButton =
  'grid size-9 cursor-pointer place-items-center rounded-full text-ink-soft transition hover:bg-tint hover:text-ink active:scale-90';

export function Header() {
  const player = useCurrentPlayer();
  const [aboutOpen, setAboutOpen] = useState(false);

  const name = player?.name ?? '';
  const shortName =
    name.length > SHORT_NAME_LENGTH
      ? `${name.slice(0, SHORT_NAME_LENGTH - 1)}…`
      : name;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-2 bg-bg/80 px-3 backdrop-blur-md lg:h-16 lg:px-6">
      <Link
        to="/"
        className="flex items-center gap-2.5 rounded-lg"
        aria-label="The Binary Game, home"
      >
        <Logo />
        <h1 className="hidden text-lg font-bold tracking-tight whitespace-nowrap sm:block lg:text-xl">
          The Binary Game
        </h1>
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          to="/scores"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-tint hover:text-ink [&.active]:bg-tint [&.active]:text-ink"
        >
          <Trophy className="size-4" aria-hidden />
          High scores
        </Link>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener"
          aria-label="GitHub repository"
          className={`${iconButton} max-sm:hidden`}
        >
          <GitHubIcon className="size-5" />
        </a>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-label="About"
          className={iconButton}
        >
          <Info className="size-5" aria-hidden />
        </button>
        <ThemeToggle />
        {player ? (
          <Link
            to="/"
            title="Switch player"
            data-testid="current-player"
            className="ml-1 flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-semibold transition hover:bg-tint"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-lamp text-xs text-lamp-ink"
            >
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden lg:inline">{name}</span>
            <span className="lg:hidden">{shortName}</span>
          </Link>
        ) : null}
      </nav>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}
