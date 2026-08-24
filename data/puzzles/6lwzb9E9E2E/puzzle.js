// Title: Among Us
// Author: meowzzz
// Video: https://www.youtube.com/watch?v=6lwzb9E9E2E
// Source: https://app.crackingthecryptic.com/sudoku/QMGbp6Ljtb

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions are the ordinary 3x3 boxes, so no explicit Regions
// constraint is needed).
//
// Four little killer diagonals (repeats allowed) sum to their printed totals.
//
// Ten cages forbid repeats within themselves and split into two groups by
// total: eight share one common total, and two "impostor" cages share a
// different, common total. That impostor total is itself a digit, and that
// digit may appear in the grid only on cells that lie on one of the four
// little killer diagonals.
//
// Structural note (proved by cage-size arithmetic alone, not by solving this
// puzzle's actual digits): cages 5 and 6
// have 4 cells each, so their own AllDifferent minimum possible total is
// 1+2+3+4=10. Since the impostor total must be a single digit (<=9), cages 5
// and 6 can never be impostors, so they are always members of the "same
// total" group, which forces that group's common total to be >= 10 always.
// Cage 3 (R3C7, a single cell) can only ever total 1-9, so it can never be a
// member of a >=10 group -- it must always be the *other* group, i.e. cage 3
// is always one of the two impostors, and the impostor total always equals
// digit(R3C7). This also makes "impostor total != common total" automatic
// (<=9 vs >=10), so no separate inequality constraint is added.
//
// Which of the remaining seven 3-cell cages (0-indexed cages 0,1,3,6,7,8,9 in
// payload order, i.e. cages 1,2,4,7,8,9,10 below) is the *second* impostor is
// not decidable from cage sizes alone -- that is left as a genuine
// disjunction for the solver.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cage cell lists, transcribed from the payload's drawn cage geometry (10
// cages, none with a printed total). Numbered 1-10 in payload order.
const cage1 = ['R2C4', 'R2C5', 'R2C6'];
const cage2 = ['R3C3', 'R4C3', 'R5C3'];
const cage3 = ['R3C7']; // single cell, no local AllDifferent needed; always an impostor (see above)
const cage4 = ['R3C4', 'R3C5', 'R3C6'];
const cage5 = ['R4C6', 'R4C7', 'R5C6', 'R5C7'];
const cage6 = ['R4C4', 'R4C5', 'R5C4', 'R5C5'];
const cage7 = ['R6C4', 'R6C5', 'R6C6'];
const cage8 = ['R7C4', 'R7C5', 'R7C6'];
const cage9 = ['R6C3', 'R7C3', 'R8C3'];
const cage10 = ['R6C7', 'R7C7', 'R8C7'];

const allCages = [cage1, cage2, cage3, cage4, cage5, cage6, cage7, cage8, cage9, cage10];
const noRepeatCages = allCages.filter(c => c.length > 1);

// Forced non-impostors (cage 5, cage 6) plus the seven 3-cell candidates for
// the *second* impostor (cage 3 is the fixed first impostor).
const alwaysNonImpostor = [cage1, cage2, cage4, cage7, cage8, cage9, cage10, cage5, cage6];
const secondImpostorCandidates = [cage1, cage2, cage4, cage7, cage8, cage9, cage10];

// One branch per choice of second impostor cage: that cage plus cage3 share
// one (unmaterialized) total via EqualSum, and the other eight cages share
// their own common (unmaterialized) total via a second EqualSum.
const impostorBranches = secondImpostorCandidates.map(secondImpostor => {
  const nonImpostorCages = allCages.filter(
    c => c !== cage3 && c !== secondImpostor);
  return new And([
    new EqualSum(cage3, secondImpostor),
    new EqualSum(...nonImpostorCages),
  ]);
});

// Little killer diagonals: payload overlay text paired with the arrow anchored
// at the same off-grid point (distance 0 between the two, so the pairing is
// unambiguous).
const littleKillers = [
  LittleKiller.fromCells(46, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(27, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(37, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(24, graph.ray('R7C1', 1, 1), geometry),
];

// Union of the four diagonals' cells (24 cells, pairwise disjoint since their
// row-minus-col offsets 0, +4, -2, -6 are all distinct). The impostor digit
// (= value at R3C7, per the structural note above) may only appear on these
// cells.
const diagonalCells = new Set([
  ...graph.ray('R1C1', 1, 1),
  ...graph.ray('R1C5', 1, 1),
  ...graph.ray('R3C1', 1, 1),
  ...graph.ray('R7C1', 1, 1),
]);
const offDiagonalCells = graph.cells().filter(c => !diagonalCells.has(c));

// A 2-cell AllDifferent is exactly a "not equal" pairwise constraint.
const impostorDigitExclusions = offDiagonalCells.map(
  cell => new AllDifferent('R3C7', cell));

return [
  new Shape('9x9'),

  new Given('R1C6', 1),
  new Given('R2C3', 3),
  new Given('R5C3', 9),
  new Given('R5C5', 1),
  new Given('R6C9', 4),
  new Given('R9C4', 9),

  ...littleKillers,

  ...noRepeatCages.map(c => new AllDifferent(...c)),
  new Or(impostorBranches),
  ...impostorDigitExclusions,
];
