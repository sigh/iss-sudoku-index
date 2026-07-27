// Title: The Spider
// Author: Bobo
// Video: https://www.youtube.com/watch?v=3IWcnw0NdEA
// Source: https://sudokupad.app/jw1onozqhg

// Standard 9x9 sudoku, no givens.
//
// Spider legs (difference >= 5 between adjacent cells on each leg) as
// Whisper(5, ...). Each leg's last waypoint segment ends short of a cell
// centre, right at the body line, so the naive waypoint-to-waypoint walk
// undercounts it by one cell; re-walking the same segments by drawn
// arc-length (every cell below the last one carries >= 0.5 cell-widths of
// the stroke, well past a corner-graze) shows each leg actually reaches one
// more cell, flush against the body's flank. That last cell is confirmed by
// the pumpkin/bat edge marks below, which sit between two such leg-end
// cells (e.g. R4C4/R5C4 -- leg 3's and leg 2's body-side ends).
//
// Spider body (strictly increasing away from the abdomen bulge at R7C5) as
// a single Thermo with the bulb first.
//
// Ghost: the ghost mark is a free-floating text badge whose payload records
// height 1.986 (~2 grid rows) but width 0 (SudokuPad always writes width:0
// on text marks, regardless of rendered size). The measured vertical extent
// covers rows 1-2 at column 8, i.e. R1C8 and R2C8 -- both leg-5 cells. The
// horizontal extent is unmeasured, so no reading reaching into column 7 is
// grounded. Encoded R1C8 and R2C8 as odd.
//
// Pumpkins joined -> consecutive (WhiteDot). Bats joined -> sum to 6 (Sum).
// The black cat mark is explicitly decorative in the rules text ("just
// happens to hang out there") and adds no constraint.

const legs = [
  ['R9C4', 'R8C3', 'R7C3', 'R6C4'],
  ['R7C2', 'R6C2', 'R5C3', 'R5C4'],
  ['R4C2', 'R3C2', 'R3C3', 'R4C4'],
  ['R2C2', 'R1C2', 'R2C3', 'R3C4'],
  ['R2C8', 'R1C8', 'R2C7', 'R3C6'],
  ['R4C8', 'R3C8', 'R3C7', 'R4C6'],
  ['R5C6', 'R5C7', 'R6C8', 'R7C8'],
  ['R6C6', 'R7C7', 'R8C7', 'R9C6'],
];

const pumpkins = [
  ['R4C4', 'R5C4'],
  ['R2C3', 'R3C3'],
];

const bats = [
  ['R1C4', 'R2C4'],
  ['R6C9', 'R7C9'],
  ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),

  ...legs.map(cells => new Whisper(5, ...cells)),

  new Thermo('R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5'),

  new Given('R1C8', 1, 3, 5, 7, 9),
  new Given('R2C8', 1, 3, 5, 7, 9),

  ...pumpkins.map(([a, b]) => new WhiteDot(a, b)),
  ...bats.map(([a, b]) => new Sum(6, a, b)),
];
