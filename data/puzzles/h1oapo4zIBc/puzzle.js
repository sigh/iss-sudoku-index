// Title: Dutch Diamond
// Author: Bonehead
// Video: https://www.youtube.com/watch?v=h1oapo4zIBc
// Source: https://app.crackingthecryptic.com/sudoku/7HdFPr9MG7

// Normal sudoku rules (default row/column/box all-different; the payload's
// `regions` are nine standard 3x3 boxes, so no explicit region override is
// needed). Cages show sums with distinct digits (Cage). The orange line
// requires adjacent digits to differ by >= 4 (Whisper) and additionally to
// be pairwise distinct along its whole length -- a separate "digits do not
// repeat" clause, so it also gets an explicit AllDifferent. Each purple line
// holds a set of consecutive digits in any order (Renban matches this
// exactly). The marked (anti-)diagonal has no repeat digits (Diagonal).

// Cages: sum, cells -- transcribed from the payload's `cages` array.
const cages = [
  [12, 'R1C8', 'R1C9'],
  [13, 'R2C7', 'R3C7'],
  [8, 'R8C7', 'R8C8', 'R8C9'],
  [13, 'R7C3', 'R8C3'],
  [5, 'R3C2', 'R4C2'],
  [9, 'R4C5', 'R5C5', 'R6C5'],
  [19, 'R3C3', 'R3C4', 'R4C4'],
  [15, 'R5C6', 'R5C7', 'R5C8'],
];

// Purple (consecutive-set) lines -- four separate strokes, transcribed from
// the payload's `lines` array (same colour, but not one connected path: the
// endpoints don't touch).
const renbanLines = [
  ['R9C1', 'R8C2', 'R7C3'],
  ['R7C2', 'R6C2', 'R5C2', 'R4C2'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R4C7', 'R4C8', 'R4C9', 'R3C9'],
];

// Orange (Dutch-whisper) line -- a closed loop, transcribed from the
// payload's `lines` array. The polyline's first and last waypoints are the
// same cell (R7C5); the first cell is repeated at the end so Whisper's
// consecutive-pair binding also covers the wrap-around edge.
const orangeLoopCells =
  ['R7C5', 'R6C4', 'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6'];
const orangeLoopClosed = [...orangeLoopCells, orangeLoopCells[0]];

// Marked diagonal -- the anti-diagonal (R1C9..R9C1), direction 1 ('/').
const diagonal = new Diagonal(1);

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  new Whisper(4, ...orangeLoopClosed),
  new AllDifferent(...orangeLoopCells),
  diagonal,
];
