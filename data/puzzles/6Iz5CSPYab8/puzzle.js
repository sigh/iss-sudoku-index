// Title: Flying Arrows
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=6Iz5CSPYab8
// Source: https://app.crackingthecryptic.com/sudoku/N2HF9P62qF

// Standard sudoku (standard 3x3 box regions).
// Each arrow: digits along the arm sum to the digit in the circled bulb cell
// (Arrow's first argument). Repeats along an arm are permitted since no
// other rule forbids them; Arrow does not itself add an all-different
// constraint. One bulb (R4C9) anchors two separate arrows.
const arrows = [
  new Arrow('R1C2', 'R2C1', 'R3C1', 'R4C1'),
  new Arrow('R1C4', 'R2C4', 'R1C5'),
  new Arrow('R1C6', 'R2C7', 'R2C8'),
  new Arrow('R2C5', 'R2C6', 'R1C7'),
  new Arrow('R4C9', 'R3C8', 'R3C7'),
  new Arrow('R4C9', 'R5C9', 'R6C9', 'R5C8'),
  new Arrow('R6C7', 'R7C6', 'R8C6'),
  new Arrow('R7C9', 'R8C8', 'R8C7', 'R8C6'),
  new Arrow('R8C9', 'R9C8', 'R9C7', 'R9C6'),
  new Arrow('R9C4', 'R8C3'),
  new Arrow('R7C2', 'R6C1'),
  new Arrow('R6C3', 'R5C4', 'R5C5', 'R5C6'),
  new Arrow('R4C3', 'R4C2', 'R5C2'),
  new Arrow('R3C4', 'R2C3'),
];

return [
  new Shape('9x9'),
  ...arrows,
];
