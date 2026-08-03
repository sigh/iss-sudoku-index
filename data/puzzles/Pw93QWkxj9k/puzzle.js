// Title: Beauty Mark
// Author: zetamath
// Video: https://www.youtube.com/watch?v=Pw93QWkxj9k
// Source: https://app.crackingthecryptic.com/sudoku/TnR9996Ltn

// Normal sudoku, plus:
// - One black dot (Kropki ratio): the two cells hold digits in a 1:2 ratio
//   (one is double the other).
// - Gold lines are nabner lines: no repeated digits, and no two digits
//   anywhere on the line are consecutive, regardless of position.
// - Blue lines are region sum lines: the digits on the line sum to the same
//   total within each box the line passes through.

// Gold nabner lines. Drawn as color #f7d038 (gold) strokes; cell order from
// the payload's line waypoints.
const nabnerLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C1'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C4'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C7'],
  ['R7C8', 'R7C7', 'R8C7', 'R9C7'],
  ['R4C7', 'R4C8', 'R4C9', 'R3C9'],
  ['R1C7', 'R2C8'],
  ['R2C4', 'R2C5', 'R3C4', 'R3C5'],
];

// Blue region sum lines. Drawn as color #34bbe6 (deepskyblue) strokes; cell
// order from the payload's line waypoints.
const regionSumLines = [
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R3C2', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R4C4'],
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C2'],
  ['R6C5', 'R6C6', 'R7C6', 'R8C6'],
  ['R6C8', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
];

// "No two digits on a nabner line can be consecutive, regardless of their
// position" is a relation over every pair of cells on the line, not just
// line-adjacent pairs, so it needs PairX (all pairs) rather than the
// line-adjacency handling built into a sequential-pair class.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  // Black dot overlay (#0): edge(R2C6, R2C7).
  new BlackDot('R2C6', 'R2C7'),

  ...nabnerLines.map(cells => new PairX(notConsecutiveKey, 'Nabner', ...cells)),
  ...nabnerLines.map(cells => new AllDifferent(...cells)),

  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
