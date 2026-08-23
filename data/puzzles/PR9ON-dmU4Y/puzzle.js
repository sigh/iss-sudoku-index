// Title: Dicedoku
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=PR9ON-dmU4Y
// Source: https://app.crackingthecryptic.com/sudoku/HB3RHhhRJF

// Normal sudoku rules (default 3x3 boxes, no givens).
//
// Six 6-cell cages: "fold into a legitimate dice, where opposing faces sum
// to 7." Each cage holds 1-6 once (a die's faces) and its printed total of
// 21 is the unique 6-distinct-digit sum achievable from 1-9 (the minimum
// possible, 1+2+3+4+5+6), so Cage(21, all-different) alone already forces
// the {1..6} face set -- no separate digit-range restriction is needed.
// Each cage's cell shape (hexomino) is a valid cube net; folding it
// determines which two cells land on opposite faces. The opposite-face
// pairs below were derived by simulating the fold (walking the cage's
// cell-adjacency tree, rotating a local face-normal frame 90 degrees at
// each edge crossed, and reading off which two resulting normals are
// antiparallel).
// Opposite faces of a die sum to 7, encoded per pair with Sum(7, a, b);
// the pair cells are already distinct via each cage's Cage constraint.
//
// Grey circle (filled underlay): cell holds an odd digit -- multi-value
// Given, per catalog (no dedicated Odd class).
//
// White dot between two orthogonally adjacent cells: consecutive digits
// (WhiteDot). "Not all possible dots are given" -- only the three drawn
// dots are constrained; no exhaustiveness/anti-consecutive rule applies to
// unmarked adjacent pairs.

const dice = [
  ['R1C4', 'R2C4', 'R2C5', 'R2C3', 'R2C2', 'R3C3'],
  ['R2C7', 'R3C7', 'R3C6', 'R3C5', 'R4C5', 'R4C4'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R5C7', 'R4C9'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R4C1', 'R5C3'],
  ['R7C2', 'R7C3', 'R8C3', 'R7C4', 'R6C4', 'R6C5'],
  ['R7C6', 'R8C6', 'R9C6', 'R8C7', 'R8C8', 'R8C9'],
];

const oppositePairs = [
  ['R1C4', 'R3C3'], ['R2C4', 'R2C2'], ['R2C5', 'R2C3'],
  ['R2C7', 'R4C5'], ['R3C7', 'R3C5'], ['R3C6', 'R4C4'],
  ['R3C8', 'R5C8'], ['R4C8', 'R6C8'], ['R5C7', 'R4C9'],
  ['R3C2', 'R5C2'], ['R4C2', 'R6C2'], ['R4C1', 'R5C3'],
  ['R7C2', 'R7C4'], ['R7C3', 'R6C5'], ['R8C3', 'R6C4'],
  ['R7C6', 'R9C6'], ['R8C6', 'R8C8'], ['R8C7', 'R8C9'],
];

const oddCells = ['R3C3', 'R3C7', 'R5C3', 'R5C7', 'R7C3', 'R7C7'];

const whiteDotPairs = [
  ['R7C5', 'R8C5'],
  ['R5C6', 'R6C6'],
  ['R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),

  ...dice.map(cells => new Cage(21, ...cells)),
  ...oppositePairs.map(([a, b]) => new Sum(7, a, b)),

  ...oddCells.map(c => new Given(c, 1, 3, 5, 7, 9)),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
];
