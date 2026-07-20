// Title: Entangled
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=-Uj9xZPyzM4
// Source: https://sudokupad.app/luzxwziiq3

// Standard Sudoku is implicit. Both main diagonals are all-different.
const cages = [
  new Cage(13, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(15, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(16, 'R2C4', 'R3C4', 'R4C4'),
  new Cage(14, 'R2C6', 'R3C6', 'R4C6'),
  new Cage(13, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(13, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(15, 'R5C5', 'R6C5', 'R7C5'),
  new Cage(12, 'R9C4', 'R9C5', 'R9C6'),
];

const renbans = [
  new Renban('R1C3', 'R2C3', 'R3C3'),
  new Renban('R1C5', 'R2C5', 'R3C5'),
  new Renban('R1C7', 'R2C7', 'R3C7'),
  new Renban('R7C1', 'R8C1', 'R9C1'),
  new Renban('R7C4', 'R8C4', 'R9C3'),
  new Renban('R7C6', 'R8C6', 'R9C7'),
  new Renban('R7C9', 'R8C9', 'R9C9'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages,
  ...renbans,
];
