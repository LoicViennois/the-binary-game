import { createFileRoute, Link } from '@tanstack/react-router';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';

import { ScoreTable } from '../components/ScoreTable';
import { GRID_SIZES, isValidSize } from '../game/puzzle';
import { rankPlayers, useAllScores } from '../lib/high-scores';
import { useCurrentPlayer } from '../lib/players';

interface ScoresSearch {
  size?: number;
}

const DEFAULT_SIZE = GRID_SIZES[0];

export const Route = createFileRoute('/scores')({
  validateSearch: (search: Record<string, unknown>): ScoresSearch => {
    const size = Number(search.size);
    return isValidSize(size) ? { size } : {};
  },
  component: ScoresPage,
});

function ScoresPage() {
  const { size = DEFAULT_SIZE } = Route.useSearch();
  const current = useCurrentPlayer();
  const scores = useAllScores();
  const rankings = useMemo(() => rankPlayers(scores, size), [scores, size]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 pb-16 lg:pt-10">
      <h2 className="mb-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight">
        <Trophy className="size-7 text-lamp" aria-hidden />
        High scores
      </h2>
      <p className="mb-6 text-ink-soft">
        Best time of everyone who played on this device.
      </p>

      <nav aria-label="Grid size" className="mb-4 flex flex-wrap gap-1.5">
        {GRID_SIZES.map((s) => (
          <Link
            key={s}
            to="/scores"
            search={{ size: s }}
            aria-current={s === size ? 'page' : undefined}
            className={`font-digits rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
              s === size
                ? 'bg-ink text-bg'
                : 'text-ink-soft hover:bg-tint hover:text-ink'
            }`}
          >
            {s} x {s}
          </Link>
        ))}
      </nav>

      <div
        key={size}
        className="animate-rise rounded-3xl bg-surface p-4 shadow-[0_1px_0_var(--line)] lg:p-6"
      >
        {rankings.length === 0 ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-ink-soft">
              Nobody has solved the {size} x {size} grid on this device yet.
            </p>
            <Link to="/play/$size" params={{ size }} className="btn btn-lamp">
              Play {size} x {size}
            </Link>
          </div>
        ) : (
          <ScoreTable rankings={rankings} playerUid={current?.uid} showSolves />
        )}
      </div>
    </div>
  );
}
