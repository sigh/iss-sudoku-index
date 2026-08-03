// Title: This Is It. I've Done It.
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=ERZB1hH72H4
// Source: https://app.crackingthecryptic.com/sudoku/h9L7pNhF76

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9') below; the drawn regions are the standard 3x3 boxes).
// Cages: sum to the shown total, no repeated digit within a cage (Cage).
// Arrows: digits along the arrow sum to the digit in the circled cell
// (Arrow takes the circle cell first, then the arm cells).
// White dots: the two joined cells hold consecutive digits (WhiteDot).

const cages = [
  new Cage(11, 'R5C1', 'R5C2', 'R6C1'),
  new Cage(13, 'R4C9', 'R5C8', 'R5C9'),
  new Cage(16, 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(20, 'R4C3', 'R5C3', 'R5C4', 'R6C4'),
  new Cage(21, 'R4C6', 'R5C6', 'R5C7', 'R6C7'),
  new Cage(16, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
];

const arrows = [
  new Arrow('R4C1', 'R3C2', 'R2C2'),
  new Arrow('R4C4', 'R3C5', 'R2C5'),
  new Arrow('R4C7', 'R3C8', 'R2C8'),
  new Arrow('R6C3', 'R7C2', 'R8C2'),
  new Arrow('R6C6', 'R7C5', 'R8C5'),
  new Arrow('R6C9', 'R7C8', 'R8C8'),
];

const whiteDots = [
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R8C7', 'R9C7'),
];

return [
  new Shape('9x9'),
  new Given('R5C5', 7),
  ...cages,
  ...arrows,
  ...whiteDots,
];
