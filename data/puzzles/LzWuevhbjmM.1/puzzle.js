// Title: Renban Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LzWuevhbjmM
// Source: https://cracking-the-cryptic.web.app/sudoku/R62R7LTrq2

// Normal sudoku rules apply (standard 3x3 boxes).
// Each drawn cage (no printed total) holds a set of consecutive digits in
// some order -> Renban(...cells).

// Cage cells transcribed from the drawn cage geometry, one Renban per cage.
const renbanCages = [
  new Renban('R7C5', 'R8C5', 'R9C5', 'R8C6'),
  new Renban('R7C6', 'R7C7', 'R6C7'),
  new Renban('R6C5', 'R5C5', 'R5C6', 'R6C6'),
  new Renban('R5C7', 'R5C8', 'R5C9', 'R6C8'),
  new Renban('R1C5', 'R1C3', 'R1C4', 'R2C4'),
  new Renban('R2C3', 'R3C3', 'R3C2'),
  new Renban('R1C2', 'R1C1', 'R2C1', 'R2C2'),
  new Renban('R3C1', 'R4C1', 'R5C1', 'R4C2'),
];

const givens = [
  new Given('R1C7', 1),
  new Given('R1C8', 4),
  new Given('R1C9', 7),
  new Given('R2C5', 3),
  new Given('R2C8', 5),
  new Given('R3C4', 6),
  new Given('R3C5', 1),
  new Given('R4C3', 9),
  new Given('R5C2', 7),
  new Given('R5C3', 2),
  new Given('R7C1', 7),
  new Given('R8C1', 9),
  new Given('R8C2', 1),
  new Given('R8C8', 8),
  new Given('R8C9', 5),
  new Given('R9C1', 6),
  new Given('R9C8', 7),
  new Given('R9C9', 2),
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbanCages,
];
