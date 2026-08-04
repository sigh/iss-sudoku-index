// Title: Pigeonhole
// Author: Miky
// Video: https://www.youtube.com/watch?v=8-X8Z_V4_j0
// Source: https://app.crackingthecryptic.com/sudoku/pR4gN2n7pT

// Normal sudoku rules apply; the payload's regions are the standard nine 3x3
// boxes, so no explicit Regions constraint is needed.
// Each purple line is a Renban: its digits form a consecutive, non-repeating
// set in any order along the path.
// Each black dot is a 1:2 ratio pair (one digit double the other); each white
// dot is a consecutive pair. Both are between orthogonally adjacent cells.
// The rules state not every valid dot is drawn, so no negative constraint is
// implied for undotted adjacent cells.

const renbanLines = [
  ['R3C1', 'R4C2', 'R3C3', 'R2C4', 'R3C5'],
  ['R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C6'],
  ['R2C8', 'R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R5C9', 'R5C8', 'R4C8', 'R4C7', 'R3C6'],
  ['R6C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R8C8', 'R7C7', 'R8C6', 'R7C5', 'R6C4'],
  ['R6C3', 'R5C4', 'R4C5', 'R5C6', 'R6C7'],
  ['R5C2', 'R6C1', 'R7C2', 'R8C3', 'R9C2'],
  ['R9C3', 'R9C4', 'R9C5', 'R8C5', 'R8C4'],
].map(cells => new Renban(...cells));

// White (consecutive) dots between orthogonally adjacent cells.
const whiteDots = [
  ['R5C3', 'R5C4'],
  ['R5C4', 'R6C4'],
  ['R8C5', 'R8C6'],
  ['R8C6', 'R9C6'],
  ['R9C2', 'R9C3'],
  ['R7C9', 'R8C9'],
  ['R4C6', 'R4C7'],
  ['R1C8', 'R2C8'],
  ['R3C4', 'R3C5'],
].map(cells => new WhiteDot(...cells));

// Black (1:2 ratio) dot between orthogonally adjacent cells.
const blackDots = [
  ['R2C8', 'R3C8'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...renbanLines,
  ...whiteDots,
  ...blackDots,
];
