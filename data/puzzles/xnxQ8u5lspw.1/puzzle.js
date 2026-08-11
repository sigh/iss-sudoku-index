// Title: June 21, 2022: XIIIVIII
// Author: clover!
// Video: https://www.youtube.com/watch?v=xnxQ8u5lspw
// Source: https://tinyurl.com/5n7uszsp

// Standard sudoku givens. An "XIII" marker straddling the border between two
// orthogonally adjacent cells means those two digits sum to 13; a "VIII"
// marker means they sum to 8. Not every adjacent pair summing to 13 or 8 is
// marked, so absence carries no information (no negative constraint). Each
// marked pair already shares a row or column, so plain sudoku all-different
// already forces the two digits apart -- `Sum` (not `Cage`) is enough.
const givens = [
  ['R2C5', 5], ['R3C3', 4], ['R3C7', 6], ['R4C2', 8], ['R4C8', 9],
  ['R5C5', 1], ['R6C2', 4], ['R6C8', 2], ['R7C3', 9], ['R7C7', 8],
  ['R8C4', 9], ['R8C6', 7],
];

// XIII markers (sum = 13); each entry names the two cells straddled by the
// drawn marker.
const xiiiPairs = [
  ['R1C1', 'R1C2'], ['R1C8', 'R1C9'],
  ['R3C4', 'R4C4'], ['R3C5', 'R4C5'], ['R3C6', 'R4C6'],
  ['R5C2', 'R5C3'], ['R5C7', 'R5C8'],
  ['R6C4', 'R7C4'], ['R6C5', 'R7C5'], ['R6C6', 'R7C6'],
  ['R8C3', 'R9C3'], ['R8C7', 'R9C7'],
];

// VIII markers (sum = 8); each entry names the two cells straddled by the
// drawn marker.
const viiiPairs = [
  ['R1C3', 'R1C4'], ['R1C6', 'R1C7'],
  ['R4C3', 'R4C4'], ['R4C6', 'R4C7'],
  ['R5C3', 'R5C4'], ['R5C6', 'R5C7'],
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xiiiPairs.map(([a, b]) => new Sum(13, a, b)),
  ...viiiPairs.map(([a, b]) => new Sum(8, a, b)),
];
