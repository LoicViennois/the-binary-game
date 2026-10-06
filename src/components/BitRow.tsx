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
 * target on the right. Underneath, a column addition: each bit adds its worth
 * when lit and 0 otherwise, and the sum sits right under the target.
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
  // Counting again makes no sense with a single number to make.
  const canMoveOn = !done || sequence.length > 1;

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
    '--cell': `min(3rem, calc((100vw - 6rem) / ${size + 1} - 0.5rem))`,
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
        {/* Room for the notes above the target and below the sum */}
        <span aria-hidden className="col-span-full h-9" />

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
          <div className="relative">
            <div
              key={String(matched)}
              data-testid="row-target"
              data-valid={matched}
              className={`target grid size-(--cell) place-items-center font-bold ${
                matched ? 'animate-pop' : ''
              }`}
            >
              <span className="sr-only">Target: </span>
              {target}
            </div>
            <Note to="target" />
          </div>
        </div>

        {bits.map((bit, i) => (
          <span
            key={i}
            aria-hidden
            className="relative flex justify-center pt-3 text-sm"
          >
            <span
              className={`rounded-md px-1.5 py-0.5 transition-colors ${
                bit ? 'bg-lamp font-bold text-lamp-ink' : 'text-ink-soft'
              }`}
            >
              {bit ? placeValue(i) : 0}
            </span>
            {i < size - 1 ? (
              <span className="absolute -right-1 bottom-0.5 translate-x-1/2 text-ink-soft">
                +
              </span>
            ) : null}
          </span>
        ))}
        <div
          aria-hidden
          className="ml-1 self-stretch border-l-2 border-dashed border-line pt-3 pl-3"
        >
          <span
            data-testid="row-sum"
            className={`block w-(--cell) py-0.5 text-center text-sm font-bold whitespace-nowrap ${
              matched ? 'text-match' : 'text-ink'
            }`}
          >
            ={' '}
            <span className="relative">
              {value}
              <Note to="sum" />
            </span>
          </span>
        </div>
        <span aria-hidden className="col-span-full h-10" />
      </div>

      <p aria-live="polite" className="sr-only">
        Sum: {lit.length > 1 ? `${lit.join(' + ')} = ` : null}
        {value}
      </p>

      <p
        className="mt-2 flex min-h-9 flex-wrap items-center justify-center gap-x-3 text-sm font-semibold"
        aria-live="polite"
      >
        {matched ? (
          <>
            <span className="text-match">
              {done && canMoveOn
                ? `You counted to ${target} in binary!`
                : 'That’s it!'}
            </span>
            {canMoveOn ? (
              <button
                type="button"
                onClick={() =>
                  moveOn(() => {
                    // Start each new number from a clear row.
                    setBits(Array<Bit>(size).fill(0));
                    if (sequence) {
                      setIndex(done ? 0 : index + 1);
                    } else {
                      setRandomValue(randomTarget(max, target));
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
            ) : null}
          </>
        ) : null}
      </p>
    </section>
  );
}

const handwriting =
  "text-xs font-semibold whitespace-nowrap text-lamp-text [font-variation-settings:'CASL'_0.6,'MONO'_0]";

const sketch = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** A handwritten note with a sketchy arrow pointing at the target from above, or at the sum from below. */
function Note({ to }: { to: 'target' | 'sum' }) {
  const target = to === 'target';
  const label = target ? 'target' : 'your sum';
  return (
    <span aria-hidden className={handwriting}>
      <span
        className={`absolute left-1/2 flex -translate-x-1/2 items-center ${
          target ? 'bottom-full flex-col' : 'top-full flex-col-reverse'
        }`}
      >
        <span className="-rotate-3">{label}</span>
        <svg
          viewBox="0 0 16 18"
          {...sketch}
          className={`h-4 shrink-0 ${target ? '' : '-scale-y-100'}`}
        >
          <path d="M5 1.5c3.2 3 4.2 7.6 2.4 13.6" />
          <path d="M7.4 15.4c-1.7-1-3-2.4-3.9-4M7.5 15.3c.6-1.9 1.7-3.4 3.2-4.7" />
        </svg>
      </span>
    </span>
  );
}
