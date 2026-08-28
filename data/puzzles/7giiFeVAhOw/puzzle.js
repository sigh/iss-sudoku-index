// Title: Equal Sums
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=7giiFeVAhOw
// Source: https://tinyurl.com/yfn578cc

// Normal sudoku rules apply. For each line, digits have an equal sum within
// each box it passes through -- RegionSumLine's exact semantics (equal sum
// per box segment, with a line that re-enters a box constrained separately
// per segment). No cages, arrows, or other clue types are drawn.
const lines = [
  ['R9C1', 'R8C1', 'R7C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R1C1', 'R2C1', 'R3C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R1C9', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C9', 'R9C9'],
  ['R4C5', 'R3C6', 'R2C6'],
  ['R5C5', 'R6C5', 'R7C5', 'R7C4', 'R8C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R9C8', 'R9C7', 'R8C6'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R5C3', 'R5C2', 'R6C1', 'R7C2', 'R8C2'],
];

return [
  new Shape('9x9'),
  new Given('R9C4', 7),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
