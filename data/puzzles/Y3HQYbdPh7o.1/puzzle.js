// Title: Dec. 14, 2021: Ultimaton
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y3HQYbdPh7o
// Source: https://tinyurl.com/2p9fwyc2

// Normal sudoku rules apply (no givens). Digits in a killer cage cannot
// repeat and must sum to the cage's total. Digits in cells joined by a V
// sum to 5; digits in cells joined by an X sum to 10. The rules state there
// is no negative constraint, so unmarked adjacent pairs are unconstrained
// and may still happen to sum to 5 or 10 -- only the drawn V/X marks below
// are encoded.

return [
  new Shape('9x9'),

  // Killer cages, as drawn.
  new Cage(6, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(7, 'R9C7', 'R9C8', 'R9C9'),
  new Cage(15, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(12, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(11, 'R1C7', 'R2C7', 'R3C7'),
  new Cage(13, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(10, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(15, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(17, 'R6C9', 'R7C9', 'R8C9'),
  new Cage(14, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(17, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(16, 'R4C5', 'R4C6', 'R4C7'),
  new Cage(13, 'R6C3', 'R6C4', 'R6C5'),
  new Cage(11, 'R7C4', 'R7C5', 'R7C6'),

  // V marks: sum to 5, as drawn.
  new V('R1C1', 'R1C2'),
  new V('R9C9', 'R9C8'),
  new V('R7C5', 'R7C4'),
  new V('R3C1', 'R4C1'),

  // X marks: sum to 10, as drawn.
  new X('R9C6', 'R9C5'),
  new X('R1C4', 'R1C5'),
  new X('R9C3', 'R8C3'),
  new X('R2C7', 'R1C7'),
  new X('R3C6', 'R3C5'),
  new X('R6C9', 'R7C9'),
  new X('R6C2', 'R5C2'),
  new X('R5C8', 'R4C8'),
  new X('R4C6', 'R4C7'),
  new X('R6C5', 'R6C4'),
];
