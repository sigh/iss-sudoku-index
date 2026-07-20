// Title: v38
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=Vnm3Q-AI1c0
// Source: https://sudokupad.app/sln1iupe4k

// Normal Sudoku, five 38-sum killer cages, and the two marked V pairs.
// Unmarked adjacent pairs are unrestricted by the V rule.

const givens = [
  new Given('R1C2', 1),
  new Given('R1C8', 3),
  new Given('R2C1', 2),
  new Given('R2C9', 4),
  new Given('R6C5', 9),
  new Given('R8C1', 8),
  new Given('R8C9', 5),
  new Given('R9C2', 7),
  new Given('R9C8', 6),
];

const cages = [
  new Cage(38, 'R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9'),
  new Cage(38, 'R5C9', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R9C6'),
  new Cage(38, 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5'),
  new Cage(38, 'R1C4', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R5C1'),
  new Cage(38, 'R4C3', 'R4C4', 'R4C6', 'R4C7', 'R5C4', 'R5C5', 'R5C6'),
];

const vClues = [
  new V('R5C2', 'R6C2'),
  new V('R6C8', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...vClues,
];
