// Title: X-ception
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=ztKGB9yQfD8
// Source: https://app.crackingthecryptic.com/sudoku/h7rbdhqtFM

// Normal sudoku rules apply (default Shape('9x9')).
//
// The marked diagonal runs R9C1-R8C2-...-R1C9 (the '/' anti-diagonal), so
// Diagonal(1): digits on it cannot repeat.
//
// Twelve outside clues (4 top, 3 bottom, 3 left, 2 right) each give the
// X-Sum for their row/column: the sum of the first N digits read from that
// direction, where N is the first digit itself. Every one of the twelve
// clue badges prints the same unlabeled value "X" (rules text: "all clues
// outside the grid are the same number X, which has to be determined by the
// solver"), so there is no literal total to encode. Instead, each lane's
// X-sum is tied by an EqualSum to lane 0's X-sum -- chaining all twelve to
// the same value without ever naming it. X can exceed the grid's 1-9 domain
// (up to 45, a full line), which rules out holding it in an ISS Var
// (MAX_SIZE 16); this pairwise EqualSum form has no such cap since it never
// materializes X as a cell value.

const graph = cellGraph('9x9');

// Each lane as [label, cells ordered outer-to-inner]; label is unused by the
// solver, kept only so a misbuilt lane is easy to spot while debugging.
const lanes = [
  ['top C1', graph.ray('R1C1', 1, 0)],
  ['top C4', graph.ray('R1C4', 1, 0)],
  ['top C8', graph.ray('R1C8', 1, 0)],
  ['top C9', graph.ray('R1C9', 1, 0)],
  ['bottom C2', graph.ray('R9C2', -1, 0)],
  ['bottom C5', graph.ray('R9C5', -1, 0)],
  ['bottom C7', graph.ray('R9C7', -1, 0)],
  ['left R1', graph.ray('R1C1', 0, 1)],
  ['left R4', graph.ray('R4C1', 0, 1)],
  ['left R8', graph.ray('R8C1', 0, 1)],
  ['right R1', graph.ray('R1C9', 0, -1)],
  ['right R2', graph.ray('R2C9', 0, -1)],
];

// X-sum(cellsA) === X-sum(cellsB) as a case split on each lane's own first
// digit (1-9), then an EqualSum per (na, nb) pair equating the two
// resulting prefix sums. Top C1 and left R1 (and top C9 / right R1) share
// their first cell: when cellsA[0] === cellsB[0] that one cell fixes a
// single shared N, so only na === nb branches are kept -- an na !== nb
// branch would place two conflicting Givens on the same cell.
function xsumEqual(cellsA, cellsB) {
  const sharedFirst = cellsA[0] === cellsB[0];
  const branches = [];
  for (let na = 1; na <= 9; na++) {
    for (let nb = 1; nb <= 9; nb++) {
      if (sharedFirst && na !== nb) continue;
      const givens = sharedFirst
        ? [new Given(cellsA[0], na)]
        : [new Given(cellsA[0], na), new Given(cellsB[0], nb)];
      branches.push(new And([
        ...givens,
        new EqualSum(cellsA.slice(0, na), cellsB.slice(0, nb)),
      ]));
    }
  }
  return new Or(branches);
}

const refCells = lanes[0][1];
const xsumLinks = lanes.slice(1).map(([, cells]) => xsumEqual(refCells, cells));

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...xsumLinks,
];
