// Title: You've Got A Friend In Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=yfuBifYKQnU
// Source: https://tinyurl.com/46etdsvv

// Normal sudoku rules apply. Digits in green cells must equal the box, row,
// or column they are in, using the standard 1-9 numbering (row top-to-bottom,
// column left-to-right, box in reading order 1-9). This is a candidate
// restriction, so each green cell is encoded as a multi-value `Given` listing
// the digits (deduplicated) equal to its own row, column, and box number.
// Green cells are read from the payload's `cArray`/`c` (#B0FFB0) fields.
return [
  new Shape('9x9'),

  // Puzzle givens (R#C#=value).
  new Given('R2C1', 9),
  new Given('R2C4', 7),
  new Given('R3C8', 5),
  new Given('R4C3', 1),
  new Given('R4C4', 3),
  new Given('R4C9', 5),
  new Given('R6C1', 5),
  new Given('R6C6', 7),
  new Given('R6C7', 9),
  new Given('R7C2', 5),
  new Given('R8C6', 3),
  new Given('R8C9', 1),

  // Green cells: candidates restricted to {row, column, box} number.
  new Given('R1C4', 1, 2, 4),
  new Given('R1C9', 1, 3, 9),
  new Given('R2C3', 1, 2, 3),
  new Given('R2C5', 2, 5),
  new Given('R2C8', 2, 3, 8),
  new Given('R3C2', 1, 2, 3),
  new Given('R3C7', 3, 7),
  new Given('R4C1', 1, 4),
  new Given('R4C6', 4, 5, 6),
  new Given('R5C5', 5),
  new Given('R6C4', 4, 5, 6),
  new Given('R6C9', 6, 9),
  new Given('R7C3', 3, 7),
  new Given('R7C8', 7, 8, 9),
  new Given('R8C2', 2, 7, 8),
  new Given('R8C5', 5, 8),
  new Given('R8C7', 7, 8, 9),
  new Given('R9C1', 1, 7, 9),
  new Given('R9C6', 6, 8, 9),
];
