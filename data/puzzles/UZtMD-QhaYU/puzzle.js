// Title: Continuous Sum Sudoku
// Author: Syhill
// Video: https://www.youtube.com/watch?v=UZtMD-QhaYU
// Source: https://app.crackingthecryptic.com/sudoku/DgPHgtJqH6

// Normal sudoku rules: 1-6 once per row, column, and 3x2 box (the drawn
// regions match ISS's default 6x6 boxing).
//
// A clue outside the grid gives the sum of the diagonal it indicates.
//
// For every stretch of 3 cells along a gold line, the 2 lowest digits in
// that stretch sum to the 3rd (remaining) digit, in any order; digits may
// repeat on the lines. Encoded below as a sliding NFA window over each
// line's cell order, since no built-in class reads a 3-cell window this way
// (ISS's own `SumLine` instead partitions a line into fixed-total segments).
//
// Nothing is omitted.

const shape = new Shape('6x6');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// The gold sum-lines. Two drawn entries (the loop's two arcs) share both
// endpoints and are one continuous closed hexagon; it is listed once below
// as LOOP, with `loop: true`.
const LINES = [
  { cells: ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R3C2', 'R2C2'], loop: true },
  { cells: ['R4C1', 'R5C2', 'R6C1'], loop: false },
  { cells: ['R1C4', 'R2C4', 'R3C4', 'R4C5'], loop: false },
  { cells: ['R3C5', 'R2C5', 'R3C6', 'R2C6'], loop: false },
  { cells: ['R5C3', 'R4C4', 'R5C4', 'R6C3'], loop: false },
];

// A window of 3 line values obeys the rule iff its two lowest sum to its
// highest.
const sumWindowOk = (a, b, c) => {
  const [x, y, z] = [a, b, c].sort((p, q) => p - q);
  return x + y === z;
};

// Reads a line's cells in order and rejects as soon as any 3-cell sliding
// window fails sumWindowOk; carries only the last two values read.
const sumLineSpec = NFA.encodeSpec({
  startState: { window: [] },
  transition: (state, value) => {
    const { window } = state;
    if (window.length === 2 && !sumWindowOk(window[0], window[1], value)) {
      return undefined;
    }
    return { window: [...window, value].slice(-2) };
  },
  accept: () => true,
}, 6);

const sumLines = LINES.map(({ cells, loop }) => {
  // A closed loop's wrap-around stretches (e.g. the last two cells with the
  // first) are still "3 cells along the line", so repeat the first two
  // cells at the end to feed the missing windows to the same sliding scan.
  const scanCells = loop ? [...cells, cells[0], cells[1]] : cells;
  return new NFA(sumLineSpec, 'sum-line', ...scanCells);
});

return [
  shape,
  ...sumLines,
  // The "17" diagonal-sum badge sits outside the grid, offset along the
  // diagonal that enters at the top-left corner of R2C1 and runs
  // down-right -- not aligned with any row/column band (the badge's row
  // coordinate alone would misleadingly suggest the R1 lane).
  LittleKiller.fromCells(17, graph.ray('R2C1', 1, 1), geometry),
];
