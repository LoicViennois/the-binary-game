import { useState } from 'react';

import type { Bit } from '../game/puzzle';

const PLACE_VALUES = [8, 4, 2, 1];

function randomTarget(except: number): number {
  let target = except;
  while (target === except) {
    target = 1 + Math.floor(Math.random() * 15);
  }
  return target;
}

/** A single playable 4-bit row that teaches how the game works. */
export function BitDemo() {
  const [bits, setBits] = useState<Bit[]>([0, 1, 0, 1]);
  const [target, setTarget] = useState(11);
  const value = bits.reduce<number>((acc, bit) => acc * 2 + bit, 0);
  const matched = value === target;

  const toggle = (i: number) => {
    setBits((current) =>
      current.map((bit, j) => (j === i ? ((1 - bit) as Bit) : bit)),
    );
  };

  return (
    <section
      aria-label="Try it"
      className="rounded-3xl bg-surface p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-16px_rgb(0_0_0/0.25)]"
    >
      <p className="mb-4 text-sm text-ink-soft">
        Each bit is worth double the one to its right. Light up the bits that
        add up to <strong className="font-digits text-ink">{target}</strong>.
      </p>
      <div className="font-digits flex items-center justify-center gap-2 text-2xl">
        {bits.map((bit, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 perspective-[400px]"
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              data-lit={bit === 1}
              aria-label={`Bit worth ${PLACE_VALUES[i]}: ${bit ? 'on' : 'off'}`}
              className="bit grid size-12 place-items-center font-bold"
            >
              <span key={bit} className="inline-block animate-flip">
                {bit}
              </span>
            </button>
            <span className="text-xs text-ink-soft">{PLACE_VALUES[i]}</span>
          </div>
        ))}
        <span aria-hidden className="mx-1 pb-5 text-ink-soft">
          =
        </span>
        <div className="flex flex-col items-center gap-1.5">
          <output
            key={String(matched)}
            aria-live="polite"
            data-valid={matched}
            className={`target grid size-12 place-items-center font-bold ${
              matched ? 'animate-pop' : ''
            }`}
          >
            {value}
          </output>
          <span className="text-xs text-transparent" aria-hidden>
            =
          </span>
        </div>
      </div>
      <p
        className="mt-3 h-6 text-center text-sm font-semibold"
        aria-live="polite"
      >
        {matched ? (
          <>
            <span className="text-match">That&apos;s it!</span>{' '}
            <button
              type="button"
              onClick={() => setTarget(randomTarget(target))}
              className="cursor-pointer text-ink underline decoration-lamp decoration-2 underline-offset-2"
            >
              Try another number
            </button>
          </>
        ) : null}
      </p>
    </section>
  );
}
