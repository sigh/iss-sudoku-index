// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pCXG6B20I2w
// Source: https://app.crackingthecryptic.com/bH8FJtL3F3

// Rules: Normal sudoku rules apply. Digits may not repeat in a cage and must
// sum to the given total.
// The grid has no givens and its nine regions are the standard 3x3 boxes, so
// rows, columns and boxes come from the solver baseline.
//
// The 29 cages tile all 81 cells exactly once, so their totals must add up to
// 9 x (1+2+...+9) = 405. The printed totals add up to 406, so one of them is
// mis-printed and the source does not say which. This encoding therefore does
// not enforce the 29 printed totals as printed; see the Or construction below.

// Cage table: [printed total, ...cells], from the drawn cage outlines and the
// total printed in each cage's top-left cell.
const cages = [
  [34, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  [19, 'R1C3', 'R1C4', 'R2C4'],
  [13, 'R1C6', 'R1C5', 'R2C5'],
  [13, 'R1C7', 'R2C7', 'R2C6'],
  [4, 'R1C8', 'R1C9'],
  [17, 'R2C8', 'R2C9'],
  [3, 'R3C1', 'R4C1'],
  [16, 'R3C3', 'R3C4', 'R3C5'],
  [18, 'R3C6', 'R3C7', 'R4C7', 'R4C8'],
  [6, 'R3C8', 'R3C9'],
  [12, 'R4C2', 'R4C3'],
  [11, 'R4C4', 'R5C4'],
  [19, 'R4C6', 'R4C5', 'R5C5', 'R6C5', 'R6C4'],
  [15, 'R5C6', 'R6C6'],
  [9, 'R5C7', 'R5C8'],
  [14, 'R6C7', 'R6C8'],
  [14, 'R4C9', 'R5C9'],
  [10, 'R6C9', 'R7C9'],
  [12, 'R5C1', 'R6C1'],
  [10, 'R5C2', 'R5C3'],
  [17, 'R6C2', 'R6C3', 'R7C3', 'R7C4'],
  [16, 'R7C5', 'R7C6', 'R7C7'],
  [10, 'R7C1', 'R7C2'],
  [13, 'R8C1', 'R8C2'],
  [8, 'R9C1', 'R9C2'],
  [13, 'R8C3', 'R9C3', 'R8C4'],
  [20, 'R8C5', 'R9C5', 'R9C4'],
  [11, 'R8C6', 'R9C6', 'R9C7'],
  [29, 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

// Digits may not repeat in a cage: this holds for every cage whatever its total.
const noRepeats = cages.map(([, ...cells]) => new AllDifferent(...cells));

// Totals. Reading: exactly one printed total is wrong, and the rest are right.
// Each cage is allowed its printed total or that total minus one; the tiling
// then forces exactly one cage to take the reduced value, because the 29 cage
// sums always add to 405 while the printed totals add to 406. So this is the
// disjunction over which single cage carries the mis-printed total, with no
// choice made between the 29 candidates. It is weaker than the setter's 29
// totals: the cage that takes the reduced value is unconstrained by its own
// printed clue.
// Sum, not Cage, because the no-repeat half is already stated above.
const totals = cages.map(([total, ...cells]) => new Or([
  new Sum(total, ...cells),
  new Sum(total - 1, ...cells),
]));

return [
  new Shape('9x9'),
  ...noRepeats,
  ...totals,
];
