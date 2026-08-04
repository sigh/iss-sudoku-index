// Title: Snuggie
// Author: Chefofdeath
// Video: https://www.youtube.com/watch?v=6Occv5hd0tI
// Source: https://app.crackingthecryptic.com/sudoku/9NpbhqmLH3

// Normal sudoku. Green lines: adjacent digits differ by >= 5 (Whisper 5).
// Purple lines: digits form a non-repeating consecutive set, any order
// (Renban). Each drawn line is its own payload entry and is kept as its own
// clue, even where two lines share an endpoint cell (e.g. the two green
// lines meeting at R5C2 read as separate arms of a star, not one path).
//
// The rules only say a marked V pair must sum to 5 -- they never claim every
// adjacent pair summing to 5 is marked -- so only the two drawn V edges are
// constrained; unmarked adjacent pairs are unrestricted.

const whispers = [
  ['R8C1', 'R9C1', 'R8C2', 'R9C3', 'R8C4', 'R7C3', 'R6C2', 'R7C1'],
  ['R7C9', 'R6C8', 'R7C7', 'R8C6', 'R9C7', 'R8C8', 'R9C9', 'R8C9'],
  ['R5C2', 'R4C2'],
  ['R6C3', 'R5C2', 'R6C1'],
  ['R6C7', 'R5C8', 'R6C9'],
].map(cells => new Whisper(5, ...cells));

const renbans = [
  ['R9C2', 'R8C3', 'R7C2'],
  ['R7C8', 'R8C7', 'R9C8'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R4C8', 'R5C8'],
  ['R2C2', 'R1C3'],
  ['R2C8', 'R1C7'],
  ['R3C6', 'R4C5', 'R3C4'],
  ['R1C5', 'R2C5'],
  ['R6C9', 'R5C9'],
  ['R6C5', 'R7C4'],
].map(cells => new Renban(...cells));

const vs = [
  ['R2C3', 'R2C4'],
  ['R6C6', 'R7C6'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...vs,
];
