// Title: Bent Diagonal Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=MhlzTkWXXEM
// Source: https://tinyurl.com/p9mzez5w

// Normal Sudoku Rules Apply. Each of the four bent diagonals must contain
// the digits 1-9.
//
// The source draws three line segments radiating from the center cell
// R5C5 to the bottom-left corner, the top-right corner, and straight
// through to both the top-left and bottom-right corners (the ordinary
// main diagonal). Splitting the main diagonal at its center gives four
// "arms" meeting at R5C5: bottom-left-arm, top-right-arm (these two lie on
// the anti-diagonal), top-left-arm, bottom-right-arm (these two lie on the
// main diagonal). Pairing one anti-diagonal arm with one main-diagonal arm
// at the shared center cell produces a 9-cell path that turns 90 degrees at
// R5C5 -- a bent diagonal -- matching the rule's count of exactly four (the
// two same-diagonal pairings would just reconstruct the ordinary straight
// diagonals, not bent ones).

const bottomLeftArm = ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'];
const topRightArm = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5'];
const topLeftArm = ['R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'];
const bottomRightArm = ['R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];

// Each bent diagonal is one anti-diagonal arm plus one main-diagonal arm,
// sharing the center cell R5C5 once.
const bentDiagonals = [
  [...bottomLeftArm, ...topLeftArm.slice(1)],
  [...bottomLeftArm, ...bottomRightArm.slice(1)],
  [...topRightArm, ...topLeftArm.slice(1)],
  [...topRightArm, ...bottomRightArm.slice(1)],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 6), new Given('R1C8', 3),
  new Given('R2C1', 5), new Given('R2C3', 7), new Given('R2C5', 2),
  new Given('R2C7', 4), new Given('R2C9', 6),
  new Given('R3C2', 1), new Given('R3C8', 5),
  new Given('R4C5', 1),
  new Given('R5C2', 5), new Given('R5C4', 2), new Given('R5C6', 4),
  new Given('R5C8', 9),
  new Given('R6C5', 3),
  new Given('R7C2', 7), new Given('R7C8', 8),
  new Given('R8C1', 6), new Given('R8C3', 8), new Given('R8C5', 9),
  new Given('R8C7', 5), new Given('R8C9', 7),
  new Given('R9C2', 9), new Given('R9C8', 6),

  ...bentDiagonals.map((cells) => new AllDifferent(...cells)),
];
