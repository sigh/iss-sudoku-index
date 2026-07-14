// Title: Bidirectional
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=rDcI3i-LXs8
// Source: https://sudokupad.app/o6x08u2omv

// Normal sudoku rules apply (default row/column/box all-different from Shape).
//
// Seven arrows have a plain single-cell bulb: the sum of the three non-bulb
// arm cells equals the bulb digit.
//
// One arrow (R6C8 -> R5C7 -> R4C6 -> R3C5) has its bulb spread across two
// cells: R6C8, the arrow's own circle cell (as with the other seven arrows,
// not itself summed), and R6C9, immediately to its right and off the arrow's
// path. Read left to right they form the two-digit total of the other three
// arm cells.
//
// One dot, between R7C5 and R8C5, marks those two cells as not consecutive.
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  new Arrow('R1C1', 'R2C2', 'R3C3', 'R4C4'),
  new Arrow('R2C1', 'R3C2', 'R4C3', 'R5C4'),
  new Arrow('R5C1', 'R6C2', 'R7C3', 'R8C4'),
  new Arrow('R4C1', 'R5C2', 'R6C3', 'R7C4'),
  new Arrow('R8C8', 'R7C7', 'R6C6', 'R5C5'),
  new Arrow('R7C8', 'R6C7', 'R5C6', 'R4C5'),
  new Arrow('R4C8', 'R3C7', 'R2C6', 'R1C5'),

  new PillArrow(2, 'R6C8', 'R6C9', 'R5C7', 'R4C6', 'R3C5'),

  new Pair(notConsecutive, 'not consecutive', 'R7C5', 'R8C5'),
];
