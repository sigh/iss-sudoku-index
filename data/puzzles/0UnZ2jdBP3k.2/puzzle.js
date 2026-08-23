// Title: Irregular Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=0UnZ2jdBP3k
// Source: https://app.crackingthecryptic.com/sudoku/hBgtTT8R8L

// Rules: "1-9 appear in each row, column and marked region." Rows and
// columns are standard Sudoku all-different (default). The nine marked
// irregular regions replace the standard 3x3 boxes, so the default boxes
// are removed (NoBoxes) and each drawn region is instead given as a
// Jigsaw all-different group. Region cell membership below is transcribed
// from the source payload's `regions` array. No other clue types (cages,
// lines, arrows, overlays) appear in the payload.

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C6', 'R4C4'],
  ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R3C5', 'R5C3', 'R7C5', 'R5C7'],
  ['R7C4', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'R6C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R4C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  new Given('R1C2', 5),
  new Given('R1C6', 7),
  new Given('R1C8', 1),
  new Given('R2C3', 3),
  new Given('R2C6', 8),
  new Given('R2C8', 2),
  new Given('R3C4', 2),
  new Given('R3C6', 9),
  new Given('R4C7', 5),
  new Given('R5C1', 1),
  new Given('R5C2', 2),
  new Given('R5C8', 3),
  new Given('R5C9', 4),
  new Given('R6C3', 8),
  new Given('R7C4', 5),
  new Given('R7C6', 3),
  new Given('R8C2', 4),
  new Given('R8C4', 6),
  new Given('R8C7', 1),
  new Given('R9C2', 3),
  new Given('R9C4', 7),
  new Given('R9C8', 9),
];
