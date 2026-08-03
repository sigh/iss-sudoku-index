// Title: Someday We'll Meet Again
// Author: Twototenth
// Video: https://www.youtube.com/watch?v=4jIB89I7mM4
// Source: https://app.crackingthecryptic.com/sudoku/JBFRPT7RBF

// Normal sudoku, plus:
// - 20 gold "nabner" lines: no repeated digit on a line, and no two digits
//   anywhere on a line (not just adjacent cells) are consecutive.
// - One greater-than arrow between R1C8 and R1C9; the rules state it points
//   to the smaller of the two digits, so R1C8 > R1C9.
// Regions are the standard 3x3 boxes (drawn explicitly in the source,
// matching the default box layout).

const lines = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C2', 'R3C2', 'R4C3', 'R5C3'],
  ['R2C3', 'R3C3', 'R4C2', 'R5C2'],
  ['R4C1', 'R5C1', 'R6C2', 'R6C3'],
  ['R6C1', 'R7C2', 'R8C2'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R9C2', 'R9C3', 'R8C3'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C4', 'R5C4', 'R5C5', 'R5C6'],
  ['R7C3', 'R7C4', 'R6C5', 'R7C6'],
  ['R7C5', 'R8C4', 'R9C4'],
  ['R4C5', 'R3C4', 'R2C4', 'R1C4'],
  ['R3C6', 'R2C6', 'R2C5', 'R1C5'],
  ['R4C4', 'R3C5'],
  ['R7C9', 'R7C8', 'R7C7', 'R8C8'],
  ['R8C5', 'R8C6', 'R9C7'],
  ['R8C7', 'R9C6'],
  ['R5C7', 'R5C8'],
  ['R1C6', 'R2C7', 'R2C8', 'R3C8'],
];

// "No two digits along a line may be consecutive" applies to every pair of
// cells on the line, not just line-adjacent pairs, so it needs PairX (all
// pairs) rather than the line-adjacency handling built into Whisper-style
// classes.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  ...lines.map(cells => new AllDifferent(...cells)),
  ...lines.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),

  new GreaterThan('R1C8', 'R1C9'),
];
