// Title: The Pipe
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=tSN9qgdTsI4
// Source: https://app.crackingthecryptic.com/sudoku/G8dtqj2nFf

// Normal sudoku rules apply on the standard 3x3-box 9x9 grid. Purple lines
// (Renban) hold a set of non-repeating consecutive digits in any order.
// Green lines (Whisper, difference 5) require adjacent cells to differ by
// at least 5.

// Green lines: the seven drawn green (#A3E048) polylines, transcribed
// cell-by-cell from their vertices.
const GREEN_LINES = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C2'],
  ['R2C2', 'R3C2', 'R2C3'],
  ['R2C5', 'R2C6'],
  ['R1C9', 'R2C9'],
  ['R6C9', 'R6C8', 'R7C7', 'R8C6', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R5C6', 'R6C6', 'R7C6'],
  ['R7C3', 'R8C3', 'R9C4'],
  ['R8C8', 'R9C8'],
];

// Purple lines: the six drawn purple (#D23BE7) polylines, transcribed the
// same way. A seventh purple entry has no vertices and draws nothing, so
// it is not encoded.
const PURPLE_LINES = [
  ['R4C3', 'R3C4', 'R2C4', 'R1C4'],
  ['R2C7', 'R2C8', 'R1C8'],
  ['R4C6', 'R3C7'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R7C9', 'R8C9', 'R8C8'],
  ['R9C7', 'R9C8', 'R9C9'],
];

const greenWhispers = GREEN_LINES.map(cells => new Whisper(5, ...cells));
const purpleRenbans = PURPLE_LINES.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  new Given('R5C8', 1),
  ...greenWhispers,
  ...purpleRenbans,
];
