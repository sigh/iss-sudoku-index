// Title: June 24, 2022: Anticonsecutive
// Author: clover!
// Video: https://www.youtube.com/watch?v=idOQ2SbahmQ
// Source: https://tinyurl.com/2ve5zbtm

// Normal sudoku rules apply (default row/column/box all-different, digits
// 1-9). Digits separated by a red dot must NOT be consecutive (must not
// differ by exactly 1). Digits without a dot may or may not be consecutive,
// so nothing is asserted for undotted adjacent pairs.

// Each entry is one red dot's two cells, transcribed from the drawn dots
// (all are red, none white/black/other colour).
const redDots = [
  ['R5C2', 'R5C1'],
  ['R5C3', 'R5C2'],
  ['R5C7', 'R5C8'],
  ['R5C8', 'R5C9'],
  ['R6C2', 'R6C1'],
  ['R6C2', 'R6C3'],
  ['R4C8', 'R4C7'],
  ['R4C9', 'R4C8'],
  ['R5C4', 'R4C4'],
  ['R5C4', 'R6C4'],
  ['R5C6', 'R4C6'],
  ['R5C6', 'R6C6'],
  ['R4C4', 'R4C5'],
  ['R6C6', 'R6C5'],
  ['R2C3', 'R2C4'],
  ['R8C6', 'R8C7'],
  ['R3C8', 'R2C8'],
  ['R7C2', 'R8C2'],
  ['R9C3', 'R8C3'],
  ['R1C7', 'R2C7'],
];

// Not-consecutive relation for a 1-9 grid; one Pair per dot (independent
// edges, not a chain) as recommended in the iss-constraints catalog.
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  new Given('R1C2', 6),
  new Given('R1C5', 1),
  new Given('R2C1', 9),
  new Given('R2C3', 5),
  new Given('R2C5', 3),
  new Given('R3C5', 7),
  new Given('R4C1', 1),
  new Given('R4C2', 2),
  new Given('R4C3', 6),
  new Given('R6C7', 3),
  new Given('R6C8', 8),
  new Given('R6C9', 9),
  new Given('R7C5', 4),
  new Given('R8C5', 6),
  new Given('R8C7', 2),
  new Given('R8C9', 5),
  new Given('R9C5', 8),
  new Given('R9C8', 1),

  ...redDots.map(
    ([a, b]) => new Pair(notConsecutive, 'anticonsecutive red dot', a, b)),
];
