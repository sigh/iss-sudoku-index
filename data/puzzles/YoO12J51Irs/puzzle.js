// Title: White Marlin
// Author: shye
// Video: https://www.youtube.com/watch?v=YoO12J51Irs
// Source: https://app.crackingthecryptic.com/sudoku/qH7fHmNqGn

// Rules: Normal sudoku rules apply. (ie place the digits 1-9 once each in
// every row, column and 3x3 box.) No cages, lines, arrows, or other variant
// clues are present -- the payload's `cages` array holds only metadata
// stubs (title/author/rules text and an empty stub), and `regions` are the
// nine standard, contiguous 3x3 boxes.

// Givens, transcribed from the drawn grid.
const givens = [
  ['R1C2', 1], ['R1C3', 2], ['R1C5', 3], ['R1C7', 4], ['R1C8', 5],
  ['R2C1', 5], ['R2C2', 6],
  ['R3C1', 3], ['R3C9', 2],
  ['R4C2', 7], ['R4C5', 1], ['R4C6', 5],
  ['R5C4', 6], ['R5C6', 9],
  ['R6C4', 4], ['R6C5', 2], ['R6C8', 8],
  ['R7C1', 1], ['R7C9', 3],
  ['R8C8', 2], ['R8C9', 4],
  ['R9C2', 8], ['R9C3', 3], ['R9C5', 4], ['R9C7', 5], ['R9C8', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
];
