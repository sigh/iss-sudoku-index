// Title: April 23, 2022: Ocean's Trio
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ojOATs9SDgY
// Source: https://tinyurl.com/4uhc2yr4

// Normal sudoku rules (rows, columns, boxes: 1-9 once).
// Consecutive digits may never be orthogonally adjacent (AntiConsecutive).
// 27 cells are shaded gold and marked with a circle: restricted to {1,2,3}.
// 27 cells are shaded lavender and marked with a rectangle: restricted to
// {4,5,6}. The remaining 27 cells are unmarked and keep the full 1-9 range.
// Cell lists below are transcribed from the drawn cell shading and marker
// geometry.

const circleCells = [
  'R1C1', 'R1C6', 'R1C7', 'R2C2', 'R2C5', 'R2C9', 'R3C2', 'R3C4', 'R3C7',
  'R4C1', 'R4C3', 'R4C9', 'R5C4', 'R5C6', 'R5C8', 'R6C1', 'R6C4', 'R6C7',
  'R7C3', 'R7C5', 'R7C8', 'R8C2', 'R8C6', 'R8C9', 'R9C3', 'R9C5', 'R9C8',
];

const rectangleCells = [
  'R1C3', 'R1C4', 'R1C9', 'R2C3', 'R2C6', 'R2C8', 'R3C1', 'R3C5', 'R3C8',
  'R4C2', 'R4C4', 'R4C7', 'R5C2', 'R5C5', 'R5C9', 'R6C3', 'R6C6', 'R6C9',
  'R7C1', 'R7C4', 'R7C7', 'R8C1', 'R8C5', 'R8C8', 'R9C2', 'R9C6', 'R9C7',
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...circleCells.map(cell => new Given(cell, 1, 2, 3)),
  ...rectangleCells.map(cell => new Given(cell, 4, 5, 6)),
];
