// Title: Fully RENdered
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=PJlZT0laKE8
// Source: https://app.crackingthecryptic.com/sudoku/Q8qqFn2HJG

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'), no givens).
// Each cage sums to its printed top-left total and is all-different
// internally (Cage); the one cage with no printed total (R9C3/R8C3/R8C4/R8C5)
// is all-different only, since it has no printed sum to satisfy.
// Each green line is Renban: a consecutive, non-repeating run of digits in
// any order (order-independence is Renban's own semantics, so drawn
// waypoint order is not encoded as a direction).

const cages = [
  new Cage(5, 'R1C5', 'R2C5'),
  new Cage(6, 'R5C1', 'R5C2'),
  new AllDifferent('R9C3', 'R8C3', 'R8C4', 'R8C5'), // no printed total
  new Cage(12, 'R9C5', 'R9C6'),
  new Cage(25, 'R7C5', 'R6C5', 'R5C5', 'R5C6', 'R5C7'),
  new Cage(10, 'R2C6', 'R3C6'),
  new Cage(11, 'R3C9', 'R4C9', 'R5C9', 'R6C9'),
  new Cage(15, 'R7C7', 'R8C7', 'R9C7'),
];

const renbans = [
  new Renban('R1C1', 'R2C2'),
  new Renban('R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Renban('R4C2', 'R3C3', 'R2C4'),
  new Renban('R3C5', 'R4C5', 'R5C6', 'R5C7', 'R5C8'),
  new Renban('R5C3', 'R5C4', 'R6C5', 'R7C5', 'R8C5'),
  new Renban('R8C1', 'R7C2', 'R6C3'),
  new Renban('R9C1', 'R9C2', 'R9C3'),
  new Renban('R3C6', 'R4C7'),
  new Renban('R3C8', 'R2C8', 'R1C8'),
  new Renban('R8C6', 'R7C6', 'R6C7', 'R6C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...renbans,
];
