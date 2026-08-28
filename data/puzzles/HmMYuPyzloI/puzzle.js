// Title: Fourtuitous
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=HmMYuPyzloI
// Source: https://tinyurl.com/bdhxcnr5

// Normal sudoku rules (default rows/cols/boxes). Nine blue region-sum lines:
// RegionSumLine enforces equal sums per box-run, matching "Digits along the
// blue lines must have an equal sum within each box they visit." None of
// these lines revisits a box non-consecutively, so no line needs a repeated
// cell for a wrap-around split.

const given = ['R5C5', 4];

// Line cell paths, transcribed from the payload's `regionsumline` array
// (waypoint order, row-major as drawn).
const lines = [
  ['R9C7', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C5', 'R4C4', 'R3C4', 'R2C4', 'R1C4', 'R1C3'],
  ['R8C5', 'R8C4', 'R7C3', 'R6C2'],
  ['R2C5', 'R2C6', 'R3C7', 'R4C8'],
  ['R5C6', 'R6C7', 'R7C8', 'R7C9'],
  ['R5C4', 'R4C3', 'R3C2', 'R3C1'],
  ['R7C2', 'R6C1'],
  ['R4C9', 'R3C8'],
  ['R9C4', 'R8C3'],
  ['R1C6', 'R2C7', 'R1C8'],
];

return [
  new Shape('9x9'),
  new Given(...given),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
