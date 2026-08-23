// Title: Equal Sum Lines 2
// Author: Maxim Li (28degrees)
// Video: https://www.youtube.com/watch?v=gLi5C-KdeKU
// Source: https://app.crackingthecryptic.com/sudoku/Ht8GBQBp9d

// Normal sudoku rules apply (standard 3x3 boxes, no givens). For each of the
// 10 drawn lines, it has an equal sum in each box it passes through; a line
// that re-enters a box it already visited sums each individual visit
// separately (rules text worked example, matched by line 3 below). This is
// exactly RegionSumLine's documented semantics, so each line is encoded as
// one RegionSumLine over its cells in drawn order.
//
// Cell lists are transcribed from the drawn lines in waypoint order; order
// matters because RegionSumLine partitions the list into box segments by
// walking it in order.

const lines = [
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R4C3', 'R3C3', 'R2C3', 'R3C4', 'R2C5'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R3C9', 'R2C8', 'R2C7', 'R2C6', 'R3C5', 'R4C4', 'R5C4', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R3C7', 'R3C8', 'R4C8', 'R5C7', 'R5C6', 'R4C5'],
  ['R5C5', 'R6C5', 'R6C4', 'R7C4', 'R7C5'],
  ['R6C6', 'R7C6', 'R8C5', 'R9C4'],
  ['R8C6', 'R9C6', 'R9C7', 'R9C8', 'R8C8'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...lines.map((cells) => new RegionSumLine(...cells)),
];
