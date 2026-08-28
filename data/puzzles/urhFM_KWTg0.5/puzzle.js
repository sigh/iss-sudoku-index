// Title: Nov 13, 2021: XV Pairs Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=urhFM_KWTg0
// Source: https://tinyurl.com/2efdhu78

// Normal sudoku rules apply, standard 3x3 boxes (none drawn). A V between two
// cells: the pair sums to 5. An X between two cells: the pair sums to 10. Not
// all Xs or Vs are necessarily given, so unmarked adjacent pairs carry no
// constraint -- only the 20 drawn marks below are encoded.

const givens = [
  ['R4C1', 9],
  ['R5C1', 2],
  ['R5C9', 3],
  ['R6C9', 8],
];

// V (sum to 5) marks, from the payload's xv structures.
const vPairs = [
  ['R4C3', 'R4C4'],
  ['R4C6', 'R3C6'],
  ['R6C7', 'R6C6'],
  ['R7C4', 'R6C4'],
  ['R4C4', 'R3C4'],
  ['R4C7', 'R4C6'],
  ['R6C6', 'R7C6'],
  ['R6C3', 'R6C4'],
  ['R1C1', 'R1C2'],
  ['R1C9', 'R2C9'],
  ['R9C9', 'R9C8'],
  ['R8C1', 'R9C1'],
];

// X (sum to 10) marks, from the payload's xv structures.
const xPairs = [
  ['R3C5', 'R3C4'],
  ['R5C7', 'R4C7'],
  ['R7C6', 'R7C5'],
  ['R6C3', 'R5C3'],
  ['R1C8', 'R1C9'],
  ['R9C2', 'R9C1'],
  ['R9C4', 'R9C5'],
  ['R1C6', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...vPairs.map((cells) => new V(...cells)),
  ...xPairs.map((cells) => new X(...cells)),
];
