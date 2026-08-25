// Title: The Killer in the Mirror
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=APOq9PUMMg4
// Source: https://app.crackingthecryptic.com/webapp/T4Tm8DN6PM

// Normal sudoku rules apply (default row/column/box AllDifferent from
// Shape('9x9'); the payload's own regions are the ordinary reading-order
// 3x3 boxes). Killer cages: distinct digits, and where a total is given the
// digits sum to it; three cages carry no total and so are distinct-only.
//
// The diagonal purple line drawn R1C1-R9C9 in the payload is not named by
// any rules sentence, so no constraint is attached to it.
//
// Buddy rule: every digit 1-9 has a fixed "buddy" digit, the same pairing
// used everywhere in the grid, such that the cell with a digit's
// coordinates swapped always holds its buddy (a digit may be its own
// buddy). Modelled as an unknown involution over the 9 digits:
//   - Var B (9 cells) holds buddy(d) at position d.
//   - Var D (9 cells) are Given-pinned to the constants 1..9, needed only
//     because ValueIndexing's "value" argument must be a cell, not a
//     literal.
//   - For each d, ValueIndexing(D[d], B[d], ...B) enforces B[B[d]] == d.
//     A finite check (any d1 != d2 with B[d1] == B[d2] == x forces
//     B[x] == d1 and B[x] == d2, a contradiction) shows this alone forces B
//     to be a bijection, so all 9 constraints together pin B to exactly an
//     involution -- verified against a small 3-value fixture, which
//     produced only the 4 involutions of {1,2,3} (identity plus the three
//     transpositions), never a 3-cycle.
//   - For each cell (r, r) on the main diagonal, swapping its coordinates
//     is the same cell, so its own digit must be its own buddy:
//     ValueIndexing(cell, cell, ...B) enforces B[cell] == cell, leaving the
//     rest of B unconstrained -- verified on the same fixture.
//   - For every other cell (r, c), the swapped cell (c, r) must hold
//     buddy(digit at (r, c)): ValueIndexing((c,r), (r,c), ...B) enforces
//     B[value(r,c)] == value(c,r) -- verified on the same fixture (all
//     produced combinations satisfied C == B[A] exactly). Only one
//     direction per unordered pair is added; the reverse direction for the
//     same pair follows from B's involution property above, so adding it
//     again would be redundant, not an additional fact.

const cages = [
  [16, 'R1C1', 'R1C2', 'R2C1'],
  [16, 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5'],
  [33, 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4'],
  [9, 'R5C6', 'R5C7', 'R6C7'],
  [19, 'R4C8', 'R5C8', 'R6C8'],
  [15, 'R8C4', 'R8C5', 'R8C6'],
  [23, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [9, 'R6C9', 'R7C9'],
  [10, 'R9C6', 'R9C7'],
  [10, 'R5C1', 'R6C1'],
  [11, 'R3C7', 'R3C8'],
];
const noTotalCages = [
  ['R6C5', 'R7C5', 'R7C6'],
  ['R1C5', 'R1C6'],
  ['R7C3', 'R8C3'],
];

const B = new Var('B', 'buddy', 9);
const D = new Var('D', 'digit const', 9);
const buddyCells = B.cells();

const digitGivens = buddyCells.map((_, i) => new Given(D.cell(i + 1), i + 1));

const involution = buddyCells.map((_, i) =>
  new ValueIndexing(D.cell(i + 1), B.cell(i + 1), ...buddyCells));

const diagonalFixedPoints = [];
for (let i = 1; i <= 9; i++) {
  const cell = makeCellId(i, i);
  diagonalFixedPoints.push(new ValueIndexing(cell, cell, ...buddyCells));
}

const transposePairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = r + 1; c <= 9; c++) {
    transposePairs.push(new ValueIndexing(
      makeCellId(c, r), makeCellId(r, c), ...buddyCells));
  }
}

return [
  new Shape('9x9'),
  B,
  D,
  ...digitGivens,
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
  ...involution,
  ...diagonalFixedPoints,
  ...transposePairs,
];
