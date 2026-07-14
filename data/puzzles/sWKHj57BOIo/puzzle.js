// Title: The Climb
// Author: Hypekat
// Video: https://www.youtube.com/watch?v=sWKHj57BOIo
// Source: https://sudokupad.app/lk1qmzhj60
//
// Normal sudoku rules, standard 3x3 boxes, no given digits.
//
// Killer cages: digits in a cage do not repeat and sum to the given total.
// Renban lines: digits on a line form a non-repeating consecutive run, in
// any order. Drawn as light-tan SVG paths (mountain-climbing theme); decoded
// by mapping pixel coordinates onto the grid and keeping only cell-centre
// points (curve control points at a corner are themselves a cell centre;
// the surrounding mid-edge points are rendering artifacts, not extra cells).
// XV pairs: joined digits sum to 10 (X) or 5 (V). Not all X/V pairs are
// necessarily marked, so no negative inference is encoded for unmarked
// adjacent cells.

const cages = [
  [18, 'R1C4', 'R2C4', 'R3C4'],
  [14, 'R1C6', 'R2C6', 'R3C6'],
  [15, 'R7C4', 'R8C4', 'R9C4'],
  [13, 'R7C6', 'R8C6', 'R9C6'],
  [15, 'R4C5', 'R5C5', 'R6C5'],
  [8, 'R1C9', 'R2C9', 'R3C9'],
  [8, 'R1C1', 'R2C1', 'R3C1'],
  [16, 'R4C1', 'R5C1', 'R6C1'],
  [21, 'R7C1', 'R8C1', 'R9C1'],
  [16, 'R4C9', 'R5C9', 'R6C9'],
  [21, 'R7C9', 'R8C9', 'R9C9'],
];

const renbanLines = [
  ['R1C9', 'R1C8', 'R2C7', 'R3C6', 'R4C5'],
  ['R2C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5'],
  ['R5C4', 'R6C5', 'R7C5'],
  ['R8C5', 'R7C6', 'R6C7', 'R7C8'],
  ['R7C4', 'R6C3', 'R7C2', 'R8C1'],
  ['R8C3', 'R8C4', 'R9C5'],
  ['R9C7', 'R8C8', 'R9C9'],
  ['R4C9', 'R3C9', 'R3C8', 'R4C7'],
];

const xPairs = [
  ['R5C5', 'R6C5'],
  ['R7C5', 'R8C5'],
  ['R2C8', 'R2C9'],
  ['R4C8', 'R5C8'],
  ['R8C6', 'R8C7'],
  ['R5C2', 'R5C3'],
  ['R2C3', 'R2C4'],
];

const vPairs = [
  ['R5C5', 'R5C6'],
  ['R1C8', 'R1C9'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
  ...xPairs.map((cells) => new X(...cells)),
  ...vPairs.map((cells) => new V(...cells)),
];
