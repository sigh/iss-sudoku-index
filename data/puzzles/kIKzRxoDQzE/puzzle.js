// Title: Vide
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=kIKzRxoDQzE
// Source: https://app.crackingthecryptic.com/sudoku/PqDM6Jjrnq

// Normal sudoku rules apply. Each pink line holds a set of consecutive,
// non-repeating digits, in any order (Renban). Cells joined by an X sum to
// 10; cells joined by a V sum to 5. Not every adjacent pair that would sum
// to 10 or 5 is marked, so absent markers carry no information (plain X/V,
// not the exhaustive StrictXV reading).

// The ten pink lines drawn in the source.
const renbanLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R3C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C3'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R2C6', 'R3C7', 'R3C8'],
  ['R3C4', 'R2C4', 'R2C5'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R9C5', 'R9C6', 'R8C6'],
];

// X markers (adjacent cells sum to 10).
const xPairs = [
  ['R2C2', 'R3C2'],
  ['R3C5', 'R3C6'],
  ['R5C8', 'R5C9'],
  ['R4C6', 'R5C6'],
  ['R8C8', 'R9C8'],
];

// V markers (adjacent cells sum to 5).
const vPairs = [
  ['R7C2', 'R8C2'],
  ['R5C1', 'R5C2'],
  ['R1C8', 'R2C8'],
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
];
