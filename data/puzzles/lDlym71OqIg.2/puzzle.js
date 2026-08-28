// Title: Feb 13, 2022: XV
// Author: clover!
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/2p9cbhfs

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes).
//
// X markers: the two orthogonally adjacent cells sum to 10 (ISS `X`).
// V markers: the two orthogonally adjacent cells sum to 5 (ISS `V`).
// The rules text states explicitly that an unmarked pair carries no
// information ("If a pair of digits isn't marked, you don't know anything
// about its sum"), so no negative constraint (StrictXV) is placed on
// unmarked adjacent pairs.

// Givens transcribed from the payload's grid.
const givens = [
  ['R2C5', 1], ['R3C3', 7], ['R3C7', 4], ['R5C2', 6],
  ['R5C8', 8], ['R7C3', 3], ['R7C7', 5], ['R8C5', 2],
];

// XV marker pairs, transcribed from the payload's `xv` array.
const xPairs = [
  ['R4C3', 'R4C4'], ['R4C7', 'R4C6'], ['R6C7', 'R6C6'], ['R6C3', 'R6C4'],
  ['R5C9', 'R4C9'], ['R4C1', 'R3C1'], ['R7C9', 'R6C9'], ['R7C1', 'R8C1'],
  ['R2C9', 'R3C9'], ['R2C7', 'R2C6'],
];
const vPairs = [
  ['R4C4', 'R3C4'], ['R4C6', 'R3C6'], ['R6C6', 'R7C6'], ['R6C4', 'R7C4'],
  ['R5C1', 'R6C1'], ['R2C2', 'R3C2'], ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
