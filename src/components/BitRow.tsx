import { type CSSProperties, useRef, useState } from 'react';

import type { Bit } from '../game/puzzle';

interface BitRowProps {
  /** Number of bits in the row. */
  size: number;
  /** Targets to make one after the other; random targets when omitted. */
  sequence?: readonly number[];
  /** Bits lit at the start. */
  start?: readonly Bit[];
  label?: string;
  prompt?: string;
}

const toNumber = (bits: readonly Bit[]) =>
  bits.reduce<number>((acc, bit) => acc * 2 + bit, 0);

/** A random target from 1 to max, other than the excluded values. */
function randomTarget(max: number, ...except: number[]): number {
  const choices = Array.from({ length: max }, (_, i) => i + 1).filter(
    (n) => !except.includes(n),
  );
  return choices[Math.floor(Math.random() * choices.length)] ?? max;
}

/**
 * A single playable row, laid out like a row of the game: bits on the left,
 * target on the right. The current sum shows underneath, as an equation and as
 * blocks filling a bar up to the target mark.
 */
export function BitRow({
  size,
  sequence,
  start,
  label = 'Try it',
  prompt = 'Light up the bits that add up to the target on the right.',
}: BitRowProps) {
  const max = 2 ** size - 1;
  const [bits, setBits] = useState<Bit[]>(() =>
    start ? [...start] : Array<Bit>(size).fill(0),
  );
  const [index, setIndex] = useState(0);
  const [randomValue, setRandomValue] = useState(() =>
    randomTarget(max, toNumber(bits)),
  );
  const rowRef = useRef<HTMLDivElement>(null);

  const target = sequence ? (sequence[index] ?? max) : randomValue;
  const value = toNumber(bits);
  const matched = value === target;
  const placeValue = (i: number) => 2 ** (size - 1 - i);
  const lit = bits.flatMap((bit, i) => (bit ? [placeValue(i)] : []));
  const done = sequence !== undefined && index === sequence.length - 1;

  const toggle = (i: number) => {
    setBits((current) =>
      current.map((bit, j) => (j === i ? ((1 - bit) as Bit) : bit)),
    );
  };

  // The button that moved on disappears, so hand focus back to the bits.
  const moveOn = (advance: () => void) => {
    advance();
    rowRef.current?.querySelector('button')?.focus();
  };

  const style = {
    '--cell': `min(3rem, calc((100vw - 8rem) / ${size + 1}))`,
    gridTemplateColumns: `repeat(${size}, var(--cell)) auto`,
  } as CSSProperties;

  return (
    <section
      aria-label={label}
      className="rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-16px_rgb(0_0_0/0.25)]"
    >
      <p className="mb-4 text-sm text-ink-soft">{prompt}</p>
      <div
        ref={rowRef}
        style={style}
        className="font-digits mx-auto grid w-fit items-center gap-x-2 text-[calc(var(--cell)*0.5)]"
      >
        {bits.map((bit, i) => (
          <span
            key={i}
            aria-hidden
            className={`mb-1.5 text-center text-xs transition-colors ${
              bit ? 'font-bold text-ink' : 'text-ink-soft'
            }`}
          >
            {placeValue(i)}
          </span>
        ))}
        <span aria-hidden />

        {bits.map((bit, i) => (
          <div key={i} className="perspective-[400px]">
            <button
              type="button"
              onClick={() => toggle(i)}
              data-lit={bit === 1}
              aria-label={`Bit worth ${placeValue(i)}: ${bit ? 'on' : 'off'}`}
              className="bit grid size-(--cell) place-items-center font-bold"
            >
              <span key={bit} className="inline-block animate-flip">
                {bit}
              </span>
            </button>
          </div>
        ))}
        <div className="ml-1 border-l-2 border-dashed border-line pl-3">
          <div
            key={String(matched)}
            data-testid="row-target"
            data-valid={matched}
            className={`grid size-(--cell) place-items-center rounded-[22%] font-bold ${
              matched ? 'animate-pop bg-match text-match-ink' : 'text-ink'
            }`}
          >
            <span className="sr-only">Target: </span>
            {target}
          </div>
        </div>

        <SumBar
          lit={lit}
          max={max}
          target={target}
          matched={matched}
          size={size}
        />
        <span aria-hidden />
      </div>

      <p
        aria-live="polite"
        className="font-digits mt-2 text-center text-sm text-ink-soft"
      >
        Sum: {lit.length > 1 ? `${lit.join(' + ')} = ` : null}
        <strong className={matched ? 'text-match' : 'text-ink'}>{value}</strong>
      </p>

      <p
        className="mt-2 flex min-h-9 flex-wrap items-center justify-center gap-x-3 text-sm font-semibold"
        aria-live="polite"
      >
        {matched ? (
          <>
            <span className="text-match">
              {done ? `You counted to ${target} in binary!` : 'That’s it!'}
            </span>
            <button
              type="button"
              onClick={() =>
                moveOn(() => {
                  if (sequence) {
                    setIndex(done ? 0 : index + 1);
                  } else {
                    setRandomValue(randomTarget(max, value));
                  }
                })
              }
              className="cursor-pointer py-2 text-ink underline decoration-lamp decoration-2 underline-offset-2"
            >
              {sequence
                ? done
                  ? 'Count again'
                  : `Next: make ${sequence[index + 1]}`
                : 'Try another number'}
            </button>
          </>
        ) : null}
      </p>
    </section>
  );
}

/**
 * A bar from 0 to the largest number the row can make. Each lit bit adds a
 * block as long as its worth, so the row is matched when the blocks end right
 * on the target mark.
 */
function SumBar({
  lit,
  max,
  target,
  matched,
  size,
}: {
  lit: number[];
  max: number;
  target: number;
  matched: boolean;
  size: number;
}) {
  const percent = (n: number) => `${(n / max) * 100}%`;
  // Lit bits are listed biggest first, so each block starts where the bigger ones end.
  const blocks = lit.map((worth, i) => ({
    worth,
    left: lit.slice(0, i).reduce((sum, w) => sum + w, 0),
  }));

  return (
    <div
      aria-hidden
      style={{ gridColumn: `span ${size}` }}
      className="relative mt-4 h-2.5 rounded-full bg-tint shadow-[inset_0_0_0_1px_var(--line)]"
    >
      {blocks.map(({ worth, left }) => (
        <span
          key={worth}
          style={{
            left: `calc(${percent(left)} + 1px)`,
            width: `calc(${percent(worth)} - 2px)`,
          }}
          className={`absolute inset-y-0 rounded-full transition-[left,width,background-color] duration-200 ${
            matched ? 'bg-match' : 'bg-lamp'
          }`}
        />
      ))}
      <span
        style={{ left: percent(target) }}
        className="absolute -inset-y-1.5 w-0.5 -translate-x-1/2 rounded-full bg-ink"
      />
    </div>
  );
}
