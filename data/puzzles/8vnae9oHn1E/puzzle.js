// Title: HSSC Appetizer - Sudoku Mathrax
// Author: Richard
// Video: https://www.youtube.com/watch?v=8vnae9oHn1E
// Source: https://sudokupad.app/eu0r01u8nh

// Normal sudoku rules apply.
//
// Some intersections of the grid lines are marked by a number and an
// operator (+, -, x, /) in a circle. The number is the result of the
// arithmetical operation, applied to both pairs of diagonally opposite
// cells around that intersection. An "E" in the circle indicates that all
// four adjacent digits are even; an "O" indicates that all four adjacent
// digits are odd.

// Each mark names its intersection by the four surrounding cells in
// [topLeft, topRight, bottomLeft, bottomRight] order. The two diagonal
// pairs are (topLeft, bottomRight) and (topRight, bottomLeft); both pairs
// must independently satisfy the marked operation and value.
const arithmeticMarks = [
  ['4x', 'x', 4, 'R1C3', 'R1C4', 'R2C3', 'R2C4'],
  ['3-', '-', 3, 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['12x', 'x', 12, 'R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['5-', '-', 5, 'R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['4+', '+', 4, 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['14+', '+', 14, 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['2/', '/', 2, 'R8C6', 'R8C7', 'R9C6', 'R9C7'],
  ['6-', '-', 6, 'R6C7', 'R6C8', 'R7C7', 'R7C8'],
];

const parityMarks = [
  ['O', 'odd', 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['E', 'even', 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
];

// One binary relation per operator+value combination, applied to both
// diagonal pairs of the corresponding intersection.
function opKey(op, value) {
  switch (op) {
    case '+':
      return Pair.fnToKey((a, b) => a + b === value, 9);
    case '-':
      return Pair.fnToKey((a, b) => Math.abs(a - b) === value, 9);
    case 'x':
      return Pair.fnToKey((a, b) => a * b === value, 9);
    case '/':
      // Division applied to an unordered pair: the larger digit is
      // `value` times the smaller one.
      return Pair.fnToKey((a, b) => a === b * value || b === a * value, 9);
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

const EVEN_DIGITS = [2, 4, 6, 8];
const ODD_DIGITS = [1, 3, 5, 7, 9];

const parityConstraints = parityMarks.flatMap(
  ([label, parity, ...cells]) => cells.map(
    cell => new Given(cell, ...(parity === 'even' ? EVEN_DIGITS : ODD_DIGITS))));

return [
  new Shape('9x9'),
  ...mathraxConstraints,
  ...parityConstraints,
];
