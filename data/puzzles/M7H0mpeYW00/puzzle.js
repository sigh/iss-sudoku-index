// Title: Box Killer sudoku
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=M7H0mpeYW00
// Source: https://app.crackingthecryptic.com/webapp/QmPQnPpPQB

// Normal sudoku rules apply. Digits do not repeat within a cage (killer
// cages, no printed total). Within every 3x3 box, every cage drawn in that
// box sums to the same total, and that common total differs from every
// other box's; no totals are printed anywhere -- they are deduced. Cells not
// covered by any drawn cage carry no cage constraint.
//
// Modeling: each cage's total is unknown, so a fixed Cage total cannot
// express "same sum" -- tie every cage's cell sum instead to one shared
// per-box Var (BS1..BS9, one per box in row-major box order). Cages in the
// same box sharing that Var *is* "same sum"; AllDifferent over the 9 Vars is
// "unique sum per box". This puzzle's smallest cages (single cells, size-2
// pairs) bound every box's common sum to 3-17 (a lone 2-cell cage ranges
// 3-17; box 4's 5-cell cage narrows its own box to 15-17), so each Var is
// stored shifted down by SHIFT so it fits alongside the grid's 1-9 digit
// alphabet in one widened value range -- a Sudoku-type Shape caps its
// alphabet at 16 values, and 1-9 union 1-17 would need 17.

const SHIFT = 2; // true sum - SHIFT; true sums run 3-17, so stored values run 1-15
const MAX_VALUE = 15; // widened alphabet: covers grid digits 1-9 and shifted sums 1-15

const graph = cellGraph('9x9');

// cagesByBox[boxIndex] lists that box's cages as cell-id arrays, boxIndex
// 0-8 in row-major box order (box r*3+c), transcribed from the puzzle's
// drawn cage geometry (cell coordinates converted to 1-indexed R#C# ids).
const cagesByBox = [
  // box 0 (R1-3,C1-3)
  [['R1C1', 'R1C2'], ['R1C3', 'R2C3'], ['R2C2', 'R3C2'], ['R3C1']],
  // box 1 (R1-3,C4-6)
  [['R1C4', 'R2C4', 'R3C4'], ['R1C5', 'R1C6', 'R2C6'], ['R2C5', 'R3C5']],
  // box 2 (R1-3,C7-9)
  [['R1C7', 'R1C8', 'R1C9'], ['R2C7', 'R3C7'], ['R2C8', 'R2C9', 'R3C9', 'R3C8']],
  // box 3 (R4-6,C1-3)
  [['R4C3', 'R4C2'], ['R5C1', 'R5C2'], ['R6C1', 'R6C2'], ['R5C3', 'R6C3']],
  // box 4 (R4-6,C4-6)
  [['R5C4', 'R6C4'], ['R4C5', 'R5C5', 'R6C5', 'R6C6', 'R5C6']],
  // box 5 (R4-6,C7-9)
  [['R6C7', 'R5C7', 'R5C8', 'R4C8'], ['R4C9', 'R5C9']],
  // box 6 (R7-9,C1-3)
  [['R8C1', 'R8C2']],
  // box 7 (R7-9,C4-6)
  [['R9C4'], ['R8C4', 'R8C5'], ['R7C5', 'R7C4'], ['R7C6', 'R8C6']],
  // box 8 (R7-9,C7-9)
  [['R7C7', 'R7C8'], ['R8C7', 'R8C8', 'R9C8'], ['R7C9', 'R8C9', 'R9C9']],
];

// One Var per box (9 total); its domain is the widened Shape alphabet above,
// not this count -- the count argument is how many BS# cells to create.
const boxSum = new Var('BS', 'box cage sum (shifted down by SHIFT)', 9);

const cageConstraints = cagesByBox.flatMap((cages, boxIndex) => cages.flatMap(cells => {
  // cell sum - boxSum(box) = SHIFT, i.e. boxSum = cell sum - SHIFT.
  const tieToBoxSum = new Sum(
    SHIFT, [boxSum.cell(boxIndex + 1), -1], ...cells.map(cell => [cell, 1]));
  return cells.length >= 2
    ? [new AllDifferent(...cells), tieToBoxSum]
    : [tieToBoxSum];
}));

return [
  new Shape('9x9', MAX_VALUE),
  // Restrict the widened alphabet back to real digits on every playable cell.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  boxSum,
  new AllDifferent(...boxSum.cells()),
  ...cageConstraints,
];
