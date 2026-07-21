// Title: Jinxed Squad
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=QckuFmNa448
// Source: https://sudokupad.app/fp82wljj36

// Digits in columns 1, 5, and 9 index the positions of 1, 5, and 9
// respectively in the same row.
const indexedCells = [1, 5, 9].flatMap(column =>
  Array.from({length: 9}, (_, row) => makeCellId(row + 1, column)));

const quadruples = [
  new Quad('R1C2', 1, 2, 9),
  new Quad('R1C5', 1, 3),
  new Quad('R2C6', 2, 8),
  new Quad('R3C4', 4, 9),
  new Quad('R5C3', 1, 4, 5),
  new Quad('R5C6', 2, 3),
  new Quad('R6C7', 7, 8),
  new Quad('R7C2', 3, 5),
  new Quad('R7C5', 4, 5),
  new Quad('R8C3', 6, 8),
];

return [
  new Shape('9x9'),
  new Indexing('C', ...indexedCells),
  ...quadruples,
];
