// Title: Mar 11, 2022: XV Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=XUQkX8NiRXw
// Source: https://tinyurl.com/5n8fysev

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes).
//
// X markers: the two adjacent cells sum to 10 (ISS `X`).
// V markers: the two adjacent cells sum to 5 (ISS `V`).
// The rules text explicitly states there is no negative constraint --
// unmarked adjacent pairs may still sum to 5 or 10 -- so no `StrictXV` or
// hand-written negation is placed on unmarked pairs.

const givens = [
  ['R1C4', 1],
  ['R2C9', 7],
  ['R4C1', 1],
  ['R4C2', 5],
  ['R5C5', 7],
  ['R6C8', 5],
  ['R6C9', 8],
  ['R8C1', 7],
  ['R9C6', 1],
];

// X marker pairs, transcribed from the payload's `xv` array (value="X").
const xPairs = [
  ['R2C2', 'R2C3'],
  ['R3C4', 'R3C3'],
  ['R7C5', 'R7C6'],
  ['R8C6', 'R8C7'],
  ['R4C5', 'R4C4'],
  ['R6C5', 'R6C4'],
  ['R7C1', 'R7C2'],
  ['R8C2', 'R8C3'],
  ['R2C6', 'R2C7'],
  ['R3C8', 'R3C7'],
  ['R4C9', 'R4C8'],
];

// V marker pairs, transcribed from the payload's `xv` array (value="V").
const vPairs = [
  ['R2C4', 'R2C3'],
  ['R3C5', 'R3C4'],
  ['R7C6', 'R7C7'],
  ['R8C8', 'R8C7'],
  ['R4C5', 'R4C6'],
  ['R6C5', 'R6C6'],
  ['R7C2', 'R7C3'],
  ['R8C3', 'R8C4'],
  ['R2C8', 'R2C7'],
  ['R3C9', 'R3C8'],
  ['R6C1', 'R6C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
