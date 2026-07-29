// Title: Qaak
// Author: dumediat
// Video: https://www.youtube.com/watch?v=0mm4BgeH3bk
// Source: https://sudokupad.app/zroqrn8dgg

// A 6x6 Quattroquadri grid uses digits 1-9. Its 3x3 boxes, rows, and columns
// have no repeated digits. Every arrow's circle equals the sum of its shaft,
// and killer cages have distinct digits summing to their drawn totals. The
// anti-diagonal rule is omitted: the two red paths turn at grid corners, so
// the payload does not settle which cells form each stated diagonal.

// Circles and shafts transcribed from the six drawn arrows.
const arrows = [
  ['R4C6', 'R3C5', 'R2C4', 'R1C3'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R4C4', 'R3C3'],
  ['R3C2', 'R4C3', 'R5C4'],
  ['R6C4', 'R5C3', 'R4C2', 'R3C1'],
  ['R6C2', 'R6C1', 'R5C1'],
];

// The three drawn killer cages and their top-left totals.
const cages = [
  [23, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [11, 'R1C5', 'R1C6', 'R2C6'],
  [13, 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
];

return [
  new Shape('6x6', 9),
  new RegionSize(9),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
