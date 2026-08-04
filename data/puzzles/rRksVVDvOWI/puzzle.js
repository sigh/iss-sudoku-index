// Title: Network
// Author: Niverio
// Video: https://www.youtube.com/watch?v=rRksVVDvOWI
// Source: https://app.crackingthecryptic.com/sudoku/2f49L7B6Tt

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// 13 grey lines each run between two cells marked with a plain white
// circle; every cell the line's drawn path crosses in between is an
// "along the line" cell. Digits along the line must be strictly between
// the digits placed in the two circled end cells: Between(...cells), first
// and last cells are the circled ends.
//
// Lines 6 and 7 (R5C3-R6C4-R6C5-R7C5 and R7C5-R6C5-R6C6-R5C7) both meet at
// circled cell R7C5 and both drawn routes clip through R6C5 on the way
// to/from it (measured curve occupancy ~0.83 cell-widths in R6C5 for each,
// well above a corner graze) -- two lines crossing through one cell without
// connecting, the "network" the title names.
//
// 10 black-bordered white circles sit at box-corner intersections, each
// showing 1-3 digits; every listed digit must appear in at least one of the
// circle's four touching cells: Quad(topLeftCell, ...values).

const between = [
  ['R3C1', 'R2C1', 'R1C2', 'R1C3'],
  ['R1C3', 'R2C3', 'R3C4', 'R3C5'],
  ['R3C5', 'R3C6', 'R2C7', 'R1C7'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  ['R3C9', 'R4C9', 'R4C8', 'R5C7'],
  ['R3C1', 'R4C1', 'R4C2', 'R5C3'],
  ['R5C3', 'R6C4', 'R6C5', 'R7C5'],
  ['R7C5', 'R6C5', 'R6C6', 'R5C7'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R9C3', 'R8C4', 'R7C4'],
  ['R9C7', 'R9C8', 'R8C9', 'R7C9'],
  ['R7C6', 'R8C6', 'R9C7'],
  ['R5C3', 'R6C3', 'R7C4'],
];

const quads = [
  ['R1C1', 2, 3],
  ['R1C8', 7, 8],
  ['R2C3', 3, 4, 8],
  ['R2C6', 2, 6, 7],
  ['R3C6', 3],
  ['R3C3', 7],
  ['R5C4', 2, 3],
  ['R4C1', 1],
  ['R8C1', 2, 4],
  ['R8C4', 8],
];

return [
  new Shape('9x9'),
  ...between.map(cells => new Between(...cells)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
