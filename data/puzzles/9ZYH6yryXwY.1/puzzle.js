// Title: Dot You Want Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=9ZYH6yryXwY
// Source: https://tinyurl.com/jjrc8dfh

// Normal Sudoku rules, plus the 8 givens below. Each dot between two
// orthogonally adjacent cells prints an explicit difference (not a fixed 1
// as in a classic Kropki white dot), so every dot is a Pair edge with its
// own printed value keyed off |a - b|. "Not all dots are given" is a flavour
// note explaining why undotted adjacent pairs carry no constraint -- it adds
// nothing to encode.

const givens = [
  new Given('R3C1', 9),
  new Given('R3C7', 7),
  new Given('R4C2', 2),
  new Given('R4C6', 8),
  new Given('R6C4', 4),
  new Given('R6C8', 7),
  new Given('R7C3', 7),
  new Given('R7C9', 9),
];

// Each entry is [cellA, cellB, printedDifference], taken directly from the
// payload's `difference` clue list.
const diffEdges = [
  ['R7C4', 'R8C4', 8],
  ['R8C4', 'R8C3', 7],
  ['R3C6', 'R2C6', 8],
  ['R2C6', 'R2C7', 7],
  ['R1C8', 'R2C8', 3],
  ['R2C8', 'R2C9', 3],
  ['R8C1', 'R8C2', 3],
  ['R8C2', 'R9C2', 3],
  ['R1C2', 'R1C1', 2],
  ['R1C2', 'R2C2', 3],
  ['R2C2', 'R2C3', 4],
  ['R3C2', 'R3C3', 5],
  ['R3C3', 'R4C3', 6],
  ['R4C9', 'R5C9', 5],
  ['R5C1', 'R6C1', 5],
  ['R9C8', 'R9C9', 2],
  ['R9C8', 'R8C8', 3],
  ['R8C8', 'R8C7', 4],
  ['R7C7', 'R7C8', 5],
  ['R6C7', 'R7C7', 6],
  ['R9C4', 'R9C3', 2],
  ['R1C7', 'R1C6', 4],
];

const diffDots = diffEdges.map(([a, b, value]) => {
  const key = Pair.fnToKey((x, y) => Math.abs(x - y) === value, 9);
  return new Pair(key, `diff ${value}`, a, b);
});

return [new Shape('9x9'), ...givens, ...diffDots];
