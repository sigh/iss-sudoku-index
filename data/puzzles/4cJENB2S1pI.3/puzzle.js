// Title: Dec 21, 2021: Renban
// Author: clover!
// Video: https://www.youtube.com/watch?v=4cJENB2S1pI
// Source: https://tinyurl.com/2p8j8p9p

// Normal sudoku rules apply (default rows/columns/3x3 boxes; no drawn regions).
// Each drawn line is a Renban line: its digits form a set of consecutive
// values, non-repeating, in any order along the line.

const givens = [
  ['R1C1', 1], ['R1C9', 5],
  ['R2C2', 5], ['R2C8', 9],
  ['R3C3', 9], ['R3C7', 8],
  ['R4C4', 1], ['R4C6', 5],
  ['R5C5', 4],
  ['R6C4', 3], ['R6C6', 7],
  ['R7C3', 3], ['R7C7', 2],
  ['R8C2', 7], ['R8C8', 5],
  ['R9C1', 6], ['R9C9', 8],
].map(([cell, value]) => new Given(cell, value));

// Renban lines, transcribed from the drawn geometry (all 13 share the same
// grey styling, so all are the one drawn line type).
const renbanLineCells = [
  ['R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6'],
  ['R8C6', 'R9C6'],
  ['R6C7', 'R7C7', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R9C1', 'R8C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C2', 'R2C2', 'R3C2'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C4', 'R2C4'],
  ['R1C7', 'R2C7', 'R3C7', 'R2C8', 'R1C9'],
];
const renbans = renbanLineCells.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...renbans,
];
