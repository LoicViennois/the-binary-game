import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { GraduationCap } from 'lucide-react';
import { useMemo } from 'react';

import { BitDemo } from '../components/BitDemo';
import { PlayerPicker } from '../components/PlayerPicker';
import { SizeCard } from '../components/SizeCard';
import { GRID_SIZES, isValidSize, SMALL_SCREEN_MAX_SIZE } from '../game/puzzle';
import { rankPlayers, useAllScores } from '../lib/high-scores';
import { useCurrentPlayer, usePlayers } from '../lib/players';

interface HomeSearch {
  /** Grid size to start once a name is picked (set when a game link was opened without one). */
  next?: number;
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const next = Number(search.next);
    return isValidSize(next) ? { next } : {};
  },
  component: HomePage,
});

function HomePage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const players = usePlayers();
  const current = useCurrentPlayer();
  const scores = useAllScores();

  const bests = useMemo(() => {
    const uid = current?.uid;
    return new Map(
      GRID_SIZES.map((size) => [
        size,
        rankPlayers(scores, size).find((r) => r.user.uid === uid)?.best,
      ]),
    );
  }, [scores, current?.uid]);

  const resumeGame = () => {
    if (next !== undefined) {
      void navigate({ to: '/play/$size', params: { size: next } });
    }
  };

  const newcomer = players.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-16 lg:pt-10">
      {newcomer ? (
        <div className="mx-auto max-w-md">
          <h2 className="mb-2 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance lg:text-5xl">
            Flip the bits.
            <br />
            Hit the numbers.
          </h2>
          <p className="mb-6 text-ink-soft">
            Every row and column of the grid is a binary number. Make them all
            match their targets, as fast as you can.
          </p>
          <BitDemo />
          <p className="mt-3 text-center text-sm">
            <TutorialLink>Learn step by step in the full tutorial</TutorialLink>
          </p>
          <div className="mt-8">
            <PlayerPicker onPicked={resumeGame} />
          </div>
        </div>
      ) : (
        <>
          <h2 className="mb-1 text-3xl font-extrabold tracking-tight">
            {current ? `Hi ${current.name}, pick a grid` : 'Welcome back'}
          </h2>
          <p className="mb-6 text-ink-soft">
            {next !== undefined && !current
              ? `Pick a name to play the ${next} x ${next} grid.`
              : 'Bigger grids mean bigger numbers. Start small and work your way up.'}{' '}
            <TutorialLink>Need a refresher? Take the tutorial</TutorialLink>
          </p>

          <div className="mb-8 rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line)]">
            <PlayerPicker onPicked={resumeGame} />
          </div>

          {current ? (
            <nav aria-label="Grid sizes">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
                {GRID_SIZES.map((size, i) => (
                  <li
                    key={size}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className={`animate-rise ${size > SMALL_SCREEN_MAX_SIZE ? 'max-lg:hidden' : ''}`}
                  >
                    <SizeCard size={size} best={bests.get(size)} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="rounded-3xl border-2 border-dashed border-line p-8 text-center text-ink-soft">
              Pick a player above to choose a grid.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TutorialLink({ children }: { children: string }) {
  return (
    <Link
      to="/tutorial"
      className="inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-lamp decoration-2 underline-offset-2"
    >
      <GraduationCap className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
