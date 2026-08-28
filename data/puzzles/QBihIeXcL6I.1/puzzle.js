// Title: World Class Kakuro (Puzzle 1)
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=QBihIeXcL6I
// Source: https://cracking-the-cryptic.web.app/sudoku/T9Jd3mF9LN

// Kakuro. Each playable cell holds a digit 1-9. Every printed run of
// consecutive white cells (interrupted only by a block or the field edge),
// reading rightward or downward from its clue box, sums to the printed
// total and holds no repeated digit -- exactly `Cage(total, ...cells)` per
// run. There is no whole-grid Sudoku rule: rows and columns are not
// all-different, only the printed runs are, so this uses the Raw grid type.
//
// The source is a 10x10 canvas whose top row and left column are a solid
// black border holding clue labels only; the playing field is the inner
// 9x9, used here directly (source R2C2 is this script's R1C1, etc.).
// BLOCKED cells within that 9x9 hold no digit. Shape widens to 10 values so
// a spare "blank" marker (10) exists to pin them; iss_solution marks these
// cells `.`. Playable cells are restricted back to 1-9.
//
// Two rows (4 and 7) run the full 9-cell width with no clue box anywhere on
// them: nine distinct digits from 1-9 always sum to 45, so no total needs
// printing there. `Cage`'s sum argument treats 0 the same as no sum at all
// (AllDifferent only; see sudoku_builder.js's Cage case), which is used here
// unchanged rather than asserting the unprinted 45.
//
// Two column segments (bottom of column 1, top of column 2) carry no clue
// box at all -- not even an empty divider -- and are not full-length, so no
// total can be inferred by arithmetic either. An "entry" in Kakuro is the
// bounded run of white cells itself (edge/block to edge/block); the printed
// total is a label some -- not all -- entries carry, exactly as rows 4 and 7
// above already show for the Across direction. So these two Down entries are
// encoded the same way: `AllDifferent` with no total.

const shape = new Shape('9x9', 10, 'Raw');
const graph = cellGraph(shape);

// Blocked (non-playable) cells of the inner 9x9, derived from the payload's
// `underlays` layer (final z-order colour per cell, shifted -1 row/-1 col to
// drop the border row/column).
const BLOCKED = [
  'R1C5',
  'R2C3', 'R2C7',
  'R3C3', 'R3C7',
  'R5C4', 'R5C5', 'R5C6',
  'R6C1', 'R6C2', 'R6C8', 'R6C9',
  'R8C3', 'R8C7',
  'R9C3', 'R9C7',
];
const blockedSet = new Set(BLOCKED);
const playable = graph.cells().filter(c => !blockedSet.has(c));

// Each across/down run with a printed total, read from the payload's
// free-floating clue-total overlays (upper-right triangle offset = across,
// lower-left triangle offset = down) attached to the block or border cell
// one step before the run.
const ACROSS = [
  [15, ['R1C1', 'R1C2', 'R1C3', 'R1C4']],
  [27, ['R1C6', 'R1C7', 'R1C8', 'R1C9']],
  [8, ['R2C1', 'R2C2']],
  [8, ['R2C4', 'R2C5', 'R2C6']],
  [8, ['R2C8', 'R2C9']],
  [12, ['R3C1', 'R3C2']],
  [21, ['R3C4', 'R3C5', 'R3C6']],
  [13, ['R3C8', 'R3C9']],
  [10, ['R5C1', 'R5C2', 'R5C3']],
  [19, ['R5C7', 'R5C8', 'R5C9']],
  [16, ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7']],
  [8, ['R8C1', 'R8C2']],
  [8, ['R8C4', 'R8C5', 'R8C6']],
  [8, ['R8C8', 'R8C9']],
  [11, ['R9C1', 'R9C2']],
  [23, ['R9C4', 'R9C5', 'R9C6']],
  [12, ['R9C8', 'R9C9']],
];
const DOWN = [
  [16, ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1']],
  [22, ['R7C2', 'R8C2', 'R9C2']],
  [30, ['R4C3', 'R5C3', 'R6C3', 'R7C3']],
  [26, ['R1C4', 'R2C4', 'R3C4', 'R4C4']],
  [17, ['R6C4', 'R7C4', 'R8C4', 'R9C4']],
  [22, ['R2C5', 'R3C5', 'R4C5']],
  [13, ['R6C5', 'R7C5', 'R8C5', 'R9C5']],
  [10, ['R1C6', 'R2C6', 'R3C6', 'R4C6']],
  [21, ['R6C6', 'R7C6', 'R8C6', 'R9C6']],
  [27, ['R4C7', 'R5C7', 'R6C7', 'R7C7']],
  [17, ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8']],
  [7, ['R7C8', 'R8C8', 'R9C8']],
  [35, ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9']],
  [18, ['R7C9', 'R8C9', 'R9C9']],
];

const cages = [
  ...ACROSS.map(([total, cells]) => new Cage(total, ...cells)),
  ...DOWN.map(([total, cells]) => new Cage(total, ...cells)),
];

// Unclued entries: row 4 and row 7 (full-width, Across) and the bottom of
// column 1 and top of column 2 (Down). Distinctness only, no total.
const uncluedEntries = [
  new AllDifferent('R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new AllDifferent('R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new AllDifferent('R7C1', 'R8C1', 'R9C1'),
  new AllDifferent('R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2'),
];

// Domain stamping: playable cells restricted to 1-9, blocked cells pinned to
// the spare blank marker 10, each as one Replicate over its group so the
// widened range never leaks into a real digit.
const playableDomain = new Replicate(
  [new Given(playable[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(playable, playable[0], graph),
  playable[0],
);
const blockedDomain = new Replicate(
  [new Given(BLOCKED[0], 10)],
  Replicate.encodeTargetCells(BLOCKED, BLOCKED[0], graph),
  BLOCKED[0],
);

return [shape, playableDomain, blockedDomain, ...cages, ...uncluedEntries];
