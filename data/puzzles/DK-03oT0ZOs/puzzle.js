// Title: Spring in the Step
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=DK-03oT0ZOs
// Source: https://app.crackingthecryptic.com/sudoku/37FhLLGT9p

// Normal sudoku rules apply: standard 9x9 grid, default 3x3 boxes, no givens.
//
// Quadruple circles: digits in a Quadruple circle must be placed at least
// once in the four cells touching that circle. Six of the eleven corners are
// drawn as two small digit-only circles stacked at the same corner rather
// than one four-digit circle. Two quadruple circles at the same corner are
// equivalent to one circle listing the union of their digits, so each such
// corner is encoded below as a single Quad with the combined digit list.
const quads = [
  new Quad('R2C5', 1, 2),
  new Quad('R3C3', 1, 2, 3),
  new Quad('R4C3', 7, 8, 9),
  new Quad('R6C1', 1, 2, 3, 4),
  new Quad('R7C1', 9),
  new Quad('R3C8', 1),
  new Quad('R2C7', 2),
  new Quad('R3C6', 7, 8, 9),
  new Quad('R4C6', 1, 2, 3),
  new Quad('R6C6', 8, 9),
  new Quad('R6C8', 6, 7, 8, 9),
];

// Region Sum Lines: digits on a Region Sum Line have an equal sum within
// each box the line passes through. Cell order is transcribed from the
// drawn line paths, including two corner-to-corner diagonal jumps
// (R7C3->R6C4 on line B, R6C6->R7C7 on line D) where the stroke crosses a
// grid vertex without a cell sitting there.
const regionSumLines = [
  new RegionSumLine('R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new RegionSumLine('R4C2', 'R5C2', 'R6C2', 'R6C1', 'R7C1', 'R7C2', 'R7C3', 'R6C4', 'R5C4', 'R4C4'),
  new RegionSumLine('R8C2', 'R8C3', 'R8C4', 'R7C4'),
  new RegionSumLine('R4C6', 'R5C6', 'R6C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R6C8', 'R5C8', 'R4C8'),
];

return [
  new Shape('9x9'),
  ...quads,
  ...regionSumLines,
];
