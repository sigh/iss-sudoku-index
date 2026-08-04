// Title: Parity Snowflake
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=EIVLk0zoBt8
// Source: https://tinyurl.com/2x9w34rr

// Standard sudoku givens. Digits along the snowflake alternate between odd
// and even, i.e. every pair of cells directly joined by the drawn line
// differ in parity: Modular(2) enforces "consecutive cells differ mod 2",
// which is exactly alternating odd/even.
const givens = [
  ['R2C2', 4], ['R2C5', 5], ['R2C8', 7],
  ['R3C4', 1], ['R3C6', 6],
  ['R4C3', 2], ['R4C7', 4],
  ['R5C2', 9], ['R5C5', 3], ['R5C8', 8],
  ['R6C3', 7], ['R6C7', 9],
  ['R7C4', 2], ['R7C6', 1],
  ['R8C2', 3], ['R8C5', 7], ['R8C8', 1],
];

// The snowflake is drawn as 21 separate strokes (a closed octagon ring around
// box 5, plus eight spokes each forking into two or three arms). Each stroke
// is its own Modular(2) line, so every drawn edge -- including at fork
// points -- gets the alternating-parity constraint; together they cover the
// whole connected network. Cell lists transcribed from the drawn line art.
const snowflakeStrokes = [
  ['R2C3', 'R3C3'],
  ['R3C2', 'R3C3', 'R4C4'],
  ['R4C6', 'R3C7', 'R2C7'],
  ['R3C7', 'R3C8'],
  ['R6C4', 'R7C3', 'R7C2'],
  ['R8C3', 'R7C3'],
  ['R7C7', 'R6C6'],
  ['R7C7', 'R8C7'],
  ['R7C7', 'R7C8'],
  ['R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4'],
  ['R5C4', 'R6C4'],
  ['R5C4', 'R5C3', 'R4C2'],
  ['R5C3', 'R6C2'],
  ['R4C5', 'R3C5'],
  ['R3C5', 'R2C6'],
  ['R3C5', 'R2C4'],
  ['R5C6', 'R5C7'],
  ['R5C7', 'R4C8'],
  ['R5C7', 'R6C8'],
  ['R6C5', 'R7C5'],
  ['R8C4', 'R7C5', 'R8C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...snowflakeStrokes.map(cells => new Modular(2, ...cells)),
];
