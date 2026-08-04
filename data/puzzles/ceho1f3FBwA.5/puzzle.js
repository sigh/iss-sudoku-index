// Title: 5/13/23: Knapp Daneben Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=ceho1f3FBwA
// Source: https://tinyurl.com/mfjhrjde

// Normal sudoku rules apply. Every cage (including the four single-cell
// cages below) must sum to the printed total minus one or the printed total
// plus one -- never the printed total itself. Cage cells do not repeat, but
// every two-cell cage here lies entirely within one row or one column (see
// the per-cage comments), so that is already implied by the default row/
// column all-different rules and needs no separate constraint.

// Off-by-one sum key, memoized per total so cages sharing a total reuse one
// key. fnToKey's default valueOffset (0) makes fn receive actual digit
// values 1-9 directly.
const offByOneKeys = {};
const offByOneKey = (total) => (offByOneKeys[total] ??= Pair.fnToKey(
  (a, b) => a + b === total - 1 || a + b === total + 1, 9));

// Two-cell cages: [cellA, cellB, printedTotal], transcribed from the drawn
// cage geometry.
const twoCellCages = [
  ['R1C1', 'R1C2', 2],   // row 1
  ['R1C3', 'R1C4', 6],   // row 1
  ['R1C5', 'R1C6', 10],  // row 1
  ['R1C7', 'R1C8', 14],  // row 1
  ['R1C9', 'R2C9', 9],   // column 9
  ['R3C9', 'R4C9', 4],   // column 9
  ['R9C8', 'R9C9', 9],   // row 9
  ['R9C6', 'R9C7', 3],   // row 9
  ['R9C4', 'R9C5', 8],   // row 9
  ['R9C2', 'R9C3', 12],  // row 9
  ['R8C1', 'R9C1', 10],  // column 1
  ['R6C1', 'R7C1', 6],   // column 1
  ['R4C1', 'R5C1', 10],  // column 1
  ['R2C1', 'R3C1', 14],  // column 1
  ['R3C4', 'R3C5', 10],  // row 3
  ['R7C5', 'R7C6', 10],  // row 7
  ['R5C9', 'R6C9', 8],   // column 9
  ['R7C9', 'R8C9', 12],  // column 9
];

const cages = twoCellCages.map(([a, b, total]) =>
  new Pair(offByOneKey(total), `cage ${total}`, a, b));

// Single-cell cages: a lone cell's "sum" is just its own digit, so the rule
// restricts it to exactly two candidates (total-1, total+1) and forbids the
// printed total itself. Transcribed from the four drawn single-cell cages.
const singleCellCages = [
  new Given('R7C3', 2, 4),  // total=3
  new Given('R3C3', 4, 6),  // total=5
  new Given('R3C7', 1, 3),  // total=2
  new Given('R7C7', 3, 5),  // total=4
];

return [
  new Shape('9x9'),

  new Given('R2C5', 7),
  new Given('R5C2', 8),
  new Given('R5C8', 7),
  new Given('R8C5', 6),

  ...cages,
  ...singleCellCages,
];
