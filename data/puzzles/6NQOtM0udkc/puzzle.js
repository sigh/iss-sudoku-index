// Title: Kashmir
// Author: lerroyy
// Video: https://www.youtube.com/watch?v=6NQOtM0udkc
// Source: https://tinyurl.com/5n7hnwkj

// Standard Sudoku is implicit (row/column/box all-different from
// Shape('9x9')). No givens. The payload's single `diagonal+` marks the
// anti-diagonal (R1C9..R9C1) as all-different, per "digits cannot repeat
// along the indicated diagonal." Eleven killer cages: digits sum to the
// printed top-left total and cannot repeat within a cage (Cage() enforces
// both).

// Cages, transcribed from the drawn `killercage` entries (top-left cell
// first, matching the printed total's position).
const cages = [
  new Cage(25, 'R6C2', 'R7C1', 'R7C2', 'R8C1'),
  new Cage(25, 'R8C3', 'R8C4', 'R9C2', 'R9C3'),
  new Cage(25, 'R1C7', 'R1C8', 'R2C6', 'R2C7'),
  new Cage(25, 'R2C9', 'R3C8', 'R3C9', 'R4C8'),
  new Cage(10, 'R5C5', 'R5C6', 'R6C5'),
  new Cage(22, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(22, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(10, 'R1C4', 'R2C4'),
  new Cage(13, 'R2C1', 'R3C1'),
  new Cage(9, 'R6C7', 'R6C8'),
  new Cage(9, 'R6C6', 'R7C6'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages,
];
