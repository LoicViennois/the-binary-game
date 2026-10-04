import { useEffect, useRef } from 'react';

import { formatTime } from '../lib/format-time';

interface TimerProps {
  startedAt: number;
  /** Elapsed time to freeze the display at; the timer runs while undefined. */
  frozenAt?: number;
  className?: string;
}

/** Updates its text directly on each animation frame to avoid re-rendering the game. */
export function Timer({ startedAt, frozenAt, className }: TimerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (frozenAt !== undefined) {
      return;
    }
    let frame = requestAnimationFrame(function tick() {
      if (ref.current) {
        ref.current.textContent = formatTime(Date.now() - startedAt);
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [startedAt, frozenAt]);

  return (
    <span
      ref={ref}
      data-testid="timer"
      className={`inline-block tabular-nums ${className ?? ''}`}
    >
      {formatTime(frozenAt ?? 0)}
    </span>
  );
}
