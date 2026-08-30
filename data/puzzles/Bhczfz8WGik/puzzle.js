// Title: 75 Sudoku
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=Bhczfz8WGik
// Source: https://cracking-the-cryptic.web.app/sudoku/m7gDgBh2dj

// Normal sudoku rules apply. The 16 green-highlighted cells sum to 75, and
// the 16 blue-highlighted cells sum to 75 (repeats allowed within each set,
// since each spans two different rows/columns). Both totals and both colour
// names are printed as text under the grid, matching the payload's coloured
// cell underlays.

// Two undecorated grey lines run corner-to-corner along the two main
// diagonals (R1C1-R9C9 and R1C9-R9C1): the standard Sudoku X mark. No rules
// sentence names them explicitly, but nothing states otherwise either, and
// the lines carry no other adornment (colour, marker, legend) to suggest a
// different reading -- each marked diagonal holds every digit once.

// Green cells: row 2 minus R2C2, plus row 8 minus R8C8 (yellowgreen underlays).
const greenCells = [
  'R2C1', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9',
  'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C9',
];

// Blue cells: column 2 minus R8C2, plus column 8 minus R2C8 (deepskyblue underlays).
const blueCells = [
  'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R9C2',
  'R1C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8',
];

return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R1C5', 6),
  new Given('R1C6', 8),
  new Given('R3C1', 6),
  new Given('R3C4', 7),
  new Given('R3C5', 5),
  new Given('R4C1', 2),
  new Given('R4C2', 3),
  new Given('R4C6', 7),
  new Given('R4C7', 5),
  new Given('R4C9', 9),
  new Given('R5C1', 4),
  new Given('R5C9', 7),
  new Given('R6C1', 9),
  new Given('R6C3', 7),
  new Given('R6C4', 5),
  new Given('R6C8', 3),
  new Given('R6C9', 1),
  new Given('R7C5', 7),
  new Given('R7C6', 5),
  new Given('R7C9', 3),
  new Given('R9C4', 4),
  new Given('R9C5', 2),
  new Given('R9C6', 6),

  new Sum(75, ...greenCells),
  new Sum(75, ...blueCells),

  new Diagonal(1),
  new Diagonal(-1),
];
