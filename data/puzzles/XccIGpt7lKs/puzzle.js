// Title: Entangled
// Author: Yarr
// Video: https://www.youtube.com/watch?v=XccIGpt7lKs
// Source: https://app.crackingthecryptic.com/sudoku/rFJd9mN82f

// Normal sudoku rules apply (standard 3x3 boxes, from raw regions).
// Cages show their sums: killer cages, digits within a cage do not repeat.
// Digits cannot repeat along each marked purple diagonal -- one AllDifferent
// per line; the three purple lines are separate scopes even though they
// share the cell R7C7 (no rule text merges them).
// The blue line rule ("equal sums for each box the line passes through,
// total may differ line to line") is exactly RegionSumLine semantics: within
// one line, every segment inside a single box sums to the same N, and N is
// independent per line. Neither blue line revisits a box it has already left,
// so no start-rotation is needed.

const cages = [
  ['R2C4', 'R2C5', 'R2C6', 7],
  ['R4C2', 'R5C2', 'R6C2', 11],
  ['R8C4', 'R8C5', 'R8C6', 9],
  ['R4C8', 'R5C8', 'R6C8', 13],
];

const purpleDiagonals = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
];

const blueLines = [
  [
    'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9',
    'R7C8', 'R8C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R7C2', 'R6C1',
    'R5C1', 'R4C1', 'R3C2', 'R2C3',
  ],
  ['R6C3', 'R5C4', 'R4C4'],
];

return [
  new Shape('9x9'),
  ...cages.map(c => new Cage(c[c.length - 1], ...c.slice(0, -1))),
  ...purpleDiagonals.map(cells => new AllDifferent(...cells)),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
