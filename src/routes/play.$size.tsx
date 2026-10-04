import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { House, RotateCcw, Square, Trophy, X } from 'lucide-react';
import { useState } from 'react';

import { type GameOutcome, Grid } from '../components/Grid';
import { HighScores } from '../components/HighScores';
import { Timer } from '../components/Timer';
import {
  createPuzzle,
  emptyGrid,
  isSolved,
  isValidSize,
  toggleCell,
} from '../game/puzzle';
import { addHighScore, getPersonalBest } from '../lib/high-scores';
import { getCurrentPlayer } from '../lib/players';

export const Route = createFileRoute('/play/$size')({
  params: {
    parse: ({ size }) => ({ size: Number(size) }),
    stringify: ({ size }) => ({ size: String(size) }),
  },
  beforeLoad: ({ params }) => {
    if (!isValidSize(params.size)) {
      throw redirect({ to: '/' });
    }
    // Scores are saved under a name, so pick one first and come back.
    const player = getCurrentPlayer();
    if (!player) {
      throw redirect({ to: '/', search: { next: params.size } });
    }
    return { player };
  },
  component: GamePage,
});

function GamePage() {
  const { size } = Route.useParams();
  const { player } = Route.useRouteContext();
  const [round, setRound] = useState(0);
  const [highScoresOpen, setHighScoresOpen] = useState(false);

  return (
    <div className="relative mx-auto flex h-full max-w-6xl gap-6 overflow-x-clip lg:px-6">
      {/* key resets the whole game state on restart or size change */}
      <Game
        key={`${size}-${round}`}
        size={size}
        onRestart={() => setRound((r) => r + 1)}
      />

      <button
        type="button"
        onClick={() => setHighScoresOpen((open) => !open)}
        aria-expanded={highScoresOpen}
        aria-controls="high-scores-panel"
        data-testid="high-scores-toggle"
        className="btn btn-ghost fixed right-3 bottom-8 z-40 bg-surface shadow-lg lg:hidden"
      >
        {highScoresOpen ? (
          <X className="size-4" aria-hidden />
        ) : (
          <Trophy className="size-4 text-lamp" aria-hidden />
        )}
        {highScoresOpen ? 'Close' : 'High scores'}
      </button>
      <aside
        id="high-scores-panel"
        data-testid="high-scores-panel"
        data-expanded={highScoresOpen}
        className={`max-lg:absolute max-lg:inset-0 max-lg:z-20 max-lg:bg-bg max-lg:px-4 max-lg:pt-4 max-lg:transition-transform max-lg:duration-300 max-lg:ease-out lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:justify-center lg:py-4 ${
          highScoresOpen ? '' : 'max-lg:translate-x-full'
        }`}
      >
        <div className="rounded-3xl bg-surface p-4 text-left shadow-[0_1px_0_var(--line)]">
          <HighScores game={size} playerUid={player.uid} />
        </div>
      </aside>
    </div>
  );
}

function Game({ size, onRestart }: { size: number; onRestart: () => void }) {
  const { player } = Route.useRouteContext();
  const navigate = useNavigate();
  const [puzzle] = useState(() => createPuzzle(size));
  const [grid, setGrid] = useState(() => emptyGrid(size));
  const [startedAt] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<GameOutcome>({ result: 'playing' });
  const [finalTime, setFinalTime] = useState<number>();

  const handleToggle = (row: number, col: number) => {
    const next = toggleCell(grid, row, col);
    setGrid(next);
    if (isSolved(puzzle, next)) {
      const time = Date.now() - startedAt;
      const previousBest = getPersonalBest(size, player.uid);
      setOutcome({ result: 'won', time, previousBest });
      setFinalTime(time);
      addHighScore(size, player, time);
    }
  };

  const handleStop = () => {
    setOutcome({ result: 'stopped' });
    setFinalTime(Date.now() - startedAt);
  };

  // The displayed time freezes on a win; a stopped game shows the time it was stopped at.
  const timer = <Timer startedAt={startedAt} frozenAt={finalTime} />;

  return (
    <>
      <div className="hidden w-60 shrink-0 flex-col justify-center py-4 text-left lg:flex">
        <div className="rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line)]">
          <p className="text-sm font-semibold text-ink-soft">Time</p>
          <p className="font-digits text-4xl font-bold">{timer}</p>
        </div>
      </div>

      {/* Equal outer rows keep the board centred; the mobile timer sits in the top one, away from the fingers. */}
      <div className="grid flex-1 grid-rows-[1fr_auto_1fr] justify-items-center py-4">
        <p className="font-digits self-center pb-6 text-4xl font-bold lg:hidden">
          {timer}
        </p>
        <div className="row-start-2 flex flex-col items-center">
          <Grid
            puzzle={puzzle}
            grid={grid}
            outcome={outcome}
            onToggle={handleToggle}
          />
          <div className="flex gap-3 pt-6">
            {outcome.result === 'playing' ? (
              <button
                type="button"
                onClick={handleStop}
                className="btn btn-alert"
              >
                <Square className="size-3.5 fill-current" aria-hidden />
                Stop
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void navigate({ to: '/' })}
                  className="btn btn-ghost"
                >
                  <House className="size-4" aria-hidden />
                  Home
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="btn btn-lamp animate-rise"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Restart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
