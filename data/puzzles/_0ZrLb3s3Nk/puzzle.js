// Title: Double Counting
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=_0ZrLb3s3Nk
// Source: https://sudokupad.app/james-sinclair/double-counting

// Normal sudoku rules apply (default row/column/box all-different).
//
// Double arrows: the sum of the digits along each burgundy line equals the
// sum of the two digits in its end circles. DoubleArrow(...cells) takes the
// two circle cells first and last, with the shaft cells between them.
//
// Counting circles: the digit in a double-arrow circle counts how many of
// the puzzle's double-arrow circles hold that digit. CountingCircles is
// scoped to one set of circles at a time, so it takes all 12 circle cells
// (the endpoints of all six double arrows) together, matching "circles in
// the puzzle" (not per-line).
//
// Quadruple circle: the clued digit (5) must appear in one of the four
// cells around the circle. Quad(topLeftCell, ...values) takes the top-left
// cell of the surrounding 2x2 square.
//
// X: adjacent cells joined by an X sum to 10.
//
// Cell lists below are transcribed from the drawn double-arrow lines and
// marks; waypoints between circles are walked cell-by-cell, expanding
// straight multi-cell segments (line F).

const doubleArrows = [
  // A: R3C4 - R4C5 - R3C6
  new DoubleArrow('R3C4', 'R4C5', 'R3C6'),
  // B: R6C3 - R5C4 - R4C3
  new DoubleArrow('R6C3', 'R5C4', 'R4C3'),
  // C: R7C4 - R6C5 - R7C5
  new DoubleArrow('R7C4', 'R6C5', 'R7C5'),
  // D: R4C7 - R5C6 - R5C7
  new DoubleArrow('R4C7', 'R5C6', 'R5C7'),
  // E: R4C1 - R3C2 - R3C3 - R2C3 - R1C4
  new DoubleArrow('R4C1', 'R3C2', 'R3C3', 'R2C3', 'R1C4'),
  // F: R6C6 - R7C7 - R8C7 - R9C7 - R9C8 - R9C9
  new DoubleArrow('R6C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
];

// All 12 double-arrow circle cells (the two endpoints of each line above),
// as one counting set per the "Counting Circles" rule.
const countingCircleCells = [
  'R3C4', 'R3C6',
  'R6C3', 'R4C3',
  'R7C4', 'R7C5',
  'R4C7', 'R5C7',
  'R4C1', 'R1C4',
  'R6C6', 'R9C9',
];

// X pairs (adjacent cells summing to 10).
const xPairs = [
  ['R5C5', 'R5C6'],
  ['R2C2', 'R2C3'],
  ['R4C8', 'R5C8'],
  ['R1C1', 'R1C2'],
  ['R8C1', 'R8C2'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),

  ...doubleArrows,

  new CountingCircles(...countingCircleCells),

  // Quadruple circle clued 5, at the R4C4/R4C5/R5C4/R5C5 corner.
  new Quad('R4C4', 5),

  ...xPairs.map(([a, b]) => new X(a, b)),
];
