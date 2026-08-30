// Title: Parquet Arrow Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LT0RgCx-DEs
// Source: https://cracking-the-cryptic.web.app/sudoku/LTQRLFLtgj

// Normal sudoku rules (default rows/cols/boxes/givens). Twelve arrows: the two
// shaft cells of each arrow sum to the given digit in its own circled bulb
// cell ("Digits on each arrow sum to the number in the circle" -- video
// description).

// Arrow bulb (circled given) and its two shaft cells, from the drawn arrow
// paths matched against the circle overlay each starts at: every waypoint
// lies on a cell edge, so the side carrying the circle overlay settles which
// cell is the bulb.
const arrows = [
  ['R2C8', 'R2C7', 'R2C6'],
  ['R3C8', 'R3C7', 'R3C6'],
  ['R4C8', 'R4C7', 'R4C6'],
  ['R2C2', 'R3C2', 'R4C2'],
  ['R2C3', 'R3C3', 'R4C3'],
  ['R2C4', 'R3C4', 'R4C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R8C6', 'R7C6', 'R6C6'],
  ['R8C7', 'R7C7', 'R6C7'],
  ['R8C8', 'R7C8', 'R6C8'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 3), new Given('R2C3', 4), new Given('R2C4', 7),
  new Given('R2C8', 6), new Given('R3C8', 7), new Given('R4C8', 9),
  new Given('R6C2', 8), new Given('R7C2', 9), new Given('R8C2', 6),
  new Given('R8C6', 9), new Given('R8C7', 8), new Given('R8C8', 5),
  ...arrows.map(cells => new Arrow(...cells)),
];
