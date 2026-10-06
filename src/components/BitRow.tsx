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
    gridTemplateColumns: `repeat(${size}, var(--cell)) auto auto`,
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
        {bits.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="mb-1.5 text-center text-xs text-ink-soft"
          >
            {placeValue(i)}
          </span>
        ))}
        <StackedNote to="down">target</StackedNote>
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
        <SideNote to="up">target</SideNote>

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
            = {value}
          </span>
        </div>
        <SideNote to="down">your sum</SideNote>
        <span style={{ gridColumnStart: size + 1 }} className="self-start">
          <StackedNote to="up">your sum</StackedNote>
        </span>
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
                    if (sequence) {
                      setIndex(done ? 0 : index + 1);
                      setBits(Array<Bit>(size).fill(0));
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
            ) : null}
          </>
        ) : null}
      </p>
    </section>
  );
}

const handwriting =
  "text-xs font-semibold whitespace-nowrap text-ink-soft [font-variation-settings:'CASL'_0.6,'MONO'_0]";

const sketch = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** A handwritten note beside the row, with a sketchy arrow curving left to the target (up) or the sum (down). */
function SideNote({ to, children }: { to: 'up' | 'down'; children: string }) {
  const up = to === 'up';
  return (
    // Hides what is inside, not the grid item itself, so the other cells keep their places.
    <span aria-hidden className={up ? '' : 'self-stretch'}>
      <span
        className={`flex h-full gap-0.5 pl-1 text-ink-soft max-sm:hidden ${up ? 'items-start' : 'items-end'}`}
      >
        <svg
          viewBox="0 0 32 22"
          {...sketch}
          className={`w-7 shrink-0 ${up ? 'mt-2' : '-scale-y-100'}`}
        >
          <path d="M30 6c-4-3.5-11-4.2-16-1.8-4.6 2.2-7.6 6-9.4 10.6" />
          <path d="M3.6 15.4c-.5-2.6-.3-5.1.4-7.4M3.8 15.6c2.3-1 4.6-1.5 7.2-1.6" />
        </svg>
        <span className={`-rotate-6 ${handwriting}`}>{children}</span>
      </span>
    </span>
  );
}

/** The same note for narrow screens, above the target (pointing down) or below the sum (pointing up). */
function StackedNote({
  to,
  children,
}: {
  to: 'up' | 'down';
  children: string;
}) {
  const down = to === 'down';
  const arrow = (
    <svg
      viewBox="0 0 16 18"
      {...sketch}
      className={`h-4 shrink-0 ${down ? '' : '-scale-y-100'}`}
    >
      <path d="M5 1.5c3.2 3 4.2 7.6 2.4 13.6" />
      <path d="M7.4 15.4c-1.7-1-3-2.4-3.9-4M7.5 15.3c.6-1.9 1.7-3.4 3.2-4.7" />
    </svg>
  );
  return (
    <span aria-hidden className="ml-1 block border-l-2 border-transparent pl-3">
      <span className="flex w-(--cell) flex-col items-center text-ink-soft sm:hidden">
        {down ? null : arrow}
        <span className={`-rotate-3 ${handwriting}`}>{children}</span>
        {down ? arrow : null}
      </span>
    </span>
  );
}
