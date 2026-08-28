// Title: Jan 30, 2022: Battenburg
// Author: clover!
// Video: https://www.youtube.com/watch?v=gZRw1oD5eck
// Source: https://tinyurl.com/2p8hmym6

// Normal sudoku rules apply. Each `rectangle` overlay below marks a 2x2
// intersection: blue (#0000FF) requires the four cells' odd/even parities to
// form a diagonal "checkerboard" (one diagonal pair both odd, the other both
// even); white (#FFFFFF) forbids that pattern. Unmarked intersections are
// unconstrained, and repeats among the four cells are allowed where the
// normal row/column/box rules permit them.
const givens = [
  ['R1C1', 3], ['R1C3', 5], ['R1C7', 7], ['R1C9', 6], ['R2C4', 2],
  ['R2C6', 7], ['R3C1', 1], ['R3C9', 8], ['R4C2', 6], ['R4C8', 1],
  ['R5C5', 4], ['R6C2', 5], ['R6C8', 4], ['R7C1', 7], ['R7C9', 5],
  ['R8C4', 7], ['R8C6', 3], ['R9C1', 2], ['R9C3', 8], ['R9C7', 9],
  ['R9C9', 7],
];

// Cell sets from the puzzle's `rectangle` overlay, tagged by fill colour.
const battenburgSquares = [
  { cells: ['R3C2', 'R3C3', 'R2C2', 'R2C3'], checkerboard: true },
  { cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'], checkerboard: true },
  { cells: ['R8C7', 'R8C8', 'R7C7', 'R7C8'], checkerboard: true },
  { cells: ['R7C6', 'R7C5', 'R8C6', 'R8C5'], checkerboard: true },
  { cells: ['R8C4', 'R8C5', 'R7C4', 'R7C5'], checkerboard: true },
  { cells: ['R7C3', 'R7C2', 'R8C3', 'R8C2'], checkerboard: true },
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], checkerboard: false },
  { cells: ['R3C2', 'R3C3', 'R4C2', 'R4C3'], checkerboard: false },
  { cells: ['R3C4', 'R3C3', 'R2C4', 'R2C3'], checkerboard: false },
  { cells: ['R2C6', 'R2C7', 'R3C6', 'R3C7'], checkerboard: false },
  { cells: ['R3C7', 'R3C8', 'R4C7', 'R4C8'], checkerboard: false },
  { cells: ['R5C9', 'R5C8', 'R6C9', 'R6C8'], checkerboard: false },
  { cells: ['R8C9', 'R8C8', 'R9C9', 'R9C8'], checkerboard: false },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], checkerboard: false },
  { cells: ['R5C1', 'R5C2', 'R4C1', 'R4C2'], checkerboard: false },
  { cells: ['R1C9', 'R1C8', 'R2C9', 'R2C8'], checkerboard: false },
];

// Each overlay lists its 2x2 cells in drawing order, not corner order. Derive
// the corners from row/col arithmetic so the NFA below can read a fixed
// TL, TR, BR, BL cycle and pair up the two diagonals (TL-BR, TR-BL).
const cornersOf = (cells) => {
  const parsed = cells.map(parseCellId);
  const minR = Math.min(...parsed.map(c => c.row));
  const maxR = Math.max(...parsed.map(c => c.row));
  const minC = Math.min(...parsed.map(c => c.col));
  const maxC = Math.max(...parsed.map(c => c.col));
  return [
    makeCellId(minR, minC), makeCellId(minR, maxC),
    makeCellId(maxR, maxC), makeCellId(maxR, minC),
  ];
};

// One NFA per required outcome, shared across all squares of that colour.
// State carries the parity (0 even, 1 odd) of each of the 4 cells read in
// TL, TR, BR, BL order; accept checks the diagonal-checkerboard condition
// once all four are read.
const isCheckerboard = ([tl, tr, br, bl]) =>
  tl === br && tr === bl && tl !== tr;

// maxDepth bounds compile-time state exploration to the 4 cells actually
// scanned; without it the parities array grows without limit and blows the
// compiler's state cap.
const makeBattenburgNFA = (wantCheckerboard) => NFA.encodeSpec({
  startState: { parities: [] },
  transition: ({ parities }, value) => ({ parities: [...parities, value % 2] }),
  accept: ({ parities }) => isCheckerboard(parities) === wantCheckerboard,
  maxDepth: 4,
}, 9);

const blueNFA = makeBattenburgNFA(true);
const whiteNFA = makeBattenburgNFA(false);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...battenburgSquares.map(({ cells, checkerboard }) => new NFA(
    checkerboard ? blueNFA : whiteNFA,
    checkerboard ? 'battenburg-blue' : 'battenburg-white',
    ...cornersOf(cells))),
];
