import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { BitRow } from '../components/BitRow';
import { type GameOutcome, Grid } from '../components/Grid';
import {
  createPuzzle,
  emptyGrid,
  GRID_SIZES,
  isSolved,
  toggleCell,
} from '../game/puzzle';

interface Step {
  part: 1 | 2;
  title: string;
  intro: string;
  /** A single row of this many bits, counting through `sequence` or with random targets. */
  row?: { size: number; sequence?: readonly number[]; prompt?: string };
  /** A grid of this size to practise on. */
  grid?: { size: number; placeValues?: boolean };
}

const PARTS = { 1: 'Count in binary', 2: 'Play the game' } as const;

const countTo = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

const STEPS = [
  {
    part: 1,
    title: 'One bit',
    intro:
      'A bit is a tiny switch: it is either 0 (off) or 1 (on). On its own, a lit bit is worth 1.',
    row: {
      size: 1,
      sequence: [1],
      prompt: 'Light up the bit to make the target on the right.',
    },
  },
  {
    part: 1,
    title: 'Two bits',
    intro:
      'Add a bit on the left and it is worth double: 2. A binary number is the sum of its lit bits, so two bits count from 0 to 3.',
    row: {
      size: 2,
      sequence: countTo(3),
      prompt: 'Count from 1 to 3: make each target on the right in turn.',
    },
  },
  {
    part: 1,
    title: 'Three bits',
    intro:
      'One more bit on the left, worth 4, takes you up to 7. As you count, watch the pattern: the right bit flips every number, the middle one every 2 numbers, the left one every 4.',
    row: {
      size: 3,
      sequence: countTo(7),
      prompt: 'Count from 1 to 7: make each target on the right in turn.',
    },
  },
  {
    part: 1,
    title: 'Four bits',
    intro:
      'Worths keep doubling: 8, 4, 2, 1, so four bits go up to 15. Tip: start from the left. Light the biggest bit that fits in the target, then make the rest with smaller bits.',
    row: { size: 4 },
  },
  {
    part: 1,
    title: 'Five bits',
    intro:
      'A fifth bit is worth 16, and five bits reach 31. Same trick: biggest bit first, then fill in what is left. You can now make any number!',
    row: { size: 5 },
  },
  {
    part: 2,
    title: 'Rows and columns',
    intro:
      'The game is a grid where every row and every column is a binary number. Rows read left to right, columns top to bottom. Light the bits so each row matches the target on its right and each column matches the target below it. The small numbers show what each bit is worth.',
    grid: { size: 2, placeValues: true },
  },
  {
    part: 2,
    title: 'A real grid',
    intro:
      'Same rules with one more bit, so targets go up to 7. This is how the game looks, without the timer. Tip: set the rows first, then fix the columns.',
    grid: { size: 3 },
  },
] as const satisfies readonly Step[];

const FIRST_GAME_SIZE = GRID_SIZES[0];

const stepSearch = (step: number) => (step === 1 ? {} : { step });

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
  const partSteps = STEPS.filter((s) => s.part === current.part);
  const stepInPart = step - STEPS.findIndex((s) => s.part === current.part);

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
      <nav aria-label="Tutorial steps" className="mb-6 flex gap-4">
        {([1, 2] as const).map((part) => {
          const first = STEPS.findIndex((s) => s.part === part) + 1;
          const steps = STEPS.filter((s) => s.part === part);
          return (
            <div
              key={part}
              style={{ flexGrow: steps.length }}
              className="flex basis-0 flex-col"
            >
              <Link
                to="/tutorial"
                search={stepSearch(first)}
                className={`self-start text-sm font-semibold ${
                  part === current.part ? 'text-ink' : 'text-ink-soft'
                }`}
              >
                Part {part}: {PARTS[part]}
              </Link>
              <ol className="mt-auto flex gap-2">
                {steps.map((s, i) => {
                  const n = first + i;
                  return (
                    <li key={s.title} className="flex-1">
                      <Link
                        to="/tutorial"
                        search={stepSearch(n)}
                        aria-current={n === step ? 'step' : undefined}
                        aria-label={`Step ${n}: ${s.title}`}
                        className="block py-2"
                      >
                        <span
                          aria-hidden
                          className={`block h-1.5 rounded-full transition-colors ${
                            n <= step ? 'bg-lamp' : 'bg-line'
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </nav>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 text-3xl font-extrabold tracking-tight outline-none"
      >
        <span className="text-ink-soft">
          {stepInPart}/{partSteps.length}
        </span>{' '}
        {current.title}
      </h2>
      <p className="mb-6 text-ink-soft">{current.intro}</p>

      {current.row ? (
        <BitRow
          key={step}
          size={current.row.size}
          sequence={current.row.sequence}
          prompt={current.row.prompt}
        />
      ) : current.grid ? (
        <Practice
          key={step}
          size={current.grid.size}
          placeValues={current.grid.placeValues}
        />
      ) : null}

      <nav
        aria-label="Tutorial"
        className="mt-8 flex flex-wrap items-center justify-between gap-3"
      >
        {step > 1 ? (
          <Link
            to="/tutorial"
            search={stepSearch(step - 1)}
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
            search={stepSearch(step + 1)}
            className="btn btn-lamp"
          >
            {STEPS[step]?.part === current.part
              ? 'Next'
              : 'Next: play the game'}
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
