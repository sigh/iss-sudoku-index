// Title: Electrostatic Discharge
// Author: Allagem
// Video: https://www.youtube.com/watch?v=qTQv6QCEWgc
// Source: https://app.crackingthecryptic.com/NHRrNJb98h

// Normal sudoku rules apply (default row/column/box all-different). Blue
// Region Sum lines have equal digit sums in each box-border-delimited segment.
// Gold Nabner lines have no repeated digits and no two digits anywhere on a
// line that are consecutive. PairX applies the predicate to all pairs on each
// individual gold line.

const regionSumLines = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R4C3', 'R5C3'],
  ['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R7C3', 'R7C2'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C8', 'R7C8', 'R7C9', 'R8C9'],
  ['R7C4', 'R8C4', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R7C6', 'R8C6', 'R9C6', 'R9C7'],
];

const nabnerLines = [
  ['R2C2', 'R2C3', 'R1C3'],
  ['R1C4', 'R1C5'],
  ['R3C7', 'R2C7', 'R2C8'],
  ['R3C8', 'R4C8', 'R4C9', 'R5C9'],
  ['R4C1', 'R4C2', 'R5C2'],
  ['R6C4', 'R6C5', 'R5C5', 'R5C6'],
  ['R7C1', 'R8C1', 'R8C2'],
  ['R9C4', 'R9C5', 'R8C5', 'R7C5'],
  ['R7C7', 'R8C7', 'R8C8', 'R9C8'],
];

const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...nabnerLines.map(cells => new PairX(nabnerKey, 'Nabner', ...cells)),
];
