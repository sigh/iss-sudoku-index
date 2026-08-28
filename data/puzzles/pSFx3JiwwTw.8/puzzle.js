// Title: 10/9/21: B1G3 Between Line
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/xx6pe5k2

// Normal sudoku rules apply. Digits along a line must have values strictly
// between the values in the circles on the ends of that line. Grid is 6x6
// (default boxes: six 2x3 regions).
//
// Each drawn between-line's first and last listed cell are its circled
// endpoints; the middle cell(s) must hold a value strictly between them.
// This is exactly ISS's `Between`.

const shape = new Shape('6x6');

// Givens.
const givens = [
  ['R1C1', 1],
  ['R1C6', 3],
  ['R2C1', 5],
  ['R2C3', 3],
  ['R3C6', 2],
  ['R6C1', 2],
  ['R6C6', 4],
].map(([cell, v]) => new Given(cell, v));

// Between lines (endpoints are circles, cells in drawn order).
const betweenLines = [
  ['R1C3', 'R1C4', 'R2C4'],
  ['R2C2', 'R2C3', 'R3C3'],
  ['R4C3', 'R4C2', 'R5C2'],
  ['R5C3', 'R6C3', 'R6C4'],
  ['R4C5', 'R4C6', 'R5C6'],
].map(cells => new Between(...cells));

return [
  shape,
  ...givens,
  ...betweenLines,
];
