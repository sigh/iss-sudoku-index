// Title: Osaka
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=EzW2anO7Juk
// Source: https://tinyurl.com/bdfjzcw8

// Normal sudoku rules apply. Digits do not repeat on the marked diagonal
// (the single drawn diagonal, f-puzzles `diagonal+`, runs R9C1-R1C9). In
// cages, digits must sum to the small clue in the top left corner of the
// cage and cannot repeat within the cage. No givens.

const cages = [
  new Cage(32, 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(16, 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R3C6'),
  new Cage(34, 'R2C9', 'R3C8', 'R3C9', 'R4C7', 'R4C8'),
  new Cage(38, 'R5C9', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R8C7', 'R9C7'),
  new Cage(22, 'R5C4', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(18, 'R8C6', 'R9C5', 'R9C6'),
  new Cage(18, 'R7C4', 'R8C3', 'R8C4', 'R9C2', 'R9C3'),
  new Cage(19, 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R8C1'),
  new Cage(9, 'R4C1', 'R4C2', 'R5C1'),
];

return [
  new Shape('9x9'),
  ...cages,
  new Diagonal(1),
];
