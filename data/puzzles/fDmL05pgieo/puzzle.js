// Title: quadcopter
// Author: arctan
// Video: https://www.youtube.com/watch?v=fDmL05pgieo
// Source: https://sudokupad.app/9lceh4k7v3

// Both main diagonals must not repeat a digit. The drawn blue lines are the
// same two diagonals; the no-repeat rule is the whole of what they mean.
const diagonals = [
  new Diagonal(-1), // \ : R1C1..R9C9
  new Diagonal(1),  // / : R9C1..R1C9
];

// Arrows: bulb cell first, then the arm cells in drawn order. Arm digits
// sum to the bulb digit.
const arrows = [
  ['R2C2', 'R2C3', 'R3C3', 'R3C2'],
  ['R2C8', 'R3C8', 'R3C7', 'R2C7'],
  ['R8C8', 'R8C7', 'R7C7', 'R7C8'],
  ['R8C2', 'R7C2', 'R7C3', 'R8C3'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R6C7', 'R6C8', 'R6C9'],
].map(cells => new Arrow(...cells));

// Black lines: adjacent cells on the line have a 2:1 ratio (one digit is
// double the other). Every segment runs diagonally (one runs along part of
// the main diagonal), so the cells are not orthogonal neighbours and the
// native BlackDot class (which requires orthogonal adjacency) rejects them;
// a custom Pair with the same 2:1 relation expresses the identical rule.
const doubleKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const blackLines = [
  ['R6C6', 'R5C5', 'R4C4'],
  ['R1C8', 'R2C9'],
  ['R8C1', 'R9C2'],
  ['R5C3', 'R6C4'],
  ['R4C6', 'R5C7'],
].map(cells => new Pair(doubleKey, 'BlackLine', ...cells));

// Magenta line: adjacent cells on the line are consecutive. Also drawn
// diagonally, so it needs the same custom-Pair treatment as the black lines.
const consecutiveKey = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);
const magentaLines = [
  ['R9C8', 'R8C9'],
].map(cells => new Pair(consecutiveKey, 'MagentaLine', ...cells));

return [
  new Shape('9x9'),
  ...diagonals,
  ...arrows,
  ...blackLines,
  ...magentaLines,
];
