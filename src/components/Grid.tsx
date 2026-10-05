import type { CSSProperties } from 'react';

import { type Grid as GridValues, type Puzzle, totals } from '../game/puzzle';
import { formatTime } from '../lib/format-time';
import { BitBurst } from './BitBurst';

export type GameOutcome =
  | { result: 'playing' }
  | { result: 'stopped' }
  | { result: 'won'; time?: number; previousBest?: number };

interface GridProps {
  puzzle: Puzzle;
  grid: GridValues;
  outcome: GameOutcome;
  onToggle: (row: number, col: number) => void;
  /** Shows what each bit is worth, along the top for rows and down the side for columns. */
  placeValues?: boolean;
}

function PlaceValue({ value }: { value: number }) {
  return (
    <td
      aria-hidden
      className="text-center align-middle text-[0.5em] font-semibold text-ink-soft"
    >
      {value}
    </td>
  );
}

function Target({
  value,
  valid,
  testId,
  small,
}: {
  value: number;
  valid: boolean;
  testId: string;
  /** Shrinks the number so four digits fit the cell. */
  small: boolean;
}) {
  return (
    <div
      // remount on change so the pop replays each time a line is matched
      key={String(valid)}
      data-testid={testId}
      data-valid={valid}
      className={`target m-auto flex size-[84%] items-center justify-center font-bold ${
        small ? 'text-[0.75em]' : ''
      } ${valid ? 'animate-pop' : ''}`}
    >
      {value}
    </div>
  );
}

function ResultCard({
  outcome,
}: {
  outcome: Exclude<GameOutcome, { result: 'playing' }>;
}) {
  if (outcome.result === 'stopped') {
    return (
      <div className="animate-rise rounded-2xl bg-surface px-6 py-4 shadow-xl">
        <p className="text-2xl font-bold">Stopped</p>
        <p className="text-sm text-ink-soft">Give it another go?</p>
      </div>
    );
  }

  const { time, previousBest } = outcome;
  if (time === undefined) {
    return (
      <div className="animate-rise rounded-2xl bg-surface px-6 py-4 shadow-xl [animation-delay:250ms]">
        <p className="text-2xl font-bold">Solved!</p>
      </div>
    );
  }
  const newBest = previousBest === undefined || time < previousBest;
  return (
    <div className="animate-rise rounded-2xl bg-surface px-6 py-4 shadow-xl [animation-delay:250ms]">
      <p className="text-2xl font-bold">Solved!</p>
      <p className="font-digits text-3xl font-bold">{formatTime(time)}</p>
      <p
        className={`mt-1 text-sm font-semibold ${newBest ? 'text-match' : 'text-ink-soft'}`}
      >
        {newBest
          ? 'New personal best'
          : `Your best is ${formatTime(previousBest)}`}
      </p>
    </div>
  );
}

export function Grid({
  puzzle,
  grid,
  outcome,
  onToggle,
  placeValues = false,
}: GridProps) {
  const { rows, cols } = totals(grid);
  const playing = outcome.result === 'playing';
  const won = outcome.result === 'won';
  // One extra column/row for the targets, and the place values when shown; shrink cells on narrow screens.
  // A page can also cap the whole board with --board-max, so large grids fit beside its panels.
  const cells = puzzle.size + (placeValues ? 1.5 : 1);
  const style = {
    '--cell': `min(64px, calc((100vw - 1.5rem) / ${cells}), calc(var(--board-max, 100vmax) / ${cells}))`,
  } as CSSProperties;
  const placeValue = (i: number) => 2 ** (puzzle.size - 1 - i);
  // Targets of the largest grids can reach four digits.
  const smallTargets = 2 ** puzzle.size - 1 >= 1000;

  return (
    <div className="relative" style={style}>
      <table
        data-testid="grid"
        className={`font-digits text-[calc(var(--cell)*0.42)] leading-none [&_td]:size-(--cell) [&_td]:p-0 ${
          placeValues ? '[&_td:first-child]:w-[calc(var(--cell)*0.5)]!' : ''
        }`}
      >
        <tbody>
          {placeValues ? (
            <tr className="[&_td]:h-[calc(var(--cell)*0.5)]!">
              <td />
              {grid.map((_, c) => (
                <PlaceValue key={c} value={placeValue(c)} />
              ))}
              <td />
            </tr>
          ) : null}
          {grid.map((cells, r) => (
            <tr key={r}>
              {placeValues ? <PlaceValue value={placeValue(r)} /> : null}
              {cells.map((bit, c) => (
                <td key={c} className="perspective-[400px]">
                  <button
                    type="button"
                    disabled={!playing}
                    onClick={() => onToggle(r, c)}
                    aria-label={`Row ${r + 1}, column ${c + 1}: ${bit}`}
                    data-lit={bit === 1}
                    style={
                      won ? { animationDelay: `${(r + c) * 45}ms` } : undefined
                    }
                    className={`bit m-auto flex size-[84%] items-center justify-center font-bold ${won ? 'animate-ripple' : ''}`}
                  >
                    <span key={bit} className="inline-block animate-flip">
                      {bit}
                    </span>
                  </button>
                </td>
              ))}
              <td className="border-l-2 border-dashed border-line">
                <Target
                  testId="row-target"
                  value={puzzle.rowTargets[r] ?? 0}
                  valid={rows[r] === puzzle.rowTargets[r]}
                  small={smallTargets}
                />
              </td>
            </tr>
          ))}
          <tr>
            {placeValues ? <td /> : null}
            {puzzle.colTargets.map((target, c) => (
              <td key={c} className="border-t-2 border-dashed border-line">
                <Target
                  testId="col-target"
                  value={target}
                  valid={cols[c] === target}
                  small={smallTargets}
                />
              </td>
            ))}
            <td />
          </tr>
        </tbody>
      </table>
      {playing ? null : (
        <div
          data-testid="result-overlay"
          data-result={won ? 'success' : 'failure'}
          role="status"
          className={`absolute inset-0 z-10 flex items-center justify-center rounded-2xl ${
            won ? '' : 'bg-bg/60 backdrop-blur-[2px]'
          }`}
        >
          {won ? <BitBurst /> : null}
          <ResultCard outcome={outcome} />
        </div>
      )}
    </div>
  );
}
