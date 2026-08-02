// Title: 9/23/23: Ten to a Dozen Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://tinyurl.com/38n98bpx

// Normal Sudoku. Every drawn black rectangle joins a pair whose digits sum to
// 10 or 12, or whose product is 10 or 12; absence of a rectangle is unrestricted.
const given = [
  ['R1C4', 9], ['R2C2', 3], ['R2C8', 4], ['R4C9', 6],
  ['R6C1', 8], ['R8C2', 4], ['R8C8', 3], ['R9C6', 7],
];

// The 22 black rectangles transcribed from the source rectangle layer.
const rectangles = [
  ['R2C2', 'R2C1'], ['R1C2', 'R2C2'], ['R1C8', 'R2C8'],
  ['R2C9', 'R2C8'], ['R8C9', 'R8C8'], ['R8C1', 'R8C2'],
  ['R9C2', 'R8C2'], ['R8C8', 'R9C8'], ['R4C9', 'R3C9'],
  ['R7C1', 'R6C1'], ['R1C4', 'R1C3'], ['R9C7', 'R9C6'],
  ['R7C3', 'R6C3'], ['R3C4', 'R3C3'], ['R3C7', 'R4C7'],
  ['R7C6', 'R7C7'], ['R4C7', 'R4C6'], ['R4C6', 'R4C5'],
  ['R6C3', 'R6C4'], ['R6C5', 'R6C4'], ['R7C5', 'R8C5'],
  ['R3C5', 'R2C5'],
];

// A relation key over the 1-9 digit domain for the four allowed outcomes.
const tenToDozen = Pair.fnToKey(
  (a, b) => a + b === 10 || a + b === 12 || a * b === 10 || a * b === 12,
  9,
);

return [
  new Shape('9x9'),
  ...given.map(([cell, value]) => new Given(cell, value)),
  ...rectangles.map(cells => new Pair(tenToDozen, 'sum/product 10 or 12', ...cells)),
];
