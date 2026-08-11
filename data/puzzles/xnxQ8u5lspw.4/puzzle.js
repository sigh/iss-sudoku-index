// Title: June 18, 2022: XIIVII
// Author: clover!
// Video: https://www.youtube.com/watch?v=xnxQ8u5lspw
// Source: https://tinyurl.com/2zkmy6rc

// Standard sudoku givens. An "XII" marker straddling the border between two
// orthogonally adjacent cells means those two digits sum to 12; a "VII"
// marker means they sum to 7. Not every adjacent pair summing to 12 or 7 is
// marked, so absence carries no information (no negative constraint). Each
// marked pair already shares a row or column, so plain sudoku all-different
// already forces the two digits apart -- `Sum` (not `Cage`) is enough.
const givens = [
  ['R2C2', 3], ['R3C3', 1], ['R3C5', 5], ['R4C4', 2], ['R5C5', 9],
  ['R6C6', 7], ['R7C5', 1], ['R7C7', 9], ['R8C8', 4],
];

// XII markers (sum = 12); each entry names the two cells straddled by the
// drawn marker.
const xiiPairs = [
  ['R1C1', 'R1C2'], ['R7C1', 'R8C1'],
  ['R8C2', 'R9C2'], ['R7C3', 'R8C3'],
  ['R3C6', 'R4C6'], ['R5C7', 'R6C7'],
  ['R4C8', 'R5C8'], ['R5C9', 'R6C9'],
  ['R9C8', 'R9C9'],
];

// VII markers (sum = 7); each entry names the two cells straddled by the
// drawn marker.
const viiPairs = [
  ['R1C2', 'R1C3'], ['R4C1', 'R5C1'],
  ['R5C2', 'R6C2'], ['R4C3', 'R5C3'],
  ['R6C4', 'R7C4'], ['R2C7', 'R3C7'],
  ['R1C8', 'R2C8'], ['R2C9', 'R3C9'],
  ['R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xiiPairs.map(([a, b]) => new Sum(12, a, b)),
  ...viiPairs.map(([a, b]) => new Sum(7, a, b)),
];
