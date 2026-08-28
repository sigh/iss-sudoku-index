// Title: Tatrioine
// Author: Mystery Setter #3
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/7unyha4s

// Standard 9x9 sudoku (rows, columns, boxes). "The digits 1, 2, and 3 are
// indicated with (orange) circles, and the digits 4, 5, and 6 are indicated
// with (blue) squares": circle cells and square cells are drawn 27 apiece,
// exactly the count each of 1-3, 4-6, and 7-9 must occupy across the grid,
// so the marks are exhaustive -- every circle cell holds 1/2/3, every square
// cell holds 4/5/6, and the 27 remaining unmarked cells (all cells minus the
// two marked sets) hold 7/8/9. Each restriction is a candidate-set Given, the
// standard encoding for a "this cell is one of these digits" clue.
// The payload also shades circle cells gold and square cells lavender; the
// shaded sets exactly match the circle/square sets, so it is a rendering aid
// for the same marks, not an independent rule.

// Circle cells (orange, from the payload's `circle` structures).
const CIRCLES = ['R1C1', 'R1C6', 'R1C7', 'R2C3', 'R2C4', 'R2C9', 'R3C2', 'R3C5', 'R3C8', 'R4C2', 'R4C5', 'R4C8', 'R5C3', 'R5C4', 'R5C9', 'R6C1', 'R6C6', 'R6C7', 'R7C3', 'R7C4', 'R7C9', 'R8C2', 'R8C5', 'R8C8', 'R9C1', 'R9C6', 'R9C7'];

// Square cells (blue, from the payload's `rectangle` structures).
const SQUARES = ['R1C3', 'R1C4', 'R1C9', 'R2C2', 'R2C5', 'R2C8', 'R3C1', 'R3C6', 'R3C7', 'R4C3', 'R4C4', 'R4C9', 'R5C1', 'R5C6', 'R5C7', 'R6C2', 'R6C5', 'R6C8', 'R7C2', 'R7C5', 'R7C8', 'R8C1', 'R8C6', 'R8C7', 'R9C3', 'R9C4', 'R9C9'];

const graph = cellGraph('9x9');
const marked = new Set([...CIRCLES, ...SQUARES]);
const unmarked = graph.cells().filter((cell) => !marked.has(cell));

return [
  new Shape('9x9'),

  // Givens (R1C1=1, R2C7=8, R2C8=6, R4C3=5, R4C6=7, R6C4=8, R6C7=2, R8C2=1,
  // R8C3=7, R9C9=4).
  new Given('R1C1', 1),
  new Given('R2C7', 8),
  new Given('R2C8', 6),
  new Given('R4C3', 5),
  new Given('R4C6', 7),
  new Given('R6C4', 8),
  new Given('R6C7', 2),
  new Given('R8C2', 1),
  new Given('R8C3', 7),
  new Given('R9C9', 4),

  // Circle cells hold 1, 2, or 3.
  ...CIRCLES.map((cell) => new Given(cell, 1, 2, 3)),
  // Square cells hold 4, 5, or 6.
  ...SQUARES.map((cell) => new Given(cell, 4, 5, 6)),
  // Unmarked cells (all cells minus circles and squares) hold 7, 8, or 9.
  ...unmarked.map((cell) => new Given(cell, 7, 8, 9)),
];
