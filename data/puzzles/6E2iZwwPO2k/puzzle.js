// Title: Ping Pong
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=6E2iZwwPO2k
// Source: https://sudokupad.app/kwio77hpis

// Normal sudoku rules apply. Each gold line is a Nabner line: digits do not
// repeat on the line, and no two cells anywhere on the line (not just
// adjacent ones) hold consecutive digits. Each arrow's circled cell holds
// the sum of the digits along its arm. A black dot marks a 2:1-ratio pair;
// a white dot marks a consecutive pair; not every such pair on the grid is
// dotted, so absence of a dot carries no information and is left
// unconstrained.

const nabnerLines = [
  ['R2C4', 'R1C4', 'R1C3'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R6C7', 'R7C7'],
  ['R5C3', 'R5C2', 'R6C2', 'R6C3'],
  ['R5C5', 'R5C4', 'R6C4', 'R6C5'],
];

// "No two digits on a line can be consecutive, regardless of their
// position" is a relation over every pair of cells on the line, not just
// line-adjacent pairs, so it needs PairX (all pairs) rather than a
// line-adjacency handling class.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// Each entry starts with its circled bulb, followed by the arrow arm.
const arrows = [
  ['R3C7', 'R4C7', 'R4C8', 'R4C9'],
  ['R3C7', 'R3C6', 'R3C5', 'R3C4'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R9C7', 'R9C6', 'R8C6', 'R7C6'],
  ['R3C2', 'R3C1', 'R2C1'],
];

return [
  new Shape('9x9'),

  ...nabnerLines.map(cells => new AllDifferent(...cells)),
  ...nabnerLines.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),

  ...arrows.map(cells => new Arrow(...cells)),

  new BlackDot('R8C3', 'R8C4'),

  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R7C9', 'R8C9'),
];
