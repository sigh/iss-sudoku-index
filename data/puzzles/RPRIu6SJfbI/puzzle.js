// Title: Erbium
// Author: G
// Video: https://www.youtube.com/watch?v=RPRIu6SJfbI
// Source: https://app.crackingthecryptic.com/sudoku/BN4DmbjQ8L

// Rules: normal sudoku; digits in each cage sum to the cage's total; digits
// along an arrow sum to the digit in that arrow's circle. The rules do not
// state cages forbid repeated digits, so they are encoded with Sum (repeats
// allowed) rather than Cage -- every cage here also lies entirely inside one
// box, so box all-different already forbids repeats regardless of the class
// used.

return [
  new Shape('9x9'),

  // Cages: cells (top-left corner comment) from the drawn cage geometry.
  new Sum(21, 'R2C2', 'R2C3', 'R3C3', 'R3C2'),
  new Sum(23, 'R7C2', 'R7C3', 'R8C2', 'R8C3'),
  new Sum(13, 'R2C5', 'R2C6'),
  new Sum(13, 'R2C4', 'R3C4'),
  new Sum(19, 'R5C4', 'R5C5', 'R6C4', 'R6C5'),
  new Sum(21, 'R7C7', 'R7C8', 'R8C8', 'R8C7'),
  new Sum(12, 'R6C7', 'R6C8'),
  new Sum(12, 'R4C8', 'R5C8'),

  // Arrows: first cell is the circled cell (Arrow's start marker), whose
  // value equals the sum of the remaining line cells.
  new Arrow('R3C5', 'R4C4', 'R4C3', 'R5C3'),
  new Arrow('R4C1', 'R5C1', 'R6C1'),
  new Arrow('R9C6', 'R9C5', 'R9C4'),
  new Arrow('R5C7', 'R6C6', 'R7C6', 'R7C5'),
  new Arrow('R2C8', 'R3C7', 'R4C6'),
  new Arrow('R2C7', 'R1C6', 'R1C5', 'R1C4'),
  new Arrow('R3C8', 'R4C9', 'R5C9', 'R6C9'),
];
