// Title: February 10, 2022: Copycat
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0lKUNou9vuk
// Source: https://tinyurl.com/2p9d64bb

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// Digits along green lines must differ by at least 5 -- Whisper(5). All 10
// drawn lines share one colour (#B0FFB0), so all are green Whisper lines.
// Digits in a grey circle must be odd; digits in a grey square must be even
// -- encoded as a restricted-value Given, since ISS has no Odd/Even class.

const whisperLines = [
  ['R4C3', 'R4C4', 'R4C5'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R1C8', 'R1C9'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R6C2', 'R7C2', 'R8C2'],
  ['R9C1', 'R9C2'],
  ['R5C1', 'R4C1', 'R3C1'],
];

const oddCells = [
  'R2C4', 'R2C6', 'R4C5', 'R4C4', 'R3C1', 'R5C1', 'R6C2',
  'R8C2', 'R7C9', 'R4C8', 'R2C8', 'R5C9', 'R8C8',
];

const evenCells = [
  'R9C1', 'R6C5', 'R6C6', 'R1C9', 'R8C4', 'R8C6', 'R2C2',
];

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C5', 6),
  new Given('R3C6', 9),
  new Given('R3C9', 7),
  new Given('R4C7', 5),
  new Given('R6C3', 4),
  new Given('R7C1', 2),
  new Given('R7C4', 3),
  new Given('R9C5', 1),

  // Grey circles: digit must be odd.
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),

  // Grey squares: digit must be even.
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),

  // Green lines: adjacent digits differ by at least 5.
  ...whisperLines.map((cells) => new Whisper(5, ...cells)),
];
