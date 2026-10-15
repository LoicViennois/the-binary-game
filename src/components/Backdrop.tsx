import type { AnimationEvent, CSSProperties } from 'react';
import { useState } from 'react';

/** Grid pitch in px, shared with the `backdrop` utility in index.css. */
const PITCH = 28;
const GLIMMERS = 9;

interface Glimmer {
  style: CSSProperties;
}

/** Moves a glimmer to a random point of the dot grid. */
function place(el: HTMLElement) {
  const cols = Math.max(1, Math.floor(window.innerWidth / PITCH));
  const rows = Math.max(1, Math.floor(window.innerHeight / PITCH));
  el.style.left = `${Math.floor(Math.random() * cols) * PITCH + PITCH / 2}px`;
  el.style.top = `${Math.floor(Math.random() * rows) * PITCH + PITCH / 2}px`;
}

function createGlimmers(): Glimmer[] {
  return Array.from({ length: GLIMMERS }, (_, i) => ({
    style: {
      // one in three lights up like a matched target, the rest like a lit bit
      '--glimmer': i % 3 === 2 ? 'var(--match)' : 'var(--lamp)',
      animationDuration: `${7 + Math.random() * 6}s`,
      animationDelay: `${-Math.random() * 12}s`,
    } as CSSProperties,
  }));
}

/**
 * A quiet board of unlit dots behind the app. Now and then one of them
 * slowly lights up and fades, then wakes up somewhere else.
 */
export function Backdrop() {
  const [glimmers] = useState(createGlimmers);

  const onIteration = (e: AnimationEvent<HTMLSpanElement>) =>
    place(e.currentTarget);

  return (
    <div aria-hidden className="dot-board">
      {glimmers.map((g, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el && !el.style.left) {
              place(el);
            }
          }}
          style={g.style}
          onAnimationIteration={onIteration}
          className="glimmer motion-reduce:hidden"
        />
      ))}
    </div>
  );
}
