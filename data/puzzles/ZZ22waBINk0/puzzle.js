// Title: P-addict
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=ZZ22waBINk0
// Source: https://app.crackingthecryptic.com/sudoku/LGq2Nf2QJ8
//
// Place 1-9 in each row and column. The grid is divided into nine irregular
// (jigsaw) marked regions of nine cells each, each all-different, replacing
// the standard 3x3 boxes. White dots join consecutive digits; black dots
// join digits in a 2:1 ratio. The rules do not claim all dots are drawn, so
// undotted adjacent pairs carry no constraint.

// Region cell lists, transcribed from the payload's `regions` array.
const regions = [
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C2', 'R3C3', 'R4C2', 'R5C2', 'R6C2'],
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5', 'R7C5', 'R7C6', 'R8C5', 'R8C6', 'R9C5', 'R9C6'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C6', 'R4C7', 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C7', 'R7C8', 'R8C7', 'R8C8', 'R9C7', 'R9C8'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R1C1', 'R1C6', 'R2C1', 'R2C6', 'R3C1', 'R3C6', 'R7C9', 'R8C9', 'R9C9'],
];

// White (consecutive) dot pairs, transcribed from the payload's white
// `overlays` edges.
const whiteDots = [
  ['R1C2', 'R1C3'], ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R3C2', 'R4C2'],
  ['R3C4', 'R3C5'], ['R4C4', 'R5C4'], ['R5C4', 'R6C4'], ['R6C3', 'R7C3'],
  ['R7C4', 'R7C5'], ['R8C1', 'R9C1'], ['R8C5', 'R9C5'], ['R9C4', 'R9C5'],
  ['R9C7', 'R9C8'], ['R2C8', 'R2C9'], ['R5C7', 'R6C7'],
];

// Black (2:1 ratio) dot pairs, transcribed from the payload's black
// `overlays` edges.
const blackDots = [
  ['R3C7', 'R4C7'], ['R4C9', 'R5C9'], ['R5C6', 'R6C6'], ['R5C9', 'R6C9'],
  ['R7C2', 'R8C2'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(region => new AllDifferent(...region)),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  ...blackDots.map(pair => new BlackDot(...pair)),
];
