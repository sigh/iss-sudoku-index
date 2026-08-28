// Title: March 24, 2022: Hi, Mark!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=rZ-4REgffY8
// Source: https://tinyurl.com/3dj8r73y

// Normal sudoku, no givens. Quadruple circles list digits that must all
// appear (in some order) among the surrounding four cells. XV pairs mark
// adjacent cells summing to 10 (X) or 5 (V); the ruleset states there is no
// negative constraint, so unmarked adjacent pairs are unrestricted.

// Quadruple clues, keyed by the top-left cell of each 2x2 square, from the
// payload's `quadruple` array.
const quadClues = {
  R3C3: [1, 2, 3, 4],
  R3C6: [6, 7, 8, 9],
  R6C3: [6, 7, 8, 9],
  R6C6: [1, 2, 3, 4],
  R7C4: [1, 2, 5, 9],
  R4C2: [1, 2, 3, 5],
  R5C7: [1, 3, 4, 5],
  R2C5: [2, 6, 8, 9],
};

// X pairs (sum to 10), from the payload's `xv` array.
const xPairs = [
  ['R5C3', 'R6C3'],
  ['R3C4', 'R3C5'],
  ['R4C7', 'R5C7'],
  ['R3C8', 'R3C7'],
  ['R7C3', 'R7C2'],
];

// V pairs (sum to 5), from the payload's `xv` array.
const vPairs = [
  ['R7C7', 'R8C7'],
  ['R3C3', 'R2C3'],
  ['R7C6', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...Object.entries(quadClues).map(
    ([topLeft, values]) => new Quad(topLeft, ...values)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
];
