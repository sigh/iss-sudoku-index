// Title: Sept. 18, 2022: German Coin
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tSRzvfVUpdE
// Source: https://tinyurl.com/ynh483wb

// Normal sudoku plus given digits. Digits directly connected by a green line
// differ by at least 5 (Whisper(5)).
//
// The outer ring is drawn as two strokes: a 24-cell path plus a short
// R7C1-R6C1 stroke that closes the loop back to its start, so both are
// encoded as separate Whisper(5) constraints covering every drawn edge. The
// centre diamond is drawn as a single open stroke (no closing segment from
// R5C4 back to R4C4), so it stays one Whisper(5) over its 8 cells with no
// wrap-around edge.
const givens = [
  ['R2C5', 6], ['R2C6', 9],
  ['R3C5', 4], ['R3C6', 5],
  ['R4C2', 8], ['R4C3', 4],
  ['R5C2', 6], ['R5C3', 1], ['R5C7', 3], ['R5C8', 8],
  ['R6C7', 4], ['R6C8', 6],
  ['R7C4', 5], ['R7C5', 2],
  ['R8C4', 7], ['R8C5', 9],
];

const outerRing = [
  'R7C1', 'R8C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C9',
  'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4',
  'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1',
];
const outerRingClosure = ['R7C1', 'R6C1'];
const centreDiamond = [
  'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
  new Whisper(5, ...outerRing),
  new Whisper(5, ...outerRingClosure),
  new Whisper(5, ...centreDiamond),
];
