// Title: X is Still Alive!
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=_Wl7-x2Va6U
// Source: https://cracking-the-cryptic.web.app/sudoku/MR8DnQTbGQ
//
// Normal sudoku rules apply (standard 3x3 boxes). 16 cages are drawn with no
// printed totals. Digits do not repeat within a cage (AllDifferent). Every
// cage's sum ends in the same digit X, which the solver must also determine.
//
// The grid is widened to alphabet 0-9 so an auxiliary "ones digit" Var (X)
// can hold 0; every real grid cell is then restricted back to 1-9. For each
// cage, cellsSum - 10*tens - X = 0 (a coefficient Sum, one aux "tens" Var per
// cage) forces X to be that cage's sum's units digit -- unique because X's
// domain is 0-9 and cage sums never reach 100. X itself is shared by every
// cage, which is the "same digit X" rule.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

const cages = [
  ['R3C1', 'R4C1'],
  ['R5C1', 'R6C2', 'R7C1', 'R6C1'],
  ['R9C1', 'R8C1', 'R8C2', 'R7C2'],
  ['R8C4', 'R8C3', 'R9C3'],
  ['R7C4', 'R7C3', 'R6C3'],
  ['R9C4', 'R9C5'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5'],
  ['R3C4', 'R3C5'],
  ['R1C5', 'R1C6'],
  ['R1C7', 'R2C7', 'R2C6'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R1C9', 'R2C9', 'R2C8', 'R3C8'],
  ['R3C9', 'R4C9', 'R4C8', 'R5C9'],
  ['R6C9', 'R7C9'],
  ['R7C5', 'R7C6'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C6'],
];

const givens = [
  ['R1C1', 3], ['R1C4', 6], ['R1C8', 5],
  ['R2C1', 4], ['R2C5', 8],
  ['R4C3', 6],
  ['R5C4', 1], ['R5C6', 9],
  ['R6C7', 1],
  ['R8C5', 4], ['R8C9', 6],
  ['R9C2', 1], ['R9C6', 6], ['R9C9', 3],
].map(([cell, v]) => new Given(cell, v));

// The widened Shape allows 0-9; every real grid cell is a normal 1-9 sudoku
// digit, stamped as one Replicate template over the whole grid (givens below
// narrow individual cells further -- Givens intersect).
const gridCells = graph.cells();
const digitsOnly = new Replicate(
  [new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
  gridCells[0],
);

const lastDigit = new Var('X', 'shared last digit of every cage sum', 1);
const tens = new Var('T', 'per-cage tens digit of the cage sum', cages.length);

const cageAllDifferent = cages.map(cells => new AllDifferent(...cells));
const cageSameLastDigit = cages.map((cells, i) => new Sum(
  0,
  ...cells,
  [tens.cell(i + 1), -10],
  [lastDigit.cell(1), -1],
));

return [
  shape,
  digitsOnly,
  ...givens,
  lastDigit,
  tens,
  ...cageAllDifferent,
  ...cageSameLastDigit,
];
