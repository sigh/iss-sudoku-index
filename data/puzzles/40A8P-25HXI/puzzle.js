// Title: X-ist
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=40A8P-25HXI
// Source: https://sudokupad.app/xclqgh5tsm

// Normal sudoku, plus:
// - Both main diagonals hold no repeated digit.
// - Every line is simultaneously a German Whisper line (adjacent cells
//   differ by >= 5) and a Nabner line (no two cells anywhere on the line,
//   not just adjacent ones, hold consecutive digits; digits do not repeat
//   on the line).

const lines = [
  ['R1C3', 'R2C4', 'R3C4', 'R4C5'],
  ['R5C4', 'R6C3', 'R7C3', 'R8C2'],
  ['R6C5', 'R7C6', 'R8C6', 'R9C7'],
  ['R5C6', 'R4C7', 'R3C7', 'R2C8'],
  ['R8C4', 'R8C3', 'R9C3', 'R9C4'],
];

// "No two digits on a line can be consecutive, regardless of their position"
// is a relation over every pair of cells on the line, not just
// line-adjacent pairs, so it needs PairX (all pairs) rather than the
// line-adjacency handling built into Whisper/Renban-style classes.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  new Given('R3C1', 5),
  new Given('R5C5', 9),
  new Given('R8C9', 7),

  new Diagonal(-1),
  new Diagonal(1),

  ...lines.map(cells => new Whisper(5, ...cells)),
  ...lines.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),
  ...lines.map(cells => new AllDifferent(...cells)),
];
