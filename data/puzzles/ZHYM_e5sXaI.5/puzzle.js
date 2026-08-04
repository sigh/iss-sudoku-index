// Title: HAIL OUR NEW AI OVERLORDS
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ZHYM_e5sXaI
// Source: https://tinyurl.com/37ptjjtn

// Rules: "Normal sudoku rules apply." The source carries no other clue
// geometry (no cages, lines, arrows, or overlays) -- rows, columns, and the
// default 3x3 boxes are the only constraints. Givens below are the drawn
// clue digits.
return [
  new Shape('9x9'),
  new Given('R1C6', 2),
  new Given('R1C7', 3),
  new Given('R1C8', 4),
  new Given('R1C9', 5),
  new Given('R2C5', 4),
  new Given('R2C9', 7),
  new Given('R3C3', 6),
  new Given('R3C6', 7),
  new Given('R3C9', 8),
  new Given('R4C3', 5),
  new Given('R4C9', 6),
  new Given('R5C2', 2),
  new Given('R5C8', 3),
  new Given('R6C1', 3),
  new Given('R6C7', 1),
  new Given('R7C1', 7),
  new Given('R7C4', 9),
  new Given('R7C7', 2),
  new Given('R8C1', 8),
  new Given('R8C5', 3),
  new Given('R9C1', 9),
  new Given('R9C2', 1),
  new Given('R9C3', 3),
  new Given('R9C4', 8),
];
