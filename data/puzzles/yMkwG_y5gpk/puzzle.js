// Title: 159 Sudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=yMkwG_y5gpk
// Source: https://app.crackingthecryptic.com/sudoku/TdBgH8fFdF

// Normal sudoku rules apply (default row/column/box constraints).
//
// Digits in column 1 indicate in which column digit 1 sits in that row;
// digits in column 5 indicate in which column digit 5 sits in that row;
// digits in column 9 indicate in which column digit 9 sits in that row.
// `Indexing('C', ...cells)` derives each cell's target value from its own
// column (col+1), so passing all of columns 1, 5, and 9 in one call gives
// column-1 cells value 1, column-5 cells value 5, and column-9 cells value
// 9 automatically -- matching the three rule sentences without repeating
// the column-to-value mapping by hand.

const col1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 1));
const col5 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 5));
const col9 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 9));

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C2', 2),
  new Given('R2C3', 4),
  new Given('R2C7', 8),
  new Given('R3C3', 6),
  new Given('R3C7', 2),
  new Given('R4C3', 8),
  new Given('R4C7', 3),
  new Given('R6C3', 1),
  new Given('R6C7', 7),
  new Given('R6C8', 6),
  new Given('R7C2', 4),
  new Given('R7C3', 3),
  new Given('R7C7', 6),
  new Given('R8C7', 4),

  new Indexing('C', ...col1, ...col5, ...col9),
];
