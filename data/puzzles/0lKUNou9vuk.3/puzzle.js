// Title: Feb 9, 2022: Odd/Even Renban
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=0lKUNou9vuk
// Source: https://tinyurl.com/ynhn8pwh

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// Digits on a pink line must form a set of consecutive digits, but in any
// order -- Renban. All 10 drawn lines share one colour (#F6C1FA), so all are
// Renban lines.
// Digits in a grey circle must be odd; digits in a grey square must be even
// -- encoded as a restricted-value Given, since ISS has no Odd/Even class.

const renbanLines = [
  ['R5C9', 'R6C9', 'R7C9'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R9C2', 'R9C1'],
  ['R5C1', 'R4C1', 'R3C1'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R4C5', 'R4C4', 'R4C3'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R4C8', 'R3C8', 'R2C8'],
  ['R1C8', 'R1C9'],
];

const oddCells = [
  'R2C2', 'R2C4', 'R2C6', 'R2C8', 'R4C8', 'R6C2',
  'R8C2', 'R3C1', 'R5C1', 'R7C9', 'R4C4', 'R4C5',
];

const evenCells = [
  'R8C4', 'R8C6', 'R8C8', 'R5C9', 'R6C6', 'R6C5', 'R9C1', 'R1C9',
];

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C1', 3),
  new Given('R1C2', 4),
  new Given('R1C6', 7),
  new Given('R2C9', 7),
  new Given('R8C1', 2),
  new Given('R9C4', 9),
  new Given('R9C8', 6),
  new Given('R9C9', 8),

  // Grey circles: digit must be odd.
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),

  // Grey squares: digit must be even.
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),

  // Pink lines: Renban (consecutive set, any order).
  ...renbanLines.map((cells) => new Renban(...cells)),
];
