// Title: Things in common
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=vFE7SlSNnGE
// Source: https://sudokupad.app/q80drlpksu

// Normal Sudoku rules apply. Pink lines are Renban lines: their digits form a
// consecutive non-repeating set. Killer cages have distinct digits and the
// indicated total; the unlabelled cage has distinct digits only.
const renbans = [
  new Renban('R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C8'),
  new Renban('R7C6', 'R7C5', 'R7C4', 'R7C3', 'R8C3'),
  new Renban('R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C2'),
  new Renban('R3C4', 'R3C5', 'R3C6', 'R3C7', 'R2C7'),
  new Renban('R1C8', 'R1C9', 'R2C9', 'R2C8'),
  new Renban('R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Renban('R1C1', 'R2C1', 'R2C2', 'R1C2'),
  new Renban('R8C8', 'R8C9', 'R9C9', 'R9C8'),
];

// Cage cell lists and totals are transcribed from the drawn killer cages.
const cages = [
  new Cage(23, 'R6C7', 'R6C8', 'R7C7', 'R7C8'),
  new Cage(23, 'R2C6', 'R2C7', 'R3C6', 'R3C7'),
  new Cage(23, 'R7C3', 'R7C4', 'R8C3', 'R8C4'),
  new Cage(23, 'R3C2', 'R3C3', 'R4C2', 'R4C3'),
  new Cage(25, 'R7C2', 'R8C2', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(26, 'R6C9', 'R7C9', 'R8C7', 'R8C8', 'R8C9'),
  new Cage(25, 'R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C8'),
  new Cage(25, 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R4C1'),
  new Cage(14, 'R6C6', 'R7C5', 'R7C6'),
  new AllDifferent('R5C3', 'R6C3', 'R6C4'),
  new Cage(15, 'R4C6', 'R4C7', 'R5C7'),
];

return [new Shape('9x9'), ...renbans, ...cages];
