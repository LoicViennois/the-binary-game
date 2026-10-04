import type { CSSProperties } from 'react';
import { useState } from 'react';

const PARTICLES = 32;
const COLORS = ['var(--lamp)', 'var(--match)', 'var(--ink-soft)'];

interface Particle {
  bit: string;
  style: CSSProperties;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 110 + Math.random() * 140;
    return {
      bit: Math.random() < 0.5 ? '0' : '1',
      style: {
        '--dx': `${Math.cos(angle) * distance}px`,
        '--dy': `${Math.sin(angle) * distance - 60}px`,
        '--rot': `${Math.round(Math.random() * 120 - 60)}deg`,
        animationDelay: `${Math.round(Math.random() * 180)}ms`,
        color: COLORS[i % COLORS.length],
        fontSize: `${1 + Math.random() * 0.9}rem`,
      } as CSSProperties,
    };
  });
}

/** A burst of 0s and 1s flying out from the centre, for winning moments. */
export function BitBurst() {
  const [particles] = useState(createParticles);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          style={p.style}
          className="font-digits absolute animate-float-bit font-bold opacity-0"
        >
          {p.bit}
        </span>
      ))}
    </div>
  );
}
