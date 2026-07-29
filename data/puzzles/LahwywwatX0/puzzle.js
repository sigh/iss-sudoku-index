// Title: Split Decision
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=LahwywwatX0
// Source: https://sudokupad.app/james-sinclair/split-decision

// Normal Sudoku rules apply. Killer cages have their shown sums and distinct digits.
// Each arrow's line digits sum to its circle; separate branches from a shared circle
// are separate arrows.
// Cage cells and totals are transcribed from the five shaded, outlined cages.
const cages = [
  new Cage(29, 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C9'),
  new Cage(29, 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C1'),
  new Cage(29, 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'),
  new Cage(21, 'R1C9', 'R2C8', 'R2C9'),
  new Cage(20, 'R8C1', 'R8C2', 'R9C1'),
];

// Arrow paths are transcribed from the drawn circles and their line segments.
const arrows = [
  new Arrow('R4C1', 'R3C2', 'R3C3'),
  new Arrow('R2C4', 'R1C3', 'R1C2'),
  new Arrow('R8C6', 'R9C7', 'R9C8'),
  new Arrow('R6C9', 'R7C8', 'R7C7'),
  new Arrow('R3C6', 'R4C6', 'R4C5'),
  new Arrow('R7C4', 'R6C4', 'R6C5'),
  new Arrow('R2C8', 'R1C8', 'R1C7'),
  new Arrow('R2C8', 'R3C9', 'R4C9', 'R5C8'),
  new Arrow('R8C2', 'R9C2', 'R9C3'),
  new Arrow('R8C2', 'R7C1', 'R6C1', 'R5C2'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
];
