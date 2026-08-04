// Title: All Things Being Equal
// Author: actinide
// Video: https://www.youtube.com/watch?v=Vd48dfISue4
// Source: https://app.crackingthecryptic.com/sudoku/bTpPDqJbG9

// Normal sudoku rules apply (default 9x9 Shape, regions match the payload's
// boxes). All 11 cages and both marked diagonals sum to one shared,
// unfound total -- EqualSum, no fixed number. "They MAY include repeated
// digits if allowed by the other rules" means these are plain sum regions,
// not killer cages: no AllDifferent is added for them, so a repeat is legal
// wherever row/column/box don't already forbid it.
//
// The "<" mark on the R4C4/R4C5 edge points at the lower digit (R4C4).
//
// "Three of the nine digits are always grouped together in a set of
// orthogonally connected cells without repeats. Those sets cannot touch
// each other orthogonally. The green shapes are two of those sets." The two
// green shapes are encoded as their own no-repeat sets below. The puzzle
// implies a third such set exists among the other 3 digits, but neither its
// cells nor its digits are drawn or otherwise pinned down anywhere in the
// payload -- which cells belong to it is a solver deduction, so it and the
// no-touching-each-other clause (which needs it) are omitted rather than
// guessed at.

const graph = cellGraph('9x9');

// Cages, no printed total (payload `cages` array, entries with cells and no
// value -- 11 of the 15 entries; the rest are metadata stubs).
const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C6'],
  ['R2C8', 'R2C9', 'R3C9'],
  ['R3C5', 'R4C4', 'R4C5', 'R5C5', 'R5C6', 'R6C5'],
  ['R6C4', 'R7C4', 'R7C5', 'R7C6'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R6C2', 'R7C1', 'R7C2'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C1'],
  ['R3C2', 'R3C3', 'R4C3', 'R5C3'],
];

// Marked diagonals: two off-grid arrows, each paired with an outside "-"
// (unfound) label, running along a grid diagonal (payload `arrows`, cell
// path resolved from the waypoints).
const diagonals = [
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];

// Two of the three "grouped digits" sets (payload `underlays`, green
// #A3E048 shading): each is a 3-cell orthogonally-connected set of 3
// different digits.
const greenSets = [
  ['R3C7', 'R3C8', 'R4C8'],
  ['R6C4', 'R7C4', 'R7C5'],
];

return [
  new Shape('9x9'),

  new EqualSum(...cages, ...diagonals),

  new GreaterThan('R4C5', 'R4C4'),

  ...greenSets.map(cells => new AllDifferent(...cells)),
];
