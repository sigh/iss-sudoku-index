// Title: Multiple Signs
// Author: tesseralis
// Video: https://www.youtube.com/watch?v=wUKh-K8DNsk
// Source: https://app.crackingthecryptic.com/sudoku/Fgp4644hfq

// Normal sudoku rules apply. Both main diagonals are marked in blue and
// forbid repeats. A white dot between two cells means those two cells hold
// consecutive digits; a black dot means the pair is in a 1:2 ratio. Not
// every valid dot is drawn, so an undotted pair carries no information.
// A gold line means: for every pair of cells consecutive along that drawn
// line, one of the pair's digits is a multiple of the other.
//
// Two of the gold lines meet at R7C5 without merging into a single path (a
// branch point), so each drawn line below is encoded as its own set of
// consecutive-pair edges rather than one combined ordering.

const diagonals = [
  new Diagonal(1),  // anti-diagonal R1C9..R9C1
  new Diagonal(-1), // main diagonal R1C1..R9C9
];

// Black dots (1:2 ratio), each a separate drawn dot mark.
const blackDots = [
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R5C5', 'R6C5'),
];

// White dots (consecutive), each a separate drawn dot mark.
const whiteDots = [
  new WhiteDot('R5C4', 'R6C4'),
  new WhiteDot('R5C6', 'R6C6'),
  new WhiteDot('R5C7', 'R5C8'),
  new WhiteDot('R5C8', 'R5C9'),
];

// Gold "multiple" lines, transcribed as drawn. Each array is the ordered
// path of cell centres the line's waypoints pass through, with a closed
// loop's repeated first cell kept so the wrap-around edge is included.
// Edges are derived from consecutive entries rather than hand-listed.
const goldLines = [
  ['R1C1', 'R2C2', 'R1C2', 'R2C1', 'R1C1'],
  ['R1C8', 'R2C9', 'R1C9', 'R1C8'],
  ['R8C1', 'R9C2', 'R9C1', 'R8C1'],
  ['R7C5', 'R8C5', 'R9C5'],
  [
    'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3',
    'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7',
  ],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9', 'R8C8'],
];

// One digit a multiple of the other, over the puzzle's 1-9 range.
const multipleKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);

const multiplePairs = goldLines.flatMap(
  cells => cells.slice(1).map(
    (cell, i) => new Pair(multipleKey, 'Multiple', cells[i], cell)));

return [
  new Shape('9x9'),
  ...diagonals,
  ...blackDots,
  ...whiteDots,
  ...multiplePairs,
];
