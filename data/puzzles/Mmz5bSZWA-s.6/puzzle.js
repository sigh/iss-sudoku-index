// Title: 9/1/23: New Month Who Dis
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: https://tinyurl.com/nhh85bnj

// Normal 9x9 Sudoku; the listed givens, killer cages, and between lines are encoded.
// Killer-cage cells and totals are transcribed from the drawn cage data.
const cages = [
  new Cage(7, 'R2C2', 'R2C3', 'R3C2'),
  new Cage(23, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(9, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(24, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(6, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(21, 'R6C7', 'R7C6', 'R7C7'),
  new Cage(9, 'R7C2', 'R8C2', 'R8C3'),
  new Cage(21, 'R2C7', 'R2C8', 'R3C8'),
  new Cage(10, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(20, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(19, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(11, 'R6C3', 'R7C3', 'R7C4'),
];

// Each listed payload line has circles at its first and last cells.
const betweenLines = [
  new Between('R1C2', 'R2C3', 'R3C4'),
  new Between('R2C1', 'R3C2', 'R4C3'),
  new Between('R3C6', 'R2C7', 'R1C8'),
  new Between('R4C7', 'R3C8', 'R2C9'),
  new Between('R6C7', 'R7C8', 'R8C9'),
  new Between('R7C6', 'R8C7', 'R9C8'),
  new Between('R7C4', 'R8C3', 'R9C2'),
  new Between('R8C1', 'R7C2', 'R6C3'),
  new Between('R3C5', 'R4C4', 'R5C3'),
  new Between('R7C5', 'R6C6', 'R5C7'),
  new Between('R3C5', 'R4C6', 'R5C7'),
  new Between('R7C5', 'R6C4', 'R5C3'),
];

return [
  new Shape('9x9'),
  new Given('R2C5', 3), new Given('R2C6', 4),
  new Given('R5C1', 8), new Given('R5C2', 7), new Given('R5C4', 4),
  new Given('R5C5', 5), new Given('R5C6', 6), new Given('R5C8', 3), new Given('R5C9', 2),
  new Given('R8C4', 6), new Given('R8C5', 7),
  ...cages,
  ...betweenLines,
];
