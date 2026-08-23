// Title: Fossils
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=UCYsorRgKnc
// Source: https://app.crackingthecryptic.com/sudoku/qFrmgJ98Nh

// Normal sudoku rules apply (default row/column/box all-different).
// Digits in a cage sum to the total given -> Cage(total, ...cells) (also
// enforces the killer distinct-within-cage default).
// Digits along an arrow sum to the digit in the circle -> Arrow(bulb, ...arm).
// Three arrows share their bulb cell R7C7, extending in three directions.
// Cells separated by a white dot must contain consecutive digits ->
// WhiteDot(a, b). "Not all possible dots are given" means unmarked adjacent
// pairs carry no constraint, so this is a plain (non-exhaustive) WhiteDot
// list, not StrictKropki.

// Cage cells and totals, transcribed from the drawn `cages` array.
const cages = [
  [21, 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
  [12, 'R3C1', 'R3C2', 'R3C3'],
  [8, 'R5C1', 'R5C2'],
  [11, 'R6C1', 'R6C2'],
  [9, 'R7C2', 'R7C1'],
  [12, 'R6C4', 'R6C5'],
  [7, 'R4C4', 'R5C4'],
  [14, 'R4C6', 'R5C6', 'R6C6'],
  [10, 'R4C8', 'R4C9'],
  [9, 'R6C8', 'R6C9'],
  [10, 'R9C8', 'R9C9'],
  [10, 'R8C5', 'R9C5'],
];

// Arrow bulb (first cell) and arm cells, from the drawn arrow paths and their
// circle underlays at R4C5, R4C7, R5C9, R7C7.
const arrows = [
  ['R4C5', 'R3C5', 'R3C4'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R7C7', 'R7C6', 'R7C5'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R4C7', 'R3C8', 'R2C9'],
];

// White dot cell pairs, transcribed from the drawn edge-sized overlays.
const whiteDots = [
  ['R2C1', 'R2C2'],
  ['R2C2', 'R2C3'],
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R8C6', 'R9C6'],
  ['R8C4', 'R9C4'],
  ['R9C2', 'R9C3'],
  ['R9C1', 'R9C2'],
  ['R4C2', 'R4C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
