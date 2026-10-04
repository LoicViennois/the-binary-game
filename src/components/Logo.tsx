const PATTERN = [1, 0, 1, 1];

/** Four little bits, reading 1011. */
export function Logo({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`grid grid-cols-2 gap-[3px] ${className ?? ''}`}>
      {PATTERN.map((bit, i) => (
        <span
          key={i}
          className={`size-2.5 rounded-[3px] ${bit ? 'bg-lamp shadow-[0_0_8px_var(--lamp-glow)]' : 'bg-line'}`}
        />
      ))}
    </span>
  );
}
