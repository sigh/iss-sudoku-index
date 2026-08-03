// Title: Privy
// Author: dumediat
// Video: https://www.youtube.com/watch?v=qFqwl2z7URY
// Source: https://app.crackingthecryptic.com/sudoku/HtjBggbNfq

// Normal sudoku rules apply (rows, columns, 3x3 boxes).
// Green lines: adjacent digits must differ by at least 5 (Whisper(5)).
// Purple lines: digits form a set of consecutive values, in any order
// (Renban).
// Outside clues: sum of the digits strictly between the 1 and the 9 in the
// corresponding row/column (Sandwich); all given clues are top or left, as
// Sandwich requires.

// Green (difference) lines, drawn colour #A3E048, read from the payload's
// waypoints.
const whispers = [
  ['R6C3', 'R6C4', 'R5C4', 'R4C5', 'R4C4', 'R3C4'],
  ['R3C9', 'R3C8', 'R3C7', 'R2C6', 'R2C5'],
  ['R2C3', 'R3C2', 'R4C2', 'R5C1'],
].map(cells => new Whisper(5, ...cells));

// Purple (consecutive-set) lines, drawn colour #D23BE7, read from the
// payload's waypoints.
const renbans = [
  ['R4C7', 'R4C6', 'R5C6', 'R6C5', 'R6C6', 'R7C6'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C4', 'R8C5'],
  ['R8C7', 'R7C8', 'R6C8', 'R5C9'],
].map(cells => new Renban(...cells));

// Outside sandwich clues, read from the payload's edge text overlays.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const sandwiches = [
  Sandwich.fromCells(8, graph.column(2), geometry),
  Sandwich.fromCells(5, graph.column(4), geometry),
  Sandwich.fromCells(10, graph.column(6), geometry),
  Sandwich.fromCells(14, graph.column(7), geometry),
  Sandwich.fromCells(10, graph.row(3), geometry),
  Sandwich.fromCells(22, graph.row(4), geometry),
  Sandwich.fromCells(27, graph.row(7), geometry),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...sandwiches,
];
