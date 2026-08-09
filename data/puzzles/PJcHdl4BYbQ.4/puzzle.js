// Title: VI VERI VSVDOKVM VIVVS VICI
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=PJcHdl4BYbQ
// Source: https://tinyurl.com/msbupcuy

// Normal sudoku. Digits in cells separated by a "V" badge sum to 5. The rules
// only say a marked V pair sums to 5 -- they never claim every adjacent pair
// summing to 5 is marked -- so only the 16 drawn V edges are constrained;
// unmarked adjacent pairs are unrestricted (cf. 6Occv5hd0tI, same wording).

const givens = [
  ['R1C3', 6], ['R1C5', 1],
  ['R2C2', 5], ['R2C8', 6],
  ['R3C9', 7],
  ['R5C1', 2], ['R5C5', 7], ['R5C9', 3],
  ['R7C1', 5],
  ['R8C2', 8], ['R8C8', 7],
  ['R9C5', 4], ['R9C7', 6],
].map(([cell, value]) => new Given(cell, value));

// V marks, from the payload's `xv` array.
const vs = [
  ['R1C1', 'R1C2'],
  ['R9C8', 'R9C9'],
  ['R7C9', 'R8C9'],
  ['R2C1', 'R3C1'],
  ['R7C2', 'R7C3'],
  ['R3C7', 'R3C8'],
  ['R4C3', 'R4C4'],
  ['R6C6', 'R6C7'],
  ['R6C4', 'R7C4'],
  ['R3C6', 'R4C6'],
  ['R2C4', 'R2C5'],
  ['R8C5', 'R8C6'],
  ['R8C3', 'R9C3'],
  ['R1C7', 'R2C7'],
  ['R4C2', 'R5C2'],
  ['R5C8', 'R6C8'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...vs,
];
