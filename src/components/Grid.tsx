import type { CSSProperties } from 'react';

import { type Grid as GridValues, type Puzzle, totals } from '../game/puzzle';
import { formatTime } from '../lib/format-time';
import { BitBurst } from './BitBurst';

export type GameOutcome =
  | { result: 'playing' }
  | { result: 'stopped' }
  | { result: 'won'; time: number; previousBest?: number };

interface GridProps {
  puzzle: Puzzle;
  grid: GridValues;
  outcome: GameOutcome;
  onToggle: (row: number, col: number) => void;
}

function Target({
  value,
  valid,
  testId,
}: {
  value: number;
  valid: boolean;
  testId: string;
}) {
  return (
    <div
      // remount on change so the pop replays each time a line is matched
      key={String(valid)}
      data-testid={testId}
      data-valid={valid}
      className={`m-auto flex size-[84%] items-center justify-center rounded-[22%] font-bold transition-colors ${
        valid ? 'animate-pop bg-match text-match-ink' : 'text-ink'
      }`}
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

export function Grid({ puzzle, grid, outcome, onToggle }: GridProps) {
  const { rows, cols } = totals(grid);
  const playing = outcome.result === 'playing';
  const won = outcome.result === 'won';
  // One extra column/row for the targets; shrink cells on narrow screens.
  const style = {
    '--cell': `min(64px, calc((100vw - 1.5rem) / ${puzzle.size + 1}))`,
  } as CSSProperties;

  return (
    <div className="relative" style={style}>
      <table
        data-testid="grid"
        className="font-digits text-[calc(var(--cell)*0.42)] leading-none [&_td]:size-(--cell) [&_td]:p-0"
      >
        <tbody>
          {grid.map((cells, r) => (
            <tr key={r}>
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
                />
              </td>
            </tr>
          ))}
          <tr>
            {puzzle.colTargets.map((target, c) => (
              <td key={c} className="border-t-2 border-dashed border-line">
                <Target
                  testId="col-target"
                  value={target}
                  valid={cols[c] === target}
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
