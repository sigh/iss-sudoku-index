// Title: Outstanding New Type Of Sudoku: "The Killer Sandwich"
// Author: Wecoc
// Video: https://www.youtube.com/watch?v=J_5pPv7ulpM
// Source: https://cracking-the-cryptic.web.app/sudoku/HMJBQtqmBH
//
// Standard 9x9 sudoku (rows, columns, boxes). Killer cages: no digit repeats
// within a cage; a cage with total 0 prints no total, so only its
// all-different applies (`Cage(0, ...)` emits AllDifferent only). The
// nineteen cages below partition the grid exactly, transcribed from the
// payload's cage cell lists and totals.
//
// Sandwich: the number outside a row/column is the sum of the digits between
// the 1 and the 9 in that line (order-independent, so built directly from
// each full grid row/column).

const cages = [
  [17, 'R1C1', 'R2C1', 'R3C1', 'R3C2'],
  [21, 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  [17, 'R1C7', 'R1C8', 'R2C7', 'R2C8'],
  [28, 'R1C9', 'R2C9', 'R3C8', 'R3C9', 'R4C8'],
  [21, 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R4C7'],
  [0, 'R2C2', 'R2C3', 'R2C4', 'R3C3', 'R3C4'],
  [0, 'R1C6', 'R2C5', 'R2C6', 'R3C5'],
  [0, 'R4C9', 'R5C8', 'R5C9', 'R6C9'],
  [0, 'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
  [32, 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [0, 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  [21, 'R4C3', 'R4C4', 'R5C3'],
  [16, 'R5C4', 'R6C1', 'R6C2', 'R6C3', 'R6C4'],
  [0, 'R5C5', 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  [20, 'R7C7', 'R8C7', 'R8C8', 'R9C8'],
  [0, 'R6C5', 'R7C5', 'R7C6', 'R8C5'],
  [26, 'R8C6', 'R9C5', 'R9C6', 'R9C7'],
  [0, 'R7C4', 'R8C4', 'R9C3', 'R9C4'],
  [0, 'R7C2', 'R7C3', 'R8C3'],
];

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Rows with a printed sandwich total.
const rowSandwiches = { 1: 12, 4: 0, 6: 21, 7: 8, 8: 35, 9: 13 };
// Columns with a printed sandwich total.
const colSandwiches = { 1: 7, 2: 0, 3: 6, 5: 8, 6: 23, 7: 30, 9: 9 };

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...Object.entries(rowSandwiches).map(([row, value]) =>
    Sandwich.fromCells(value, graph.row(+row), geometry)),
  ...Object.entries(colSandwiches).map(([col, value]) =>
    Sandwich.fromCells(value, graph.column(+col), geometry)),
];
