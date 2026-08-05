// Title: 10/21/22: Sum Renban Or Other
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=j-60lxKeWJI
// Source: https://tinyurl.com/3m4436pb

// Standard 9x9 Sudoku rules apply.
// The outlined cages have the listed totals and non-repeating digits.
// Purple lines are renban lines: their digits form non-repeating consecutive sets.
// Cage coordinates and totals come from the drawn killer cages.
const cages = [
  new Cage(3, 'R1C1', 'R1C2'),
  new Cage(7, 'R2C3', 'R2C4'),
  new Cage(17, 'R3C5', 'R3C6'),
  new Cage(17, 'R8C7', 'R8C8'),
  new Cage(3, 'R7C5', 'R7C6'),
  new Cage(10, 'R6C3', 'R6C4'),
  new Cage(10, 'R5C1', 'R5C2'),
  new Cage(9, 'R1C5', 'R1C6'),
  new Cage(7, 'R2C7', 'R2C8'),
  new Cage(11, 'R4C7', 'R4C8'),
  new Cage(14, 'R5C5', 'R5C6'),
  new Cage(12, 'R6C7', 'R6C8'),
  new Cage(13, 'R3C1', 'R3C2'),
  new Cage(3, 'R4C3', 'R4C4'),
  new Cage(9, 'R7C1', 'R7C2'),
  new Cage(13, 'R8C3', 'R8C4'),
  new Cage(11, 'R9C5', 'R9C6'),
];

// Line paths come from the seven drawn purple renban lines.
const renbans = [
  new Renban('R1C1', 'R1C2', 'R2C3', 'R2C4', 'R3C5', 'R3C6', 'R4C7', 'R4C8', 'R5C9'),
  new Renban('R3C1', 'R3C2', 'R4C3', 'R4C4', 'R5C5', 'R5C6', 'R6C7', 'R6C8', 'R7C9'),
  new Renban('R5C1', 'R5C2', 'R6C3', 'R6C4', 'R7C5', 'R7C6', 'R8C7', 'R8C8', 'R9C9'),
  new Renban('R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C9'),
  new Renban('R7C1', 'R7C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6'),
  new Renban('R8C1', 'R9C2'),
  new Renban('R8C6', 'R9C7'),
];

return [new Shape('9x9'), ...cages, ...renbans];
