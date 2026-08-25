// Title: Group Sum Sudoku
// Author: Rohan Rao
// Video: https://www.youtube.com/watch?v=GWFjU7q4m4c
// Source: https://sudokupad.app/M2hm8gQj8p
//
// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Each circled clue gives the total of the four cells meeting at its corner.
// The rules do not require those four cells to be distinct, so each clue is a
// repeats-allowed Sum rather than a distinct-cells Cage.

// Circled quad-sum clues: [total, cell, cell, cell, cell].
// Transcribed from the drawn circle overlays (corner-anchored 2x2 groups).
const quads = [
  [12, 'R3C1', 'R3C2', 'R4C1', 'R4C2'],
  [12, 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  [12, 'R1C3', 'R1C4', 'R2C3', 'R2C4'],
  [12, 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
  [12, 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  [12, 'R8C6', 'R8C7', 'R9C6', 'R9C7'],
  [12, 'R8C5', 'R8C6', 'R9C5', 'R9C6'],
  [25, 'R1C4', 'R1C5', 'R2C4', 'R2C5'],
  [28, 'R1C5', 'R1C6', 'R2C5', 'R2C6'],
  [23, 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
  [25, 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  [25, 'R4C8', 'R4C9', 'R5C8', 'R5C9'],
  [25, 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  [23, 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  [28, 'R3C8', 'R3C9', 'R4C8', 'R4C9'],
  [28, 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
  [15, 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  [19, 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  [20, 'R8C4', 'R8C5', 'R9C4', 'R9C5'],
  [19, 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...quads.map(([total, ...cells]) => new Sum(total, ...cells)),
];
