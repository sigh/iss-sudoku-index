// Title: Killer Kropki
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=mFe8TCCm65w
// Source: https://app.crackingthecryptic.com/webapp/4FFRfBF9dt

// Normal sudoku (default rows/cols/boxes, standard 3x3 boxes). Six killer
// cages (distinct + sum). White dots (WhiteDot) mark consecutive-value
// adjacent pairs; black dots (BlackDot) mark a 2:1 ratio adjacent pair. Not
// all dots are drawn, so absence elsewhere is not encoded (no StrictKropki).

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [18, 'R1C3', 'R1C4', 'R2C3'],
  [20, 'R3C1', 'R3C2', 'R4C1', 'R4C2'],
  [10, 'R5C1', 'R5C2'],
  [15, 'R6C1', 'R6C2', 'R7C2'],
  [18, 'R1C7', 'R2C7', 'R2C8'],
  [10, 'R8C8', 'R9C8'],
];

// White (consecutive) dot edges, transcribed from the drawn `overlays`
// (rounded edge marks with white fill).
const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R2C4', 'R2C5'],
  ['R1C5', 'R2C5'],
  ['R1C8', 'R1C9'],
  ['R1C9', 'R2C9'],
  ['R3C9', 'R4C9'],
  ['R3C8', 'R4C8'],
  ['R5C8', 'R5C9'],
  ['R6C8', 'R6C9'],
  ['R7C8', 'R7C9'],
  ['R8C9', 'R9C9'],
  ['R9C4', 'R9C5'],
  ['R8C1', 'R9C1'],
  ['R7C1', 'R8C1'],
  ['R8C2', 'R9C2'],
  ['R9C1', 'R9C2'],
];

// Black (double) dot edges, transcribed from the drawn `overlays` (rounded
// edge marks with black fill).
const blackDots = [
  ['R1C6', 'R2C6'],
  ['R5C5', 'R6C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
