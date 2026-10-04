const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a duration in milliseconds as `mm:ss:cc` (centiseconds). */
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;
  const centiseconds = Math.floor(ms / 10) % 100;
  return `${pad(minutes)}:${pad(seconds)}:${pad(centiseconds)}`;
}
