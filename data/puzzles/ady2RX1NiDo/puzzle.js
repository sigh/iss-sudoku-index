// Title: Splatter
// Author: Randall
// Video: https://www.youtube.com/watch?v=ady2RX1NiDo
// Source: https://app.crackingthecryptic.com/sudoku/TRHPbJDpp3

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, from the default
// Shape). Digits in cages cannot repeat and sum to the total shown in the
// cage's top-left cell -- a killer cage per group below.
//
// Red-cell rule: "Digits in red cells are the column index of the red cell's
// column in that row, e.g. the digit in r7c2 is the column index of the 2 in
// row 7, so a 6 in r7c2 means 2 is in r7c6. Not all red cells are given."
// This is exactly ISS's column Indexing semantics: for a red cell at (R, C)
// with digit V, cell (R, V) holds digit C. Only the 10 red-marked cells below
// (from the puzzle's underlays) carry the rule; unmarked cells are plain
// sudoku cells.

const cages = [
  // Cage cells and totals transcribed from the puzzle's drawn cage geometry.
  { sum: 18, cells: ['R1C1', 'R2C1', 'R2C2', 'R3C2', 'R3C3'] },
  { sum: 15, cells: ['R1C2', 'R1C3'] },
  { sum: 15, cells: ['R1C7', 'R2C7'] },
  { sum: 20, cells: ['R1C4', 'R2C4', 'R3C4'] },
  { sum: 28, cells: ['R4C1', 'R4C2', 'R4C3', 'R4C4'] },
  { sum: 27, cells: ['R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'] },
  { sum: 15, cells: ['R7C6', 'R8C6', 'R9C6'] },
  { sum: 6, cells: ['R7C4', 'R8C4', 'R9C4'] },
  { sum: 15, cells: ['R9C1', 'R9C2'] },
  { sum: 15, cells: ['R8C7', 'R9C7'] },
];

// Red (splattered) cells, transcribed from the puzzle's red cell-shading
// (fill #E6261F): R2C8, R3C8, R5C8, R4C7, R3C6, R6C6, R8C6, R8C3, R7C2, R5C2.
const redCells = [
  'R2C8', 'R3C8', 'R5C8', 'R4C7', 'R3C6',
  'R6C6', 'R8C6', 'R8C3', 'R7C2', 'R5C2',
];

return [
  new Shape('9x9'),
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
  new Indexing('C', ...redCells),
];
