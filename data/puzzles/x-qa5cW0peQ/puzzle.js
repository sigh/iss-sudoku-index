// Title: Hone your Skills at Classic Sudoku
// Author: Helen Tan
// Video: https://www.youtube.com/watch?v=x-qa5cW0peQ
// Source: https://app.crackingthecryptic.com/sudoku/67dGMn7HbH

// Plain classic sudoku: rows, columns, and the nine 3x3 boxes each contain
// 1-9 once, enforced by the solver's baseline Sudoku rules. The payload
// carries no cages, lines, arrows, or overlay clues beyond the 23 givens
// below, and the video description carries no supplementary rules text.

return [
  new Shape('9x9'),
  new Given('R1C2', 5),
  new Given('R1C5', 7),
  new Given('R1C6', 9),
  new Given('R2C7', 5),
  new Given('R3C2', 9),
  new Given('R3C3', 2),
  new Given('R3C8', 6),
  new Given('R4C2', 8),
  new Given('R4C7', 4),
  new Given('R4C9', 7),
  new Given('R5C2', 2),
  new Given('R5C4', 6),
  new Given('R5C8', 1),
  new Given('R6C2', 7),
  new Given('R6C4', 2),
  new Given('R6C5', 5),
  new Given('R6C8', 8),
  new Given('R7C5', 4),
  new Given('R8C3', 8),
  new Given('R8C5', 2),
  new Given('R9C1', 7),
  new Given('R9C2', 3),
  new Given('R9C6', 1),
];
