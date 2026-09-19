// Title: Diagonal Pi
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=EnS9n_7sVtc
// Source: https://sudokupad.app/mmsgaq4ylr

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes).
// Adjacent digits along a green line differ by at least 5: one Whisper(5, ...)
// per drawn stroke below, so only cells actually joined in the art are bound.
// A black dot marks two cells in ratio 1:2 (BlackDot). The rules add "Not all
// possible black dots necessarily are given", so a missing dot carries no
// information -- only the three drawn dots are encoded, with no negative
// (StrictKropki-style) constraint over unmarked pairs.

const whispers = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C8', 'R2C9'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R7C1', 'R8C2', 'R9C3'],
].map((cells) => new Whisper(5, ...cells));

// Black dots, drawn as cell-edge markers; each resolved to the adjacent cell
// pair the edge separates.
const blackDots = [
  ['R1C4', 'R1C5'],
  ['R1C5', 'R2C5'],
  ['R5C8', 'R6C8'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  new Given('R1C1', 3),
  new Given('R2C2', 1),
  new Given('R3C3', 4),
  new Given('R4C4', 1),
  new Given('R5C5', 5),
  new Given('R6C6', 9),
  new Given('R7C7', 2),
  new Given('R8C8', 6),
  new Given('R9C9', 5),
  ...whispers,
  ...blackDots,
];
