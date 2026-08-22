// Title: Oddly Even Arrows
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=kkJp-cw1s_c
// Source: https://app.crackingthecryptic.com/sudoku/8GMb8g7fjj

// Normal sudoku rules apply (standard 3x3 boxes; no givens).
// Grey-circle cells must hold an odd digit, grey-square cells an even digit:
// there is no Odd/Even class, so each is a candidate-restricting Given.
// Each arrow's bulb cell equals the sum of the digits on its arm.

return [
  new Shape('9x9'),

  // Odd cells (opaque grey circle overlay)
  new Given('R5C6', 1, 3, 5, 7, 9),
  new Given('R6C6', 1, 3, 5, 7, 9),
  new Given('R1C7', 1, 3, 5, 7, 9),
  new Given('R2C8', 1, 3, 5, 7, 9),

  // Even cells (opaque grey square overlay)
  new Given('R2C1', 2, 4, 6, 8),
  new Given('R3C1', 2, 4, 6, 8),
  new Given('R3C2', 2, 4, 6, 8),
  new Given('R5C2', 2, 4, 6, 8),
  new Given('R6C1', 2, 4, 6, 8),
  new Given('R7C4', 2, 4, 6, 8),
  new Given('R8C4', 2, 4, 6, 8),
  new Given('R4C6', 2, 4, 6, 8),

  // Arrows (bulb cell first, then arm cells)
  new Arrow('R1C1', 'R1C2', 'R2C2'),
  new Arrow('R1C4', 'R2C4', 'R3C4'),
  new Arrow('R1C6', 'R2C6', 'R3C6'),
  new Arrow('R4C9', 'R5C8', 'R6C9'),
  new Arrow('R4C2', 'R4C1', 'R5C1'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
  new Arrow('R8C6', 'R8C5', 'R7C5'),
  new Arrow('R8C6', 'R8C7', 'R8C8'),
  new Arrow('R8C2', 'R7C1', 'R7C2', 'R6C3'),
  new Arrow('R7C3', 'R6C4', 'R5C5'),
];
