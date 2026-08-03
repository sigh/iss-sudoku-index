// Title: Jewelled Band
// Author: 99% Sneaky
// Video: https://www.youtube.com/watch?v=vm-_mZ-66CI
// Source: https://app.crackingthecryptic.com/sudoku/JDjq4DqQb3

// Normal sudoku rules apply on the default 9x9 grid with standard 3x3 box
// regions (the payload's drawn regions are exactly the nine default boxes,
// so no explicit region constraint is added). No givens.
//
// Cages: digits in a cage cannot repeat and must sum to the small clue in
// its top-left cell -- Cage(sum, ...cells) below, one per drawn cage.
//
// White circles: each circle's labelled digit(s) must appear at least once
// among the four cells touching it -- exactly Quad's "all given values
// present in the surrounding 2x2 square" semantics, so each circle maps
// straight to one Quad(topLeftCell, ...values). The title and the circles'
// ring layout around the outer boxes are cosmetic only.

return [
  new Shape('9x9'),

  // Cages (sum, cells), from the payload's cages array.
  new Cage(14, 'R1C5', 'R2C4', 'R2C5', 'R2C6'),
  new Cage(13, 'R4C3', 'R4C4', 'R5C4'),
  new Cage(16, 'R4C6', 'R4C7', 'R5C6'),
  new Cage(10, 'R5C2', 'R6C2'),
  new Cage(10, 'R5C8', 'R6C8'),
  new Cage(17, 'R7C3', 'R7C4', 'R8C4'),
  new Cage(12, 'R7C6', 'R7C7', 'R8C6'),

  // White circles (topLeftCell, ...values), from the payload's overlays.
  new Quad('R1C3', 3, 4),
  new Quad('R1C6', 3, 4),
  new Quad('R2C1', 8),
  new Quad('R2C2', 6),
  new Quad('R2C7', 5),
  new Quad('R2C8', 9),
  new Quad('R3C1', 1, 2),
  new Quad('R3C8', 1, 2),
  new Quad('R6C1', 1, 2),
  new Quad('R7C1', 5),
  new Quad('R7C2', 9),
  new Quad('R8C3', 3, 4),
  new Quad('R7C7', 7),
  new Quad('R6C8', 1, 2),
  new Quad('R7C8', 8),
  new Quad('R8C6', 3, 4),
];
