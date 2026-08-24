// Title: Euro 2020 Final
// Author: Arlo Lipof
// Video: https://www.youtube.com/watch?v=fa8VDSWp_Dk
// Source: https://app.crackingthecryptic.com/sudoku/4mDGb8QdDP

// Normal sudoku rules apply (rows, columns, boxes all-different -- the
// default 9x9 Shape below). Digits along an arrow sum to the digit in its
// circle, or to the 2-digit number in its pill (two-cell bulb). X marks join
// two orthogonally adjacent cells that sum to 10; the rules state "not all
// X's are given", so the drawn marks are enforced and no negative/exhaustive
// rule is added over unmarked pairs. Digits in a cage do not repeat; a cage's
// sum is enforced only where the source prints a total. Each outside-grid
// clue gives the sum of the short diagonal it points into, from its entry
// cell to where that diagonal leaves the grid. The blue-filled and
// red-filled cells in row 1 (R1C4, R1C6; not adjacent) hold consecutive
// digits -- a rules-text pair, not a drawn dot, so it is encoded as a plain
// difference-of-1 relation rather than a Kropki dot.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Arrows: circle/pill first, then the arm cells, transcribed from the
// source's arrow waypoints (snapped to cell centres) and their paired
// bulb/pill overlay marks.
const arrows = [
  new PillArrow(2, 'R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Arrow('R6C1', 'R7C2'),
  new Arrow('R5C3', 'R4C3', 'R3C4'),
  new Arrow('R6C6', 'R5C5', 'R5C4'),
  new Arrow('R8C3', 'R8C4', 'R7C5'),
  new Arrow('R2C5', 'R2C6', 'R2C7', 'R2C8'),
  new Arrow('R2C9', 'R3C9', 'R4C8'),
  new Arrow('R5C7', 'R6C8', 'R5C9'),
];

// X (sum-to-10) marks, transcribed from the source's edge-text "X" overlay
// entries.
const xMarks = [
  ['R2C3', 'R3C3'],
  ['R2C5', 'R3C5'],
  ['R4C6', 'R5C6'],
  ['R6C5', 'R6C6'],
  ['R6C1', 'R6C2'],
  ['R8C6', 'R8C7'],
  ['R8C8', 'R8C9'],
  ['R2C9', 'R3C9'],
].map(cells => new X(...cells));

// Cages, transcribed from the source's cage cell lists. The last cage prints
// no total, so only all-different is enforced for it.
const cages = [
  new Cage(29, 'R2C4', 'R2C3', 'R2C2', 'R2C1', 'R3C1'),
  new Cage(33, 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
  new Cage(18, 'R2C6', 'R2C7', 'R2C9', 'R2C8', 'R3C9'),
  new Cage(32, 'R4C1', 'R4C2', 'R5C2', 'R6C2', 'R6C1', 'R5C1'),
  new Cage(27, 'R4C8', 'R4C9', 'R5C9', 'R5C8', 'R6C8', 'R6C9'),
  new Cage(22, 'R7C9', 'R8C9', 'R8C8', 'R8C7', 'R8C6'),
  new AllDifferent('R7C1', 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
];

// Outside diagonal sum clues. Each ray starts on the grid edge and runs to
// where the diagonal exits the grid (3 cells each here), per the source's
// off-grid arrow waypoints for these two clues.
const outsideDiagonals = [
  LittleKiller.fromCells(11, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R1C7', 1, 1), geometry),
];

// R1C4/R1C6 consecutive-digit pair (the source's blue/red cell-fill
// underlays). The cells are not adjacent, so WhiteDot (adjacent-only) cannot
// express it; Pair with a plain |a-b|=1 predicate has no adjacency
// requirement.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const consecutivePair = new Pair(
  consecutiveKey, 'r1 blue/red consecutive', 'R1C4', 'R1C6');

return [
  shape,
  ...arrows,
  ...xMarks,
  ...cages,
  ...outsideDiagonals,
  consecutivePair,
];
