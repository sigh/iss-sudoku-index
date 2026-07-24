// Title: Do I Sing Her End?
// Author: juddimal
// Video: https://www.youtube.com/watch?v=qbPFtIgQAc8
// Source: https://sudokupad.app/72m6fsq9eo

// Normal sudoku rules (standard 3x3 boxes). Blue lines are divided into
// segments by the 3x3 box borders; the digits on each segment of the same
// line sum to a common total, and digits may not repeat anywhere on the
// same line.
//
// Six of the seven drawn blue strokes are simple paths, encoded directly
// with RegionSumLine (which derives the box segments itself). The remaining
// two strokes meet end-to-end at R4C5 and so are one Y-branching line, not
// two: the rules text's own worked example
// (r3c4=r4c5+r5c5+r6c5=r3c6+r2c6) names exactly this branch and its three
// segments. RegionSumLine assumes a single path, so the branch is encoded
// with EqualSum over its three segments directly, plus an explicit
// AllDifferent across all six of its cells (RegionSumLine/box rules alone
// would not force cross-segment distinctness for a branch).

const simpleLines = [
  ['R1C9', 'R2C9', 'R3C9', 'R4C8', 'R4C7', 'R5C7'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5'],
  ['R9C1', 'R8C1', 'R7C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C2'],
];

// The branching line's three box-segments (see header comment).
const branchSegments = [
  ['R3C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R3C6', 'R2C6'],
];
const branchCells = branchSegments.flat();

return [
  new Shape('9x9'),

  new Given('R4C4', 7),
  new Given('R9C8', 2),

  ...simpleLines.map(cells => new RegionSumLine(...cells)),
  ...simpleLines.map(cells => new AllDifferent(...cells)),

  new EqualSum(...branchSegments),
  new AllDifferent(...branchCells),
];
