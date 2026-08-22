// Title: Monarch
// Author: grkles
// Video: https://www.youtube.com/watch?v=cuwa2h4BaJA
// Source: https://app.crackingthecryptic.com/sudoku/nbb8rJ69Ht

// Rules encoded:
// - Normal sudoku: 1-9 once per row/column/box (default Shape('9x9') boxes;
//   the payload's `regions` are the standard nine 3x3 boxes, just listed
//   explicitly). No givens inside the grid.
// - On each blue line, digits are a consecutive, non-repeating set (Renban),
//   in any order. Each line also has an off-grid tail drawn purely for the
//   picture, passing through margin cells that hold no digit under any
//   stated rule (not a grid cell, not a real outside clue); only the drawn
//   cells inside the playable grid are constrained, and three lines lie
//   entirely off-grid and get no constraint at all.
//
// Not encoded: the Japanese-sum shading rule ("clues outside the grid show
// the sums of consecutive runs of shaded cells"). Every plausible reading of
// that rule constructed from the drawn geometry -- including a genuine
// disjunction over the unstated stacking order -- turned out jointly
// unsatisfiable together with the Renban lines above, and the puzzle's own
// text and art do not settle the remaining ambiguity well enough to pick a
// reading without fitting it to what happens to solve.

// Blue lines: Renban over each line's in-grid cells only. Cell ids below are
// this puzzle's own sudoku-relative R#C# (row 1 = canvas R6, column 1 =
// canvas C6). Lines fully off-grid (drawn tails only) are omitted -- there
// is nothing left to constrain.
const BLUE_LINES = [
  ['R1C4', 'R2C4', 'R3C4'],
  ['R1C8', 'R2C8', 'R3C9'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R4C1', 'R4C2', 'R5C2'],
  ['R6C1', 'R6C2'],
  ['R8C6', 'R8C7', 'R7C8'],
  ['R8C1', 'R8C2', 'R9C3', 'R9C4'],
];
const blueLineRenbans = BLUE_LINES.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...blueLineRenbans,
];
