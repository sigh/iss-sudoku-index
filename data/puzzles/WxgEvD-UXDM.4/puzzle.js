// Title: Mathrax Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=WxgEvD-UXDM
// Source: https://app.crackingthecryptic.com/sudoku/qh9JfG47bJ

// Normal sudoku rules apply. White circles at grid-line intersections carry
// a number and a maths operation. When that operation is applied to each of
// the diagonally opposite pairs of digits surrounding the circle, the
// result is always equal to the circled number.

// Each mark names its intersection by the four surrounding cells in
// [topLeft, topRight, bottomLeft, bottomRight] order. The two diagonal
// pairs are (topLeft, bottomRight) and (topRight, bottomLeft); both pairs
// must independently satisfy the marked operation and value.
const arithmeticMarks = [
  ['6+', '+', 6, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['10+', '+', 10, 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['6+', '+', 6, 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['9x', 'x', 9, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['10+', '+', 10, 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['6x', 'x', 6, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['11+', '+', 11, 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['16x', 'x', 16, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  ['6x', 'x', 6, 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['10+', '+', 10, 'R4C8', 'R4C9', 'R5C8', 'R5C9'],
];

// One binary relation per operator+value combination, applied to both
// diagonal pairs of the corresponding intersection.
function opKey(op, value) {
  switch (op) {
    case '+':
      return Pair.fnToKey((a, b) => a + b === value, 9);
    case 'x':
      return Pair.fnToKey((a, b) => a * b === value, 9);
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

const mathraxConstraints = arithmeticMarks.flatMap(
  ([label, op, value, tl, tr, bl, br]) => {
    const key = opKey(op, value);
    const name = `Mathrax ${label}`;
    return [
      new Pair(key, name, tl, br),
      new Pair(key, name, tr, bl),
    ];
  });

return [
  new Shape('9x9'),
  new Given('R1C1', 7),
  new Given('R2C8', 1),
  new Given('R3C3', 1),
  new Given('R3C6', 2),
  new Given('R7C7', 2),
  new Given('R8C2', 2),
  new Given('R9C9', 7),
  ...mathraxConstraints,
];
