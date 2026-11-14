import { Link } from '@tanstack/react-router';
import { Info, Trophy } from 'lucide-react';
import { useState } from 'react';

import { repoUrl } from '../lib/build-info';
import { AboutDialog } from './AboutDialog';
import { GitHubIcon } from './GitHubIcon';
import { HomeLink } from './HomeLink';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const iconButton =
  'grid size-8 sm:size-9 cursor-pointer place-items-center rounded-full text-ink-soft transition hover:bg-tint hover:text-ink active:scale-90';

export function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 lg:h-16 lg:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label="The Binary Game, home"
        >
          <Logo />
          <h1 className="hidden text-lg font-bold tracking-tight whitespace-nowrap sm:block lg:text-xl">
            The Binary Game
          </h1>
        </Link>
        <nav className="flex items-center sm:gap-1">
          <Link
            to="/scores"
            className="flex items-center gap-1 rounded-full px-1.5 py-1.5 text-sm whitespace-nowrap sm:gap-1.5 sm:px-3 font-semibold text-ink-soft transition hover:bg-tint hover:text-ink [&.active]:bg-tint [&.active]:text-ink"
          >
            <Trophy className="size-4" aria-hidden />
            High scores
          </Link>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener"
            aria-label="GitHub repository"
            className={iconButton}
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
          <HomeLink className={iconButton} />
        </nav>
      </div>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}
