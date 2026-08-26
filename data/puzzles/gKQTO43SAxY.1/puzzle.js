// Title: May 23, 2022: The Anduin
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gKQTO43SAxY
// Source: https://tinyurl.com/3zdwhjve

// Normal sudoku rules (default rows/cols/boxes). Nine region-sum lines, each
// crossing more than one box; RegionSumLine splits each line's cell list into
// consecutive box-runs and requires all runs on a line to share one sum.

// Given digits, transcribed from the payload's grid array.
const givens = [
  ['R1C1', 8], ['R1C2', 7], ['R1C3', 5], ['R1C4', 9],
  ['R2C1', 6], ['R2C2', 9],
  ['R3C1', 3],
  ['R4C1', 9],
  ['R6C9', 4],
  ['R7C9', 5],
  ['R8C8', 4], ['R8C9', 6],
  ['R9C6', 4], ['R9C7', 3], ['R9C8', 7], ['R9C9', 8],
];

// The nine region-sum-line cell paths, transcribed in drawn order from the
// payload's `regionsumline`/`line` arrays (identical duplicate entries,
// fromConstraint: "Region Sum Line").
const lines = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R5C1', 'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R1C5'],
  ['R9C5', 'R8C6', 'R8C7', 'R7C7', 'R7C8', 'R6C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
