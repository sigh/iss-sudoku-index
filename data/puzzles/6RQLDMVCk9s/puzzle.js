// Title: Desert Bus
// Author: Space_man
// Video: https://www.youtube.com/watch?v=6RQLDMVCk9s
// Source: https://sudokupad.app/2ovb2c69ua

// Normal Sudoku rules apply (givens + default row/column/box all-different,
// boxes as drawn match the standard 3x3 boxes so no NoBoxes/RegionSize needed).
// German Whispers (green lines): adjacent cells on a line differ by >= 5.
// Renban (purple lines): the cells on a line hold a consecutive, non-repeating
// run of digits in any order.
//
// Several green lines are drawn as multiple strokes meeting at a shared cell
// (branches/bends), and two purple lines share endpoints with a green line,
// closing a loop where purple and green are both drawn. Each drawn stroke is
// encoded as its own line: Whisper/Renban semantics are purely about cells
// consecutive on their own line, so a branch point or a crossing with a
// different-coloured line needs no merged encoding.

const RENBAN_LINES = [
  ['R6C5', 'R7C5'],
  ['R8C5', 'R9C5'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R1C1', 'R1C2', 'R2C3', 'R3C3', 'R4C3', 'R5C2', 'R5C1'],
];

const WHISPER_LINES = [
  ['R2C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R1C5', 'R2C6'],
  ['R3C4', 'R2C5', 'R3C6'],
  ['R4C4', 'R3C5', 'R4C6'],
  ['R6C8', 'R6C7', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R6C6', 'R6C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R6C4', 'R6C3', 'R6C2'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C8', 'R4C9', 'R5C8', 'R5C7'],
  ['R3C8', 'R3C7'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
];

const renbans = RENBAN_LINES.map(cells => new Renban(...cells));
const whispers = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new Given('R5C2', 2),
  new Given('R5C8', 8),
  new Given('R9C2', 5),
  ...renbans,
  ...whispers,
];
