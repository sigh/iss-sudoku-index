// Title: Tangram Killer
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=ixsj1q4BVN8
// Source: https://sudokupad.app/zmgcavpoxu

// Normal Sudoku rules apply. No givens.
//
// Digits in a cage sum to the number in its corner. Cells that half-appear in a
// cage only contribute half their value to its sum. Digits appear at most once
// in the same cage (half-appearing twice counts as appearing once).
//
// The cages are tangram polygons: their edges run along grid lines or along
// cell diagonals, so each cage covers some cells wholly and cuts others exactly
// in half. "Half-appear" is that geometric half.

// Transcribed from the thirteen dashed outlines and the number in each
// outline's corner marker. `full` are the cells the polygon covers wholly,
// `half` the cells it covers exactly half of.
const cages = [
  { total: 7, full: ['R1C1'], half: ['R1C2'] },
  { total: 5, full: ['R9C1'], half: ['R9C2'] },
  { total: 7, full: ['R1C4', 'R2C6'], half: ['R1C5', 'R2C5'] },
  { total: 31, full: ['R1C8', 'R1C9', 'R2C9'], half: ['R1C7', 'R2C8', 'R3C9'] },
  { total: 2, full: ['R6C4'], half: ['R6C5'] },
  { total: 13, full: ['R8C4', 'R9C4'], half: ['R8C5', 'R9C5'] },
  { total: 12, full: ['R3C2', 'R3C3'], half: ['R3C4', 'R4C2'] },
  { total: 9, full: ['R5C2'], half: ['R4C2', 'R6C2'] },
  { total: 10, full: ['R8C7'], half: ['R8C6'] },
  { total: 12, full: ['R6C3'], half: ['R6C2', 'R7C2', 'R7C3'] },
  { total: 17, full: ['R4C5', 'R5C5'], half: ['R6C5'] },
  { total: 13, full: ['R5C7'], half: ['R5C8'] },
  { total: 2, full: [], half: ['R7C9', 'R8C9'] },
];

// Doubled so the half-cells get an integer coefficient:
// 2*(whole digits) + 1*(half digits) = 2*total.
const totals = cages.map(({ total, full, half }) =>
  new Sum(2 * total, ...full.map(c => [c, 2]), ...half));

// "at most once", counting a whole cell as one appearance and a half cell as
// half of one: whole cells of a cage are pairwise distinct, and no half cell
// may match a whole cell of the same cage. Two half cells of one cage may
// share a digit (2 x 1/2 = one appearance). Three equal half cells would be
// 1.5 appearances, but the only cages with three half cells are the 31
// (R1C7/R2C8/R3C9, all in box 3) and the lower 12 (R6C2/R7C2 share column 2),
// so Sudoku already forbids it.
const distinct = cages.flatMap(({ full, half }) => [
  ...(full.length > 1 ? [new AllDifferent(...full)] : []),
  ...full.flatMap(f => half.map(h => new AllDifferent(f, h))),
]);

return [
  new Shape('9x9'),
  ...totals,
  ...distinct,
];
