export const GRID_SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
/** Larger grids do not fit a phone screen, so they are only offered on desktop. */
export const SMALL_SCREEN_MAX_SIZE = 8;

export function isDesktopOnly(size: number): boolean {
  return size > SMALL_SCREEN_MAX_SIZE;
}

export type Bit = 0 | 1;
export type Grid = Bit[][];

export interface Puzzle {
  size: number;
  rowTargets: number[];
  colTargets: number[];
}

export function isValidSize(size: number): boolean {
  return (GRID_SIZES as readonly number[]).includes(size);
}

/** The size after this one, or undefined for the largest. */
export function nextSize(size: number): number | undefined {
  return GRID_SIZES.find((s) => s > size);
}

export function emptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array<Bit>(size).fill(0));
}

/** Reads each row (left to right) and column (top to bottom) as a binary number. */
export function totals(grid: Grid): { rows: number[]; cols: number[] } {
  const size = grid.length;
  const toNumber = (bits: Bit[]) =>
    bits.reduce<number>((acc, bit) => acc * 2 + bit, 0);
  return {
    rows: grid.map(toNumber),
    cols: Array.from({ length: size }, (_, c) =>
      toNumber(grid.map((row) => row[c] ?? 0)),
    ),
  };
}

/** Generates a random puzzle whose row and column targets are all non-zero. */
export function createPuzzle(size: number): Puzzle {
  for (;;) {
    const solution = emptyGrid(size).map((row) =>
      row.map((): Bit => (Math.random() < 0.5 ? 0 : 1)),
    );
    const { rows, cols } = totals(solution);
    if (!rows.includes(0) && !cols.includes(0)) {
      return { size, rowTargets: rows, colTargets: cols };
    }
  }
}

export function toggleCell(grid: Grid, row: number, col: number): Grid {
  return grid.map((cells, r) =>
    r === row
      ? cells.map((bit, c) => (c === col ? ((1 - bit) as Bit) : bit))
      : cells,
  );
}

export function isSolved(puzzle: Puzzle, grid: Grid): boolean {
  const { rows, cols } = totals(grid);
  return (
    rows.every((value, i) => value === puzzle.rowTargets[i]) &&
    cols.every((value, i) => value === puzzle.colTargets[i])
  );
}
