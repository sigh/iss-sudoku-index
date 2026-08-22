// Title: Prickly Pear
// Author: Sumanta Mukherjee ('Anu')
// Video: https://www.youtube.com/watch?v=3AMvNF7A2B0
// Source: https://app.crackingthecryptic.com/sudoku/LHJg42qh9B

// Normal sudoku rules apply (default row/column/box all-different, 9x9).
// Arrow: digits along the arrow sum to the digit in the circle (Arrow's
// first cell is the circle, the rest are the arrow's arm).
// Cage: digits sum to the cage's total; Cage also forbids repeats within it.
// Diagonal: the marked anti-diagonal (bottom-left to top-right) has no
// repeated digits.
// Inequality: the chevron between two cells points at the lower digit
// (GreaterThan(a, b) means a > b).

const arrows = [
  // Corner circles, each feeding two arrows (row arm + column arm).
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C1', 'R2C1', 'R3C1'),
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R9C9', 'R8C9', 'R7C9'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  // Bent arrows near the centre (bend cell taken from the wayPoints vertex).
  new Arrow('R4C4', 'R4C3', 'R3C3'),
  new Arrow('R6C6', 'R6C7', 'R7C7'),
];

const cages = [
  new Cage(27, 'R2C5', 'R2C6', 'R3C5', 'R3C6'),
  new Cage(11, 'R4C2', 'R4C3', 'R5C2', 'R5C3'),
  new Cage(24, 'R7C4', 'R7C5', 'R8C4', 'R8C5'),
  new Cage(13, 'R5C7', 'R5C8', 'R6C7', 'R6C8'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...cages,
  // direction=1 is the '/' diagonal (bottom-left to top-right), matching the
  // drawn line's endpoints R9C1..R1C9.
  new Diagonal(1),
  // Two chevrons; apex cell (nearer, per wayPoints) is the lower digit.
  new GreaterThan('R5C2', 'R4C2'),
  new GreaterThan('R6C7', 'R6C8'),
];
