import { Link } from '@tanstack/react-router';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';

import { rankPlayers, useAllScores } from '../lib/high-scores';
import { ScoreTable } from './ScoreTable';

const PANEL_LIMIT = 10;

interface HighScoresProps {
  game: number;
  /** Highlights this player's row. */
  playerUid?: string;
}

/** Compact top-10 for one grid size, shown beside the game. */
export function HighScores({ game, playerUid }: HighScoresProps) {
  const scores = useAllScores();
  const rankings = useMemo(
    () => rankPlayers(scores, game).slice(0, PANEL_LIMIT),
    [scores, game],
  );

  return (
    <>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Trophy className="size-5 text-lamp" aria-hidden />
        High scores
        <span className="font-digits ml-auto text-sm font-semibold text-ink-soft">
          {game} x {game}
        </span>
      </h2>
      {rankings.length === 0 ? (
        <p className="rounded-xl bg-tint p-4 text-sm text-ink-soft">
          No times yet. Solve this grid to claim first place.
        </p>
      ) : (
        <ScoreTable rankings={rankings} playerUid={playerUid} />
      )}
      <Link
        to="/scores"
        search={{ size: game }}
        className="mt-3 inline-block text-sm font-semibold underline decoration-lamp decoration-2 underline-offset-2"
      >
        See all high scores
      </Link>
    </>
  );
}
