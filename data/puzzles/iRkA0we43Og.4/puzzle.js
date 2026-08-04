// Title: Classic Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=iRkA0we43Og
// Source: https://tinyurl.com/4rye48nj

// Standard Sudoku: every digit 1-9 once per row, column, and 3x3 box.
// The default Shape and its automatic row/column/box constraints already
// enforce this, so only the givens need to be listed.
return [
  new Shape('9x9'),
  new Given('R1C4', 4),
  new Given('R1C5', 5),
  new Given('R1C6', 6),
  new Given('R2C1', 1),
  new Given('R2C2', 2),
  new Given('R2C3', 3),
  new Given('R4C3', 8),
  new Given('R4C4', 1),
  new Given('R5C2', 6),
  new Given('R5C5', 2),
  new Given('R5C8', 5),
  new Given('R6C6', 7),
  new Given('R6C7', 3),
  new Given('R8C7', 1),
  new Given('R8C8', 4),
  new Given('R8C9', 7),
  new Given('R9C4', 2),
  new Given('R9C5', 3),
  new Given('R9C6', 8),
];
