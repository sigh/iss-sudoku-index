// Title: Serial Killer Sudoku
// Author: BobertJoe
// Video: https://www.youtube.com/watch?v=7rWapqxtX9U
// Source: https://app.crackingthecryptic.com/sudoku/QmmLfpNBtm

// Normal sudoku rules apply (default 9x9 boxes, confirmed against the
// payload's own `regions` array). 21 cages tile the grid; each shows the
// sum of its digits. Ordinary killer cages forbid repeats -- here the rule
// is inverted: each cage must contain at least one repeated digit, UNLESS
// normal sudoku rules already forbid any repeat in that cage (i.e. every
// pair of its cells already shares a row, column, or box). So every cage
// gets a `Sum` (no built-in all-different), and any cage with at least one
// "free" cell pair -- a pair sharing no row, column, or box, so a repeat
// there is actually possible -- additionally requires at least one of its
// free pairs to hold equal digits. Cage-equal is expressed as
// `SameValues(2, a, b)`, forcing that pair's two singleton sets to match.
// A cage with no free pairs needs no extra constraint: normal sudoku
// already forces its digits distinct.
// One grey circle overlay (R4C4) marks an odd digit -- no `Odd` class
// exists in ISS, so it is a multi-value `Given` over the odd digits.

// Cage table: [total, cells, freePairs]. Cells and totals are transcribed
// from the puzzle's own drawn cage geometry; freePairs is derived by
// checking every cell pair in the cage against row/column/box sharing.
const cages = [
  [21, ['R1C1', 'R1C2', 'R1C3', 'R1C4'], []],
  [12, ['R1C5', 'R2C3', 'R2C4', 'R2C5'], [['R1C5', 'R2C3']]],
  [32, ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'], [['R1C6', 'R2C9']]],
  [14, ['R2C1', 'R2C2', 'R3C2'], []],
  [26, ['R2C6', 'R2C7', 'R2C8', 'R3C8'], [['R2C6', 'R3C8']]],
  [27, ['R3C1', 'R4C1', 'R4C2', 'R5C1'], [['R3C1', 'R4C2']]],
  [13, ['R3C3', 'R4C3', 'R5C2', 'R5C3'], [['R3C3', 'R5C2']]],
  [22, ['R3C4', 'R3C5', 'R4C4', 'R4C5'], [['R3C4', 'R4C5'], ['R3C5', 'R4C4']]],
  [6, ['R3C6', 'R3C7', 'R4C6', 'R4C7'], [['R3C6', 'R4C7'], ['R3C7', 'R4C6']]],
  [46,
    ['R3C9', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
    [['R3C9', 'R4C8'], ['R3C9', 'R5C7'], ['R3C9', 'R5C8'], ['R3C9', 'R6C7'],
      ['R3C9', 'R6C8']]],
  [23, ['R5C5', 'R5C6', 'R6C5', 'R7C5'], [['R5C6', 'R7C5']]],
  [9, ['R5C4', 'R6C4'], []],
  [18, ['R6C1', 'R6C2', 'R6C3'], []],
  [17, ['R7C1', 'R8C1', 'R9C1'], []],
  [14, ['R7C2', 'R7C3', 'R8C2', 'R9C2'], []],
  [31, ['R7C4', 'R8C3', 'R8C4', 'R9C3'],
    [['R7C4', 'R8C3'], ['R7C4', 'R9C3'], ['R8C4', 'R9C3']]],
  [7, ['R8C5', 'R9C4', 'R9C5'], []],
  [20, ['R6C6', 'R7C6', 'R7C7', 'R7C8'], [['R6C6', 'R7C7'], ['R6C6', 'R7C8']]],
  [20, ['R7C9', 'R8C9', 'R9C8', 'R9C9'], []],
  [17, ['R8C6', 'R9C6', 'R9C7'], [['R8C6', 'R9C7']]],
  [10, ['R8C7', 'R8C8'], []],
];

const sums = cages.map(([total, cells]) => new Sum(total, ...cells));

const repeatRules = cages
  .filter(([, , freePairs]) => freePairs.length > 0)
  .map(([, , freePairs]) => new Or(
    freePairs.map(([a, b]) => new SameValues(2, a, b))));

return [
  new Shape('9x9'),
  new Given('R4C4', 1, 3, 5, 7, 9),
  ...sums,
  ...repeatRules,
];
