// Title: Light Medallion
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=5VkYjh1iVaM
// Source: https://sudokupad.app/dBPFL8nh8B

// Normal sudoku rules apply (standard rows/cols/boxes, enforced automatically
// by Shape('9x9')). A gray circle contains an odd digit, and a gray square
// contains an even digit; there is no dedicated Odd/Even constraint class,
// so each marked cell's digit given is restricted to the matching
// multi-value parity set instead.
//
// Marker cell coordinates below are transcribed from the puzzle's gray
// circle/square overlay art.
//
// A handful of marker cells already carry a plain digit given whose value
// already satisfies the marker's parity, so no separate parity Given is
// added for those cells (R2C6, R3C1, R5C1, R9C5, R9C7 are odd-circles given
// 9/1/3/9/7; R4C8 is the even-square given 8).

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Digit givens.
const givens = [
  new Given('R1C3', 2),
  new Given('R1C4', 1),
  new Given('R2C3', 3),
  new Given('R2C4', 4),
  new Given('R2C6', 9),
  new Given('R3C1', 1),
  new Given('R4C8', 8),
  new Given('R5C1', 3),
  new Given('R6C8', 9),
  new Given('R6C9', 7),
  new Given('R7C2', 6),
  new Given('R7C3', 7),
  new Given('R7C8', 2),
  new Given('R7C9', 3),
  new Given('R8C2', 5),
  new Given('R8C3', 4),
  new Given('R9C5', 9),
  new Given('R9C7', 7),
];

// Odd-circle marker cells that do not already carry a digit given.
const oddOnlyCells = [
  'R4C7', 'R3C7', 'R3C6', 'R4C6',
  'R4C1', 'R4C2', 'R5C2', 'R5C3',
  'R7C5', 'R8C5', 'R8C6', 'R9C6',
];
const oddMarkers = oddOnlyCells.map((cell) => new Given(cell, ...ODD));

// The lone even-square marker (R4C8) already has a digit given above.
const evenMarkers = [];

return [
  new Shape('9x9'),
  ...givens,
  ...oddMarkers,
  ...evenMarkers,
];
