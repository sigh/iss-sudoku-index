// Title: Arrow Sudoku - with a Twist
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hXiwVVxEH9g
// Source: https://cracking-the-cryptic.web.app/sudoku/RnT7bFHJ6h

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// 16 givens, transcribed from the puzzle's drawn cell values.
//
// 11 arrows: a white circle (bulb) on one cell with a straight grey line
// through 2 further cells. Digits along the arrow sum to the digit in the
// bulb cell -> Arrow(bulb, ...arm). Every arrow here runs straight within
// one row or column, so no interpolation ambiguity.

const GIVENS = [
  ['R1C5', 1],
  ['R2C1', 1],
  ['R2C8', 3],
  ['R3C6', 2],
  ['R3C9', 5],
  ['R5C2', 2],
  ['R5C3', 1],
  ['R5C7', 8],
  ['R6C4', 1],
  ['R6C5', 3],
  ['R7C7', 5],
  ['R8C6', 5],
  ['R9C1', 3],
  ['R9C2', 4],
  ['R9C8', 8],
  ['R9C9', 9],
];

const ARROWS = [
  // [bulb, ...arm]
  ['R8C9', 'R8C8', 'R8C7'],
  ['R4C7', 'R4C6', 'R4C5'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C6', 'R8C6', 'R7C6'],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...ARROWS.map(([bulb, ...arm]) => new Arrow(bulb, ...arm)),
];
