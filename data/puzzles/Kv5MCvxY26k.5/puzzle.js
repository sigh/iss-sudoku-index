// Title: August 20, 2021: 159 Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Kv5MCvxY26k
// Source: https://tinyurl.com/mhw337m8

// Normal sudoku rules apply.
// A digit placed in column 1 indicates the position of the 1 within that
// row. A digit placed in column 5 indicates the position of the 5 within
// that row. A digit placed in column 9 indicates the position of the 9
// within that row. (Columns 1, 5 and 9 are shaded pink in the source to
// mark which columns carry this rule.)
//
// `Indexing('C', ...cells)` implements exactly this: for a control cell at
// (R, C), its value V means row R's column V holds the digit C. Passing
// every cell of columns 1, 5 and 9 as control cells lets each one supply
// its own column number (1, 5 or 9) as the digit being located, so one
// call covers all three named columns.

const col1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 1));
const col5 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 5));
const col9 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, 9));

const givens = [
  new Given('R1C6', 1),
  new Given('R2C3', 2),
  new Given('R2C7', 6),
  new Given('R3C4', 2),
  new Given('R3C8', 5),
  new Given('R4C4', 1),
  new Given('R4C8', 3),
  new Given('R5C3', 3),
  new Given('R5C7', 9),
  new Given('R6C2', 5),
  new Given('R6C6', 9),
  new Given('R7C2', 2),
  new Given('R7C6', 7),
  new Given('R8C3', 9),
  new Given('R8C7', 8),
  new Given('R9C4', 5),
];

return [
  new Shape('9x9'),
  ...givens,
  new Indexing('C', ...col1, ...col5, ...col9),
];
