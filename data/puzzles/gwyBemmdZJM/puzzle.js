// Title: Illithid
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=gwyBemmdZJM
// Source: https://app.crackingthecryptic.com/sudoku/M7Q2pGBFQf

// Standard sudoku rules (rows, columns, boxes all-different, given by the
// default 9x9 Shape) plus 16 killer cages: digits in a cage sum to its
// printed total (top-left) and cannot repeat within the cage. One cage (the
// last one below) has no printed total; the rules' "(if given)" clause means
// it is still a no-repeat cage, just without a sum, so it is encoded as
// AllDifferent rather than Cage.

const cagesWithSum = [
  [5, 'R1C1', 'R1C2'],
  [10, 'R2C3', 'R3C3'],
  [13, 'R3C1', 'R4C1'],
  [12, 'R5C1', 'R6C1', 'R6C2', 'R5C2'],
  [25, 'R7C1', 'R8C1', 'R9C1', 'R8C2', 'R9C2', 'R9C3'],
  [15, 'R6C3', 'R7C3', 'R7C4'],
  [12, 'R8C4', 'R8C5', 'R9C4', 'R9C5'],
  [19, 'R8C8', 'R9C8', 'R9C7'],
  [5, 'R8C9', 'R9C9'],
  [17, 'R6C8', 'R6C9', 'R7C9'],
  [12, 'R5C8', 'R5C7'],
  [12, 'R2C9', 'R3C9', 'R4C9', 'R4C8'],
  [12, 'R1C6', 'R2C6', 'R1C7', 'R1C8'],
  [9, 'R2C5', 'R3C5'],
  [14, 'R6C4', 'R6C5', 'R7C5'],
];

// No-total cage: a 9-cell cross spanning column 6 (rows 3-7) and row 4
// (columns 3-7), overlapping at R4C6.
const noTotalCageCells = [
  'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6',
  'R4C7', 'R4C5', 'R4C4', 'R4C3',
];

return [
  new Shape('9x9'),
  ...cagesWithSum.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new AllDifferent(...noTotalCageCells),
];
