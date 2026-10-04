// Generates the favicon and PWA icons from one SVG design: four bits reading 1011,
// the same mark as the header logo (src/components/Logo.tsx).
// Usage: pnpm icons
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

const BACKGROUND = '#1a1e28';
const LAMP = '#ffbf3c';
const LAMP_EDGE = '#c98a12';
const OFF = '#3a4153';
const OFF_EDGE = '#262b38';
const PATTERN = [1, 0, 1, 1];

/**
 * @param {{ maskable?: boolean }} options Maskable icons are full-bleed, with the
 * bits kept inside the 80% safe zone so any platform mask shape fits.
 */
function iconSvg({ maskable = false } = {}) {
  const tile = maskable ? 120 : 156;
  const gap = maskable ? 30 : 36;
  const offset = (512 - (tile * 2 + gap)) / 2;
  const radius = tile * 0.24;
  const edge = tile * 0.07;

  const tiles = PATTERN.map((bit, i) => {
    const x = offset + (i % 2) * (tile + gap);
    const y = offset + Math.floor(i / 2) * (tile + gap) - edge / 2;
    const face = bit ? LAMP : OFF;
    const shade = bit ? LAMP_EDGE : OFF_EDGE;
    return [
      bit ? `<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${radius}" fill="${LAMP}" filter="url(#glow)"/>` : '',
      `<rect x="${x}" y="${y + edge}" width="${tile}" height="${tile}" rx="${radius}" fill="${shade}"/>`,
      `<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${radius}" fill="${face}"/>`,
    ].join('');
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="${maskable ? 0 : 116}" fill="${BACKGROUND}"/>
  ${tiles}
</svg>
`;
}

const outputs = [
  { file: 'favicon.svg', svg: iconSvg() },
  { file: 'favicon.64.png', svg: iconSvg(), size: 64 },
  { file: 'favicon.512.png', svg: iconSvg(), size: 512 },
  { file: 'apple-touch-icon.png', svg: iconSvg({ maskable: true }), size: 180 },
  { file: 'icons/maskable-512x512.png', svg: iconSvg({ maskable: true }), size: 512 },
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
    file: `icons/icon-${size}x${size}.png`,
    svg: iconSvg(),
    size,
  })),
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, svg, size } of outputs) {
  const target = resolve(PUBLIC_DIR, file);
  mkdirSync(dirname(target), { recursive: true });
  if (!size) {
    writeFileSync(target, svg);
  } else {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">
        <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block">
      </body></html>`,
    );
    await page.screenshot({ path: target, omitBackground: true });
  }
  console.log(`wrote public/${file}`);
}

await browser.close();
