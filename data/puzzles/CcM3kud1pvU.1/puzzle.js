// Title: Oct. 30, 2021: Breaking News
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/caaj22mu

// Normal sudoku rules apply. Grey regions must also contain the digits from
// 1 to 9 without repeats: 8 extra regions of 9 cells each, in addition to the
// normal 27 row/column/box groups, each all-different over its 9 cells.
// Region cell lists below are transcribed from the payload's `extraregion`
// array.

const extraRegions = [
  // A
  ['R2C1', 'R3C1', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  // B
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R6C9', 'R7C9', 'R8C9'],
  // C
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6'],
  // D
  ['R8C4', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  // E
  ['R4C8', 'R5C7', 'R5C8', 'R6C7', 'R7C6', 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  // F
  ['R2C4', 'R2C5', 'R2C7', 'R2C8', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C7'],
  // G
  ['R6C3', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C2', 'R8C3', 'R8C5', 'R8C6'],
  // H
  ['R2C2', 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3', 'R5C2', 'R5C3', 'R6C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C5', 5),
  new Given('R1C9', 2),
  new Given('R2C7', 5),
  new Given('R3C2', 4),
  new Given('R4C5', 8),
  new Given('R5C1', 3),
  new Given('R5C4', 9),
  new Given('R5C6', 5),
  new Given('R5C9', 1),
  new Given('R6C5', 1),
  new Given('R7C8', 6),
  new Given('R8C3', 7),
  new Given('R9C1', 4),
  new Given('R9C5', 2),
  new Given('R9C9', 3),

  ...extraRegions.map((cells) => new AllDifferent(...cells)),
];
