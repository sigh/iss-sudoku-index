// Title: Hot Girl Summer
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=PNpFh4WQ6KU
// Source: https://tinyurl.com/23b3vvn4

// Normal Sudoku rules apply. Digits must increase from the bulb (first cell)
// to the tip (last cell) of each thermometer.
//
// Givens transcribed from the drawn grid.
//
// Thermometer T5 bends: R4C5 -> R5C6 -> R5C5 -> R5C4 -> R6C5. Consecutive
// cells are king-move (diagonal) adjacent rather than orthogonal; Thermo only
// requires strictly increasing values along the listed cell order, so the
// bend needs no special handling.

return [
  new Shape('9x9'),

  new Given('R1C8', 2),
  new Given('R2C1', 7),
  new Given('R3C3', 4),
  new Given('R3C7', 3),
  new Given('R4C6', 8),
  new Given('R6C4', 3),
  new Given('R7C3', 3),
  new Given('R7C7', 4),
  new Given('R8C9', 3),
  new Given('R9C2', 4),

  new Thermo('R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Thermo('R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'),
  new Thermo('R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'),
  new Thermo('R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2'),
  new Thermo('R4C5', 'R5C6', 'R5C5', 'R5C4', 'R6C5'),
];
