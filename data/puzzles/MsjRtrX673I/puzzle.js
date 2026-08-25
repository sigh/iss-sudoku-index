// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=MsjRtrX673I
// Source: https://sudokupad.app/tQ4tLpRB86

// Standard sudoku (rows, columns, default 3x3 boxes), no givens. 21 killer
// cages partition the grid completely; within each cage digits are distinct
// and sum to the printed total (Cage(sum, ...cells) enforces both).

// Cages, provenance: the 21 non-stub entries of the payload's `cages` array.
const cages = [
  { total: 43, cells: ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R3C2'] },
  { total: 13, cells: ['R8C1', 'R9C1', 'R9C2'] },
  { total: 10, cells: ['R1C2', 'R2C2'] },
  { total: 23, cells: ['R1C3', 'R1C4', 'R2C4', 'R2C3'] },
  { total: 45, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C5', 'R6C5', 'R4C6', 'R4C7'] },
  { total: 8, cells: ['R4C2', 'R5C2', 'R6C2'] },
  { total: 21, cells: ['R7C2', 'R8C2', 'R8C3', 'R9C3'] },
  { total: 15, cells: ['R5C3', 'R5C4', 'R6C4', 'R7C4'] },
  { total: 13, cells: ['R6C3', 'R7C3'] },
  { total: 18, cells: ['R8C5', 'R8C4', 'R9C4'] },
  { total: 8, cells: ['R1C5', 'R1C6', 'R2C6'] },
  { total: 17, cells: ['R2C5', 'R3C5'] },
  { total: 27, cells: ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C6'] },
  { total: 22, cells: ['R2C8', 'R2C9', 'R3C9', 'R3C8'] },
  { total: 15, cells: ['R4C8', 'R4C9', 'R5C9', 'R5C8'] },
  { total: 19, cells: ['R5C7', 'R5C6', 'R6C6', 'R7C6', 'R7C5'] },
  { total: 24, cells: ['R9C5', 'R9C6', 'R9C7', 'R9C8'] },
  { total: 8, cells: ['R8C6', 'R8C7', 'R8C8'] },
  { total: 21, cells: ['R6C8', 'R6C7', 'R7C7'] },
  { total: 22, cells: ['R6C9', 'R7C9', 'R7C8'] },
  { total: 13, cells: ['R8C9', 'R9C9'] },
];

return [
  new Shape('9x9'),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
];
