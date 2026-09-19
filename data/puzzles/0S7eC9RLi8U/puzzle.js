// Title: Renban Arrow Sudoku
// Author: udukos
// Video: https://www.youtube.com/watch?v=0S7eC9RLi8U
// Source: https://test.crackingthecryptic.com/sudoku/QFg6f67Ppd

// Normal sudoku rules apply (rows, columns and 3x3 boxes all different,
// standard Shape defaults). No givens. Digits along each arrow sum to the
// digit in that arrow's circle -- the circle cell is listed first, per
// Arrow's bulb-first argument order. The green lines are renban lines: each
// one holds a set of consecutive, non-repeating digits in any order.

return [
  new Shape('9x9'),

  new Arrow('R7C1', 'R6C2', 'R5C2', 'R4C2'),
  new Arrow('R7C9', 'R6C8', 'R5C8', 'R4C8'),
  new Arrow('R7C6', 'R6C7'),
  new Arrow('R7C4', 'R6C3'),

  new Renban('R5C4', 'R6C4'),
  new Renban('R5C5', 'R6C5'),
  new Renban('R6C6', 'R5C6', 'R5C7', 'R4C7'),
  new Renban('R5C9', 'R6C9'),
  new Renban('R9C3', 'R9C2', 'R9C1', 'R8C2', 'R7C2', 'R7C3'),
  new Renban('R7C4', 'R7C5', 'R8C5', 'R9C4', 'R9C5', 'R9C6'),
  new Renban('R7C7', 'R7C8', 'R8C8', 'R9C9', 'R9C8', 'R9C7'),
  new Renban('R4C5', 'R3C6'),
  new Renban('R3C7', 'R3C8', 'R2C8'),
  new Renban('R1C4', 'R2C4', 'R2C5', 'R2C6', 'R1C6'),
  new Renban('R2C3', 'R3C4'),
  new Renban('R2C1', 'R3C1'),
  new Renban('R2C2', 'R3C2', 'R3C3'),
];
