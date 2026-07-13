// Title: Seven Ate Nine
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=NvZ9HNCpeyM
// Source: https://sudokupad.app/dnu167bzhz

// Normal sudoku rules apply, and all clues are standard.
// Cage: the sum of the digits inside the cage equals the small number in
// its top-left corner (also enforces all-different within the cage, per
// the Cage class semantics).
// Arrows: the sum of the digits along an arrow equals the digit in the
// connected circle. R7C7 is a hub cell carrying five separate arrows.
// White dots: digits in cells separated by a white dot are consecutive.

return [
  new Shape('9x9'),
  // --- Cage: 24 in the top-left three cells (R1C1, R1C2, R2C1). ---
  new Cage(24, 'R1C1', 'R1C2', 'R2C1'),
  // --- Arrows: bulb cell first, then arm cells the arm digits sum to. ---
  new Arrow('R3C3', 'R4C4', 'R5C5', 'R6C6'),
  new Arrow('R1C7', 'R1C6', 'R2C6', 'R3C6'),
  new Arrow('R7C1', 'R6C1', 'R6C2', 'R6C3'),
  new Arrow('R7C5', 'R7C4', 'R8C4', 'R9C4'),
  new Arrow('R5C7', 'R4C7', 'R4C8', 'R4C9'),
  // Five separate arrows sharing the R7C7 hub cell as their circle.
  new Arrow('R7C7', 'R8C6'),
  new Arrow('R7C7', 'R6C8'),
  new Arrow('R7C7', 'R8C7', 'R9C7'),
  new Arrow('R7C7', 'R7C8', 'R7C9'),
  new Arrow('R7C7', 'R8C8', 'R9C9'),
  // --- White dots: consecutive digits. ---
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R1C3', 'R1C4'),
  new WhiteDot('R3C4', 'R3C5'),
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R8C4', 'R8C5'),
];
