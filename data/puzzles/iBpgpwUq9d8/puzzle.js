// Title: Cornichon
// Author: Lorena
// Video: https://www.youtube.com/watch?v=iBpgpwUq9d8
// Source: https://sudokupad.app/y6up1l93d5

// Standard sudoku (default row/column/box all-different, no givens).
// Green "pickle lines" are German whisper lines: adjacent cells on a line
// differ by at least 5, encoded as Whisper(5, ...cells) per line.
// Light-green edge circles mean the two cells are consecutive (WhiteDot);
// dark-green edge circles mean one cell is double the other (BlackDot).
// The rules say dots are "not necessarily shown", so absence of a dot is not
// a negative constraint -- no StrictKropki.
// The single `cages` payload entry is a metadata stub with no cells and is
// not a real clue.

// Cell paths transcribed from the puzzle's drawn line strokes (interpolated
// through straight runs).
// Line 1: a 4-cell loop (R2C1-R2C2-R1C2-R1C1) with a tail cell R3C1 -- the
// repeated R2C1 at the end covers the loop's closing edge.
// Line 5 touches R3C6 only at its corner (diagonal steps either side); it is
// a separate line from line 4, which also touches R3C6 but with different
// neighbours on each side.
// Line 9 is a closed loop -- the repeated R8C2 at the end covers the
// wrap-around edge, per the closed-loop convention for sequential-pair line
// constraints.
const WHISPER_LINES = [
  ['R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C1', 'R2C1'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R1C5', 'R1C4', 'R2C4', 'R3C4', 'R3C5'],
  ['R2C6', 'R3C6', 'R4C6'],
  ['R4C7', 'R3C6', 'R2C7'],
  ['R2C8', 'R3C8', 'R4C8', 'R4C9'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R7C5', 'R7C6'],
  [
    'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C8',
    'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R6C1', 'R7C1', 'R8C2',
  ],
];

// Dot edges transcribed from the puzzle's drawn edge-centred circles.
// None of these edges coincide with a pickle-line edge above, so they are
// independent two-cell clues rather than annotations on a line.
const WHITE_DOT_PAIRS = [
  ['R6C2', 'R7C2'],
  ['R7C2', 'R7C3'],
  ['R5C3', 'R6C3'],
  ['R7C3', 'R7C4'],
  ['R5C5', 'R6C5'],
  ['R6C6', 'R7C6'],
  ['R6C6', 'R6C7'],
  ['R7C7', 'R8C7'],
  ['R6C7', 'R6C8'],
];

const BLACK_DOT_PAIRS = [
  ['R5C4', 'R6C4'],
  ['R6C7', 'R7C7'],
];

return [
  new Shape('9x9'),
  ...WHISPER_LINES.map(cells => new Whisper(5, ...cells)),
  ...WHITE_DOT_PAIRS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOT_PAIRS.map(([a, b]) => new BlackDot(a, b)),
];
