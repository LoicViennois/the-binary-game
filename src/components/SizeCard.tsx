import { Link } from '@tanstack/react-router';

import { formatTime } from '../lib/format-time';

const LEVELS: Record<number, string> = {
  3: 'Warm-up',
  4: 'Easy',
  5: 'Medium',
  6: 'Tricky',
  7: 'Hard',
  8: 'Expert',
};

/** A fixed, pleasant-looking pattern of lit dots for a size preview. */
function isLit(size: number, r: number, c: number): boolean {
  return (r * 7 + c * 3 + size) % 5 < 2;
}

export function SizeCard({ size, best }: { size: number; best?: number }) {
  return (
    <Link
      to="/play/$size"
      params={{ size }}
      className="group flex h-full flex-col rounded-3xl bg-surface p-4 shadow-[0_1px_0_var(--line),0_12px_32px_-18px_rgb(0_0_0/0.3)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_1px_0_var(--line),0_20px_40px_-18px_rgb(0_0_0/0.35)] active:translate-y-0 active:scale-[0.98]"
    >
      <span
        aria-hidden
        className="mb-4 grid aspect-square w-full max-w-28 gap-[3px] self-center"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const lit = isLit(size, Math.floor(i / size), i % size);
          return (
            <span
              key={i}
              style={{ transitionDelay: `${i * 8}ms` }}
              className={`rounded-[25%] transition-colors duration-300 ${
                lit
                  ? 'bg-lamp/40 group-hover:bg-lamp group-hover:shadow-[0_0_6px_var(--lamp-glow)]'
                  : 'bg-line'
              }`}
            />
          );
        })}
      </span>
      <span className="font-digits text-2xl font-bold">
        {size} x {size}
      </span>
      <span className="text-sm font-semibold">{LEVELS[size]}</span>
      <span className="mt-0.5 text-xs text-ink-soft">
        {best === undefined
          ? `Targets up to ${2 ** size - 1}`
          : `Your best ${formatTime(best)}`}
      </span>
    </Link>
  );
}
