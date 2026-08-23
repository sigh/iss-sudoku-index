// Title: S.A.T. Sudoku
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=nULHzaDO7GE
// Source: https://app.crackingthecryptic.com/sudoku/mFrFt2R4gr
//
// Normal sudoku rules apply. Each 3x3 box contains 4 ovals, one per interior
// 2x2 quadrant of the box. Exactly one oval is correct: every digit printed
// in it must appear somewhere in its surrounding 4 cells. The other three
// are incorrect: no digit printed in them may appear anywhere in their own
// surrounding 4 cells.
//
// A multi-digit oval's "digits" are its individual decimal digits (81 -> 8
// and 1). Ovals whose number contains a 0 (20, 30, 40) can never be the
// correct one, since 0 never appears on the grid -- ContainAtLeast for such
// an oval is simply unsatisfiable, which the Or below handles without
// special-casing.

const givens = [
  ['R1C1', 1], ['R1C4', 2], ['R1C7', 3],
  ['R4C1', 4], ['R4C4', 5], ['R4C7', 6],
  ['R7C1', 7], ['R7C4', 8], ['R7C7', 9],
];

// Per box, the 4 quadrant ovals in reading order (top-left, top-right,
// bottom-left, bottom-right), each as [printed number, its 4 surrounding
// cells]. Transcribed from the payload's overlay corner coordinates.
const boxes = [
  // Box 1 (R1-3,C1-3)
  [
    [1, ['R1C1', 'R1C2', 'R2C1', 'R2C2']],
    [7, ['R1C2', 'R1C3', 'R2C2', 'R2C3']],
    [3, ['R2C1', 'R2C2', 'R3C1', 'R3C2']],
    [4, ['R2C2', 'R2C3', 'R3C2', 'R3C3']],
  ],
  // Box 2 (R1-3,C4-6)
  [
    [16, ['R1C4', 'R1C5', 'R2C4', 'R2C5']],
    [36, ['R1C5', 'R1C6', 'R2C5', 'R2C6']],
    [25, ['R2C4', 'R2C5', 'R3C4', 'R3C5']],
    [49, ['R2C5', 'R2C6', 'R3C5', 'R3C6']],
  ],
  // Box 3 (R1-3,C7-9)
  [
    [3, ['R1C7', 'R1C8', 'R2C7', 'R2C8']],
    [9, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
    [27, ['R2C7', 'R2C8', 'R3C7', 'R3C8']],
    [81, ['R2C8', 'R2C9', 'R3C8', 'R3C9']],
  ],
  // Box 4 (R4-6,C1-3)
  [
    [12, ['R4C1', 'R4C2', 'R5C1', 'R5C2']],
    [16, ['R4C2', 'R4C3', 'R5C2', 'R5C3']],
    [20, ['R5C1', 'R5C2', 'R6C1', 'R6C2']],
    [24, ['R5C2', 'R5C3', 'R6C2', 'R6C3']],
  ],
  // Box 5 (R4-6,C4-6)
  [
    [15, ['R4C4', 'R4C5', 'R5C4', 'R5C5']],
    [20, ['R4C5', 'R4C6', 'R5C5', 'R5C6']],
    [25, ['R5C4', 'R5C5', 'R6C4', 'R6C5']],
    [30, ['R5C5', 'R5C6', 'R6C5', 'R6C6']],
  ],
  // Box 6 (R4-6,C7-9)
  [
    [18, ['R4C7', 'R4C8', 'R5C7', 'R5C8']],
    [24, ['R4C8', 'R4C9', 'R5C8', 'R5C9']],
    [30, ['R5C7', 'R5C8', 'R6C7', 'R6C8']],
    [36, ['R5C8', 'R5C9', 'R6C8', 'R6C9']],
  ],
  // Box 7 (R7-9,C1-3)
  [
    [14, ['R7C1', 'R7C2', 'R8C1', 'R8C2']],
    [21, ['R7C2', 'R7C3', 'R8C2', 'R8C3']],
    [28, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
    [35, ['R8C2', 'R8C3', 'R9C2', 'R9C3']],
  ],
  // Box 8 (R7-9,C4-6)
  [
    [16, ['R7C4', 'R7C5', 'R8C4', 'R8C5']],
    [24, ['R7C5', 'R7C6', 'R8C5', 'R8C6']],
    [32, ['R8C4', 'R8C5', 'R9C4', 'R9C5']],
    [40, ['R8C5', 'R8C6', 'R9C5', 'R9C6']],
  ],
  // Box 9 (R7-9,C7-9)
  [
    [18, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
    [27, ['R7C8', 'R7C9', 'R8C8', 'R8C9']],
    [81, ['R8C7', 'R8C8', 'R9C7', 'R9C8']],
    [45, ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
  ],
];

// Unique decimal digits of a printed number, e.g. digitsOf(81) = [8, 1].
function digitsOf(n) {
  return [...new Set(String(n).split('').map(Number))];
}

const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// For each box, exactly one of its 4 ovals is the correct one: Or over which
// index is correct, each branch requiring that oval's digits all present
// (Quad, since every oval is exactly a 2x2 square) and every other oval's
// digits all absent (Given restricted to the complementary digit set on
// each of that oval's cells).
const ovalConstraints = boxes.map(ovals => new Or(
  ovals.map((_, correctIndex) => new And(
    ovals.flatMap(([number, cells], i) => {
      const digits = digitsOf(number);
      if (i === correctIndex) {
        return [new Quad(cells[0], ...digits)];
      }
      const forbidden = new Set(digits);
      const allowed = allDigits.filter(d => !forbidden.has(d));
      return cells.map(cell => new Given(cell, ...allowed));
    })
  ))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...ovalConstraints,
];
