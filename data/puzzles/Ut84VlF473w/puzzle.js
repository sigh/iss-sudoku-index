// Title: Prison Break
// Author: Myxo
// Video: https://www.youtube.com/watch?v=Ut84VlF473w
// Source: https://app.crackingthecryptic.com/sudoku/hrDLhB43b8

// Normal sudoku rules apply (default 3x3 boxes).
// Cages: digits do not repeat; sum to the given corner total when one is
// printed, otherwise the cage is all-different only.
// Grey lines are "double arrow" lines: a circle sits at each end of the
// line, and the digits strictly between the two circles sum to the same
// total as the two circled digits.
//
// The 16 circles form the border ring of the central 5x5 block (rows/cols
// 3-7); the grey strokes are 10 straight diagonal double-arrow lines
// crossing through the interior 3x3 of that ring. The raw drawing stores
// them as 7 overlapping pen strokes that meet and re-diverge at shared
// interior cells, so the 10 lines below were reconstructed from the rules'
// own "double arrows ... do not turn at intersections" sentence: at every
// interior crossing cell exactly one pairing of its incident directions is
// collinear (opposite unit vectors), which forces a unique split into 10
// straight runs, each terminating at two ring circles. (Four of the ring
// circles -- the non-corner edge midpoints of the ring -- are shared as an
// endpoint by two different lines; the rest are used once.) This is a
// geometric deduction from the drawn strokes plus the stated rule, not a
// choice among readings.
const doubleArrowLines = [
  ['R5C7', 'R6C6', 'R7C5'],
  ['R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3'],
  ['R5C7', 'R4C6', 'R3C5'],
  ['R7C6', 'R6C5', 'R5C4', 'R4C3'],
  ['R3C5', 'R4C4', 'R5C3'],
  ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'],
  ['R3C4', 'R4C5', 'R5C6', 'R6C7'],
  ['R7C4', 'R6C5', 'R5C6', 'R4C7'],
];

// Killer cages (drawn totals), each: [total, ...cells].
const totalledCages = [
  [10, 'R4C1', 'R5C1', 'R5C2'],
  [11, 'R1C4', 'R1C5', 'R2C5'],
  [13, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [24, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [21, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [22, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [15, 'R9C5', 'R9C6', 'R9C7'],
  [14, 'R5C9', 'R6C9', 'R7C9'],
];

// Killer cages with no printed total (still real: all-different only).
const noTotalCages = [
  ['R6C1', 'R6C2', 'R7C2'],
  ['R1C6', 'R2C6', 'R2C7'],
];

return [
  new Shape('9x9'),
  ...doubleArrowLines.map(cells => new DoubleArrow(...cells)),
  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
];
