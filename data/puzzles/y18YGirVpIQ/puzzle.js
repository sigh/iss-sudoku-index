// Title: Reindeer
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=y18YGirVpIQ
// Source: https://sudokupad.app/MHHM4gJn2Q

// Normal Sudoku applies. Each drawn red line is both a region-sum line and a
// zipper line. The paths below are transcribed from the six drawn red lines.
const lines = [
  ['R2C9', 'R3C9', 'R4C8', 'R5C9', 'R6C8'],
  ['R1C7', 'R2C7', 'R2C6', 'R3C6'],
  ['R2C2', 'R3C3', 'R3C4', 'R4C3', 'R5C2'],
  ['R2C1', 'R3C1', 'R4C2', 'R4C1', 'R5C1'],
  ['R9C2', 'R8C3', 'R8C4', 'R9C5', 'R8C6'],
  ['R5C7', 'R6C7', 'R7C7', 'R8C7', 'R7C6', 'R7C5', 'R7C4'],
];

return [
  new Shape('9x9'),
  // Every segment of a line in a box has its line-specific equal sum.
  ...lines.map((cells) => new RegionSumLine(...cells)),
  // Cells equally far from a line's centre sum to its centre value.
  ...lines.map((cells) => new Zipper(...cells)),
];
