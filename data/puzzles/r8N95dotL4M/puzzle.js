// Title: Odd Way to Even Out
// Author: oskode
// Video: https://www.youtube.com/watch?v=r8N95dotL4M
// Source: https://sudokupad.app/jpjbe0lid4

// Normal Sudoku rules apply. Killer cages have the shown sum with no repeated
// digit, and each quadruple's listed digits occur in its surrounding 2x2 cells.
const cages = [
  { total: 12, cells: ['R5C3', 'R5C4', 'R6C3'] },
  { total: 16, cells: ['R4C7', 'R5C6', 'R5C7'] },
  { total: 14, cells: ['R1C6', 'R2C6', 'R3C5', 'R3C6'] },
  { total: 14, cells: ['R7C4', 'R7C5', 'R8C4', 'R9C4'] },
  { total: 24, cells: ['R7C7', 'R7C8', 'R7C9', 'R8C6', 'R8C7'] },
  { total: 24, cells: ['R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3'] },
  { total: 18, cells: ['R3C8', 'R3C9', 'R4C9', 'R5C9'] },
  { total: 22, cells: ['R5C1', 'R6C1', 'R7C1', 'R7C2'] },
  { total: 11, cells: ['R9C1', 'R9C2'] },
  { total: 11, cells: ['R1C8', 'R1C9'] },
];

return [
  new Shape('9x9'),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
  new Quad('R8C1', 3, 5, 7),
  new Quad('R1C1', 3, 5, 7),
  new Quad('R1C8', 5, 7, 9),
  new Quad('R8C8', 5, 7, 9),
  new Quad('R6C4', 2, 3),
  new Quad('R3C5', 1, 4),
];
