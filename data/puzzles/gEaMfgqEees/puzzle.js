// Title: Peace Dove
// Author: Phurba
// Video: https://www.youtube.com/watch?v=gEaMfgqEees
// Source: https://sudokupad.app/dffrtkne71

// Standard sudoku (rows/cols/boxes) plus a closed region sum line and two
// Kropki white-dot pairs. All three rule clauses are encoded directly:
// RegionSumLine enforces equal per-box-segment sums along the loop, and each
// WhiteDot enforces consecutive values on its edge. "Not all dots are
// necessarily given" needs no extra encoding: the puzzle only claims that
// undrawn edges carry no information, so no negative constraint applies to
// the un-dotted edges.

// Region sum line, a closed loop of 33 cells. Unlike sequential-pair line
// classes, RegionSumLine segments its cell list into consecutive same-box
// runs without wrapping the last run back into the first, so the closing
// cell is deliberately NOT repeated here (that would fabricate a spurious
// extra single-cell segment on box R7-9C7-9). The loop's own last and first
// cells fall in different boxes (R4-6C7-9 and R7-9C7-9), so no wrap-around
// segment is lost by omitting the repeat. Cell sequence transcribed from the
// drawn blue line's waypoints.
const regionSumLineCells = [
  'R7C7', 'R8C8', 'R8C7', 'R7C6', 'R8C5', 'R7C5', 'R6C5', 'R6C4', 'R7C3',
  'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R5C3', 'R5C4', 'R4C4', 'R3C3', 'R3C2',
  'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R4C5', 'R4C6', 'R3C7', 'R2C8', 'R3C8',
  'R4C7', 'R5C6', 'R6C6', 'R6C7', 'R5C8', 'R6C8',
];

// Two white Kropki dots, transcribed from the drawn edge overlays
// (white-filled, black-bordered edge marks).
const whiteDotPairs = [
  ['R2C4', 'R3C4'],
  ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new RegionSumLine(...regionSumLineCells),
  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
];
