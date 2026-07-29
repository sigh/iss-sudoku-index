// Title: ISD 9/9/2024
// Author: Grant McLean
// Video: https://www.youtube.com/watch?v=4oIItj0ch-A
// Source: https://sudokupad.app/k1spkwhpl7

// Normal Sudoku rules apply. The thermometer increases from its bulb; each
// drawn cage has distinct digits summing to its label; orthogonally adjacent
// cells cannot contain consecutive digits.
// Cage coordinates and totals are transcribed from the drawn killer cages.
const cages = [
  new Cage(21, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(14, 'R1C3', 'R2C3'),
  new Cage(13, 'R6C7', 'R7C7'),
  new Cage(12, 'R6C9', 'R7C8', 'R7C9'),
  new Cage(8, 'R9C7', 'R9C8'),
  new Cage(11, 'R8C9', 'R9C9'),
  new Cage(8, 'R5C1', 'R5C2'),
  new Cage(5, 'R4C3', 'R5C3'),
  new Cage(6, 'R3C2', 'R3C3'),
  new Cage(14, 'R2C1', 'R3C1'),
  new Cage(10, 'R1C1', 'R1C2'),
];

return [
  new Shape('9x9'),
  ...cages,
  new Thermo('R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'),
  new AntiConsecutive(),
];
