// Title: August 27, 2021: Triple Double
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=O1vAKJyVvG0
// Source: https://tinyurl.com/sjjvewy4

// Normal sudoku rules apply. Digits in cells connected by a black dot must
// have the ratio given: each dot is printed with its own ratio (2 or 3), so
// no dot relies on an assumed default and there is no unmarked-dot clause.
// Ratio-2 dots use the native BlackDot class. Ratio-3 dots have no native
// class, so they use Pair with a custom key: one value must be exactly three
// times the other.

const ratio2Pairs = [
  ['R2C3', 'R2C4'],
  ['R8C7', 'R8C6'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R5C6', 'R5C7'],
  ['R5C6', 'R6C6'],
  ['R2C8', 'R3C8'],
  ['R7C2', 'R8C2'],
];

const ratio3Pairs = [
  ['R2C2', 'R2C3'],
  ['R2C4', 'R3C4'],
  ['R8C7', 'R8C8'],
  ['R7C6', 'R8C6'],
  ['R5C3', 'R5C4'],
  ['R4C4', 'R5C4'],
  ['R5C8', 'R6C8'],
  ['R2C1', 'R2C2'],
  ['R8C8', 'R8C9'],
  ['R4C2', 'R5C2'],
];

const ratio3Key = Pair.fnToKey((a, b) => a === b * 3 || b === a * 3, 9);

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C5', 1),
  new Given('R1C9', 2),
  new Given('R5C1', 5),
  new Given('R5C5', 9),
  new Given('R5C9', 7),
  new Given('R9C1', 3),
  new Given('R9C5', 8),
  new Given('R9C9', 4),

  ...ratio2Pairs.map(([a, b]) => new BlackDot(a, b)),
  ...ratio3Pairs.map(([a, b]) => new Pair(ratio3Key, 'ratio3', a, b)),
];
