import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { BitDemo } from '../components/BitDemo';
import { type GameOutcome, Grid } from '../components/Grid';
import {
  createPuzzle,
  emptyGrid,
  GRID_SIZES,
  isSolved,
  toggleCell,
} from '../game/puzzle';

interface Step {
  title: string;
  intro: string;
  /** Grid size to practise on; the first step is a single row. */
  size?: number;
  placeValues?: boolean;
}

const STEPS = [
  {
    title: 'Read a binary number',
    intro:
      'A binary number is a row of bits, each one 0 or 1. Each bit is worth double the one to its right, so a number is the sum of its lit bits.',
  },
  {
    title: 'Rows and columns',
    intro:
      'In the game, every row reads left to right and every column reads top to bottom. Light the bits so each row matches the target on its right and each column matches the target below it. The small numbers show what each bit is worth.',
    size: 2,
    placeValues: true,
  },
  {
    title: 'A real grid',
    intro:
      'Same rules with one more bit, so targets go up to 7. This is how the game looks, without the timer. Tip: set the rows first, then check the columns.',
    size: 3,
  },
] as const satisfies readonly Step[];

const FIRST_GAME_SIZE = GRID_SIZES[0];

interface TutorialSearch {
  step?: number;
}

export const Route = createFileRoute('/tutorial')({
  validateSearch: (search: Record<string, unknown>): TutorialSearch => {
    const step = Number(search.step);
    return Number.isInteger(step) && step > 1 && step <= STEPS.length
      ? { step }
      : {};
  },
  component: TutorialPage,
});

function TutorialPage() {
  const { step = 1 } = Route.useSearch();
  const current: Step = STEPS[step - 1] ?? STEPS[0];
  const last = step === STEPS.length;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the new step so keyboard and screen reader users start reading from its top.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="mx-auto max-w-xl px-4 pt-4 pb-16 lg:pt-10">
      <p className="mb-1 text-sm font-semibold text-ink-soft">Tutorial</p>
      <ol aria-label="Tutorial steps" className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex-1">
            <Link
              to="/tutorial"
              search={i === 0 ? {} : { step: i + 1 }}
              aria-current={i + 1 === step ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${s.title}`}
              className="block py-2"
            >
              <span
                aria-hidden
                className={`block h-1.5 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-lamp' : 'bg-line'
                }`}
              />
            </Link>
          </li>
        ))}
      </ol>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 text-3xl font-extrabold tracking-tight outline-none"
      >
        <span className="text-ink-soft">
          {step}/{STEPS.length}
        </span>{' '}
        {current.title}
      </h2>
      <p className="mb-6 text-ink-soft">{current.intro}</p>

      {current.size === undefined ? (
        <BitDemo />
      ) : (
        <Practice
          key={step}
          size={current.size}
          placeValues={current.placeValues}
        />
      )}

      <nav
        aria-label="Tutorial"
        className="mt-8 flex flex-wrap items-center justify-between gap-3"
      >
        {step > 1 ? (
          <Link
            to="/tutorial"
            search={step === 2 ? {} : { step: step - 1 }}
            className="btn btn-ghost"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        ) : (
          <Link to="/" className="btn btn-ghost">
            <ArrowLeft className="size-4" aria-hidden />
            Home
          </Link>
        )}
        {last ? (
          <Link
            to="/play/$size"
            params={{ size: FIRST_GAME_SIZE }}
            className="btn btn-lamp"
          >
            Play {FIRST_GAME_SIZE} x {FIRST_GAME_SIZE}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link
            to="/tutorial"
            search={{ step: step + 1 }}
            className="btn btn-lamp"
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  );
}

/** An untimed grid to practise on, with a fresh puzzle on each try. */
function Practice({
  size,
  placeValues,
}: {
  size: number;
  placeValues?: boolean;
}) {
  const [round, setRound] = useState(0);
  return (
    <PracticeGrid
      key={round}
      size={size}
      placeValues={placeValues}
      onRetry={() => setRound((r) => r + 1)}
    />
  );
}

function PracticeGrid({
  size,
  placeValues,
  onRetry,
}: {
  size: number;
  placeValues?: boolean;
  onRetry: () => void;
}) {
  const [puzzle] = useState(() => createPuzzle(size));
  const [grid, setGrid] = useState(() => emptyGrid(size));
  const [outcome, setOutcome] = useState<GameOutcome>({ result: 'playing' });

  const handleToggle = (row: number, col: number) => {
    const next = toggleCell(grid, row, col);
    setGrid(next);
    if (isSolved(puzzle, next)) {
      setOutcome({ result: 'won' });
    }
  };

  return (
    <section
      aria-label="Practice grid"
      className="flex flex-col items-center rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-16px_rgb(0_0_0/0.25)]"
    >
      <Grid
        puzzle={puzzle}
        grid={grid}
        outcome={outcome}
        onToggle={handleToggle}
        placeValues={placeValues}
      />
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-ghost mt-5 animate-rise"
      >
        <RotateCcw className="size-4" aria-hidden />
        {outcome.result === 'won' ? 'Try another' : 'New puzzle'}
      </button>
    </section>
  );
}
