// Title: Squiggle
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=MhYn1bph6j4
// Source: https://sudokupad.app/ru676yn5px

// Normal Sudoku rules apply. Each blue line is a region sum line: box borders
// split it into segments, and every segment of a given line sums to the same
// total (RegionSumLine's per-instance sum applies per box visit, so a line
// that re-enters a box it already left gets a separate equal-sum segment
// there too, matching the drawn squiggly paths below).
// Cell paths transcribed from the drawn waypoints of the four blue lines.
const blueLines = [
  ['R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C5', 'R3C6', 'R2C7', 'R1C6', 'R2C5'],
  [
    'R4C1', 'R4C2', 'R3C3', 'R4C3', 'R5C3',
    'R5C4', 'R6C3', 'R6C2', 'R7C1', 'R8C2',
  ],
  [
    'R9C4', 'R8C4', 'R7C3', 'R7C4', 'R7C5',
    'R6C5', 'R7C6', 'R8C6', 'R9C7', 'R8C8',
  ],
  [
    'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6',
    'R5C7', 'R6C7', 'R7C7', 'R6C8', 'R6C9',
  ],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
