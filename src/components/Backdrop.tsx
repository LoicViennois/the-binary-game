import { useEffect, useRef } from 'react';

/** Cell size and grid pitch in CSS px. */
const CELL = 14;
const PITCH = 22;
/** Share of cells lit in the random pattern, like a size card preview. */
const LIT_RATIO = 0.3;
/** How far around the pointer cells light up, in cells. */
const HOVER_RADIUS = 2.2;
/** How much heat a cell loses per ms once the pointer has moved on. */
const COOLING = 1 / 700;
/** A random bit flips every so often, so the board quietly lives. */
const FLIP_EVERY = 1800;

interface Palette {
  lamp: string;
  line: string;
  glow: string;
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  return {
    lamp: css.getPropertyValue('--lamp').trim(),
    line: css.getPropertyValue('--line').trim(),
    glow: css.getPropertyValue('--lamp-glow').trim(),
  };
}

/**
 * A quiet board of bit cells behind the app, drawn like the size cards'
 * previews: a random pattern of dimly lit bits that light up around the
 * pointer, then slowly cool down.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    // with reduced motion, cells only light up right under the pointer
    const cooling = reducedMotion ? 1 / 120 : COOLING;

    let palette = readPalette();
    let cols = 0;
    let rows = 0;
    let lit = new Uint8Array(0);
    let heat = new Float32Array(0);
    let frame = 0;
    let last = 0;

    const draw = () => {
      const radius = CELL / 4;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols * rows; i++) {
        const x = (i % cols) * PITCH + (PITCH - CELL) / 2;
        const y = Math.floor(i / cols) * PITCH + (PITCH - CELL) / 2;
        const h = heat[i] ?? 0;
        ctx.beginPath();
        ctx.roundRect(x, y, CELL, CELL, radius);
        if (lit[i]) {
          // dim lamp at rest, full lamp with a glow when hovered
          ctx.globalAlpha = 0.09 + 0.85 * h;
          ctx.fillStyle = palette.lamp;
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 10 * h;
        } else {
          ctx.globalAlpha = 0.22 + 0.5 * h;
          ctx.fillStyle = palette.line;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      let warm = false;
      for (let i = 0; i < heat.length; i++) {
        const h = heat[i] ?? 0;
        if (h > 0) {
          heat[i] = Math.max(0, h - dt * cooling);
          warm ||= h - dt * cooling > 0;
        }
      }
      draw();
      frame = warm ? requestAnimationFrame(tick) : 0;
      if (!warm) {
        last = 0;
      }
    };

    const wake = () => {
      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / PITCH);
      rows = Math.ceil(height / PITCH);
      lit = Uint8Array.from({ length: cols * rows }, () =>
        Math.random() < LIT_RATIO ? 1 : 0,
      );
      heat = new Float32Array(cols * rows);
      draw();
    };

    const onPointerMove = (e: PointerEvent) => {
      const cx = e.clientX / PITCH - 0.5;
      const cy = e.clientY / PITCH - 0.5;
      const r = Math.ceil(HOVER_RADIUS);
      for (let y = Math.round(cy) - r; y <= Math.round(cy) + r; y++) {
        for (let x = Math.round(cx) - r; x <= Math.round(cx) + r; x++) {
          if (x < 0 || y < 0 || x >= cols || y >= rows) {
            continue;
          }
          const d = Math.hypot(x - cx, y - cy) / HOVER_RADIUS;
          if (d < 1) {
            const i = y * cols + x;
            heat[i] = Math.max(heat[i] ?? 0, 1 - d * d);
          }
        }
      }
      wake();
    };

    const flip = () => {
      const i = Math.floor(Math.random() * lit.length);
      lit[i] = lit[i] ? 0 : 1;
      heat[i] = Math.max(heat[i] ?? 0, 0.5);
      wake();
    };

    const theme = new MutationObserver(() => {
      palette = readPalette();
      draw();
    });

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const flips = reducedMotion ? 0 : window.setInterval(flip, FLIP_EVERY);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(flips);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      theme.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="bit-board" />;
}
