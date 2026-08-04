// Title: On Yr Goodliffes, Get Set, Go
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=PNpFh4WQ6KU
// Source: https://tinyurl.com/2mcdjed6

// Normal sudoku rules (rows, columns, default 3x3 boxes) apply, plus 16
// killer cages, each a 2-cell domino: digits in a cage don't repeat and sum
// to its printed total. `Cage(sum, ...cells)` enforces both. Cage cells and
// totals below are transcribed from the puzzle's drawn cage geometry.

return [
  new Shape('9x9'),

  new Cage(3, 'R1C1', 'R1C2'),
  new Cage(6, 'R3C3', 'R3C4'),
  new Cage(17, 'R8C1', 'R9C1'),
  new Cage(8, 'R2C2', 'R2C3'),
  new Cage(12, 'R7C2', 'R8C2'),
  new Cage(14, 'R6C3', 'R7C3'),
  new Cage(4, 'R9C8', 'R9C9'),
  new Cage(7, 'R8C7', 'R8C8'),
  new Cage(5, 'R7C6', 'R7C7'),
  new Cage(16, 'R1C9', 'R2C9'),
  new Cage(13, 'R2C8', 'R3C8'),
  new Cage(15, 'R3C7', 'R4C7'),
  new Cage(11, 'R4C6', 'R5C6'),
  new Cage(9, 'R6C5', 'R6C6'),
  new Cage(12, 'R4C4', 'R4C5'),
  new Cage(6, 'R5C4', 'R6C4'),
];
