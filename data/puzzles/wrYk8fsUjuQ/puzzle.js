// Title: Mirrors
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=wrYk8fsUjuQ
// Source: https://app.crackingthecryptic.com/sudoku/GNb3g7F7ft

// Normal sudoku (default row/column/box AllDifferent, no givens). 14 killer
// cages: digits sum to the printed corner total and cannot repeat within the
// cage (Cage enforces both). Both drawn diagonals (`\` R1C1-R9C9 and `/`
// R1C9-R9C1) are stroked the same blue the rules cite as the diagonal
// marker ("Digits along a main diagonal (marked in blue) may not repeat"),
// and the payload draws them as two separate line entries, so both get the
// stated non-repeat rule (Diagonal).

return [
  new Shape('9x9'),

  // Cages: cells, top-left-cell sum, transcribed from the drawn cage clues.
  new Cage(5, 'R1C1', 'R2C1'),
  new Cage(5, 'R9C9', 'R9C8'),
  new Cage(6, 'R5C7', 'R5C8'),
  new Cage(10, 'R5C9', 'R6C9'),
  new Cage(10, 'R5C1', 'R6C1'),
  new Cage(11, 'R4C3', 'R4C4'),
  new Cage(11, 'R6C6', 'R7C6'),
  new Cage(18, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(8, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(11, 'R9C4', 'R9C5'),
  new Cage(12, 'R1C4', 'R1C5'),
  new Cage(6, 'R2C5', 'R3C5'),
  new Cage(15, 'R1C3', 'R2C3'),
  new Cage(15, 'R7C8', 'R7C9'),

  // Both diagonals, both drawn in the blue that the rule names as the marker.
  new Diagonal(-1), // '\' R1C1..R9C9
  new Diagonal(1),  // '/' R1C9..R9C1
];
