// Title: Shaken Clones Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://f-puzzles.com/?id=2eoeczu6

// Normal Sudoku rules (rows, columns, boxes all-different) plus: digits in
// identically shaded regions, even if the shape of that region is rotated or
// reflected, must contain the same digits, but may appear in any order.
//
// The payload draws two shaded colours as four disjoint 5-cell regions
// (lavender) and two disjoint 2-cell regions (pale-green); each same-colour
// group is one congruent shape family under rotation/reflection. SameValues
// enforces multiset-equal digit content across all sets passed to it,
// independent of any rotation/reflection between them, so the geometric
// congruence itself needs no separate encoding.
const lavenderRegions = [
  ['R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'],
  ['R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3'],
  ['R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8'],
];
const palegreenRegions = [
  ['R3C3', 'R3C4'],
  ['R7C6', 'R8C6'],
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C4', 5),
  new Given('R2C5', 6),
  new Given('R2C6', 4),
  new Given('R3C3', 1),
  new Given('R3C7', 2),
  new Given('R4C1', 4),
  new Given('R4C3', 7),
  new Given('R4C9', 6),
  new Given('R5C2', 5),
  new Given('R5C5', 4),
  new Given('R5C8', 7),
  new Given('R6C1', 9),
  new Given('R6C7', 8),
  new Given('R6C9', 1),
  new Given('R7C3', 4),
  new Given('R7C7', 3),
  new Given('R8C4', 2),
  new Given('R8C5', 8),
  new Given('R9C6', 7),

  new SameValues(4, ...lavenderRegions.flat()),
  new SameValues(2, ...palegreenRegions.flat()),
];
