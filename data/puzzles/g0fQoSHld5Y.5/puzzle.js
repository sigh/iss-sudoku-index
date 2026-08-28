// Title: Clone Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=g0fQoSHld5Y
// Source: https://tinyurl.com/2p892h2x

// Normal sudoku rules apply. Two grey 3x3 regions (offset one row/col from the
// standard box grid, so each overlaps four different boxes) each contain 1-9,
// and hold the same digits in the same relative positions as each other.
// Nothing is omitted.

// Grey region cells, transcribed from the payload's `extraregion` array.
const GREY_A = ['R2C2','R2C3','R2C4','R3C2','R3C3','R3C4','R4C2','R4C3','R4C4'];
const GREY_B = ['R6C6','R6C7','R6C8','R7C6','R7C7','R7C8','R8C6','R8C7','R8C8'];

// Two fully-filled standard boxes, transcribed from the payload's given grid.
const GIVENS = {
  R2C6: 4, R2C7: 5, R2C8: 6,
  R3C6: 7, R3C7: 8, R3C8: 9,
  R4C6: 2, R4C7: 3, R4C8: 1,
  R6C2: 1, R6C3: 2, R6C4: 3,
  R7C2: 4, R7C3: 5, R7C4: 6,
  R8C2: 7, R8C3: 8, R8C4: 9,
};

return [
  new Shape('9x9'),
  ...Object.entries(GIVENS).map(([cell, v]) => new Given(cell, v)),
  new AllDifferent(...GREY_A),
  new AllDifferent(...GREY_B),
  // Clone: each grey-A cell equals the grey-B cell at the same list position.
  ...GREY_A.map((a, i) => new SameValues(2, a, GREY_B[i])),
];
