import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import {
  ArrowRight,
  House,
  Monitor,
  RotateCcw,
  Square,
  Trophy,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { type GameOutcome, Grid } from '../components/Grid';
import { HighScores } from '../components/HighScores';
import { Timer } from '../components/Timer';
import {
  createPuzzle,
  emptyGrid,
  isSolved,
  isDesktopOnly,
  isValidSize,
  nextSize,
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
  const desktopOnly = isDesktopOnly(size);

  return (
    <>
      {desktopOnly ? <DesktopOnlyNotice size={size} /> : null}
      <div
        className={`relative mx-auto flex h-full max-w-6xl gap-6 overflow-x-clip lg:grid lg:grid-cols-[15rem_1fr_18rem] lg:grid-rows-[1fr_auto_1fr] lg:gap-y-0 lg:px-6 lg:py-4 lg:[--board-max:min(min(100vw,72rem)_-_39rem,100dvh_-_11rem)] ${desktopOnly ? 'max-lg:hidden' : ''}`}
      >
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
          className={`max-lg:absolute max-lg:inset-0 max-lg:z-20 max-lg:bg-bg max-lg:px-4 max-lg:pt-4 max-lg:transition-transform max-lg:duration-300 max-lg:ease-out lg:col-start-3 lg:row-start-2 ${
            highScoresOpen ? '' : 'max-lg:translate-x-full'
          }`}
        >
          <div className="rounded-3xl bg-surface p-4 text-left shadow-[0_1px_0_var(--line)]">
            <HighScores game={size} playerUid={player.uid} />
          </div>
        </aside>
      </div>
    </>
  );
}

/** Replaces the game on small screens for grids too large to play there. */
function DesktopOnlyNotice({ size }: { size: number }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-10 text-center lg:hidden">
      <Monitor className="mx-auto mb-4 size-10 text-ink-soft" aria-hidden />
      <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
        Only available on desktop
      </h2>
      <p className="mb-6 text-ink-soft">
        The {size} x {size} grid is too large for this screen.
      </p>
      <Link to="/" className="btn btn-lamp">
        <House className="size-4" aria-hidden />
        Pick another grid
      </Link>
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

  const next = outcome.result === 'won' ? nextSize(size) : undefined;
  // Larger grids are not offered on small screens, as on the home page.
  const nextHiddenOnSmallScreens = next !== undefined && isDesktopOnly(next);
  // Restart stays the main action wherever there is no next game to play.
  const restartStyle =
    next === undefined
      ? 'btn-lamp'
      : nextHiddenOnSmallScreens
        ? 'btn-lamp lg:btn-ghost'
        : 'btn-ghost';

  // The displayed time freezes on a win; a stopped game shows the time it was stopped at.
  const timer = <Timer startedAt={startedAt} frozenAt={finalTime} />;

  return (
    <>
      <div className="hidden text-left lg:col-start-1 lg:row-start-2 lg:block">
        <div className="rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line)]">
          <p className="text-sm font-semibold text-ink-soft">Time</p>
          <p className="font-digits text-4xl font-bold">{timer}</p>
        </div>
      </div>

      {/* Equal outer rows keep the board centred; the mobile timer sits in the top one, away from the fingers.
          On desktop the page grid takes over, so the side panels line up with the top of the board. */}
      <div className="grid flex-1 grid-rows-[1fr_auto_1fr] justify-items-center py-4 lg:contents">
        <p className="font-digits self-center pb-6 text-4xl font-bold lg:hidden">
          {timer}
        </p>
        <div className="row-start-2 lg:col-start-2 lg:justify-self-center">
          <Grid
            puzzle={puzzle}
            grid={grid}
            outcome={outcome}
            onToggle={handleToggle}
          />
        </div>
        {/* Below the board rather than with it, so the board stays put when the buttons change. */}
        <div className="row-start-3 flex flex-wrap content-start justify-center gap-3 pt-6 lg:col-start-2">
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
                className={`btn animate-rise ${restartStyle}`}
              >
                <RotateCcw className="size-4" aria-hidden />
                Restart
              </button>
              {next !== undefined && (
                <button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: '/play/$size',
                      params: { size: next },
                    })
                  }
                  className={`btn btn-lamp animate-rise ${nextHiddenOnSmallScreens ? 'max-lg:hidden' : ''}`}
                >
                  Next {next} x {next}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
