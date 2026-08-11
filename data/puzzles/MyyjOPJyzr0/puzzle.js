// Title: Chaos Construction: Killer
// Author: KNT
// Video: https://www.youtube.com/watch?v=MyyjOPJyzr0
// Source: https://app.crackingthecryptic.com/sudoku/fqm7gDbF4j

// Rules: standard row/column sudoku, but the nine regions are not given --
// the solver must find nine orthogonally connected, non-overlapping 9-cell
// regions, each containing every digit once. That is exactly
// ChaosConstruction()'s semantics, so it replaces the fixed 3x3 boxes
// (NoBoxes()) rather than adding to them.
//
// Each cage sums to its top-left value (Sum). The rules do not say cage
// digits are distinct; instead "every cage is entirely contained within one
// region ... no two cells within that cage belong to different regions" is
// encoded directly: all of a cage's cells are pinned to the same CC
// (chaos-region-label) value via chained SameValues pairs. Digit distinctness
// inside each cage then follows from that confinement plus ChaosConstruction's
// own per-region all-different, so no separate Cage/AllDifferent is added.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Cage cell lists and top-left sums, transcribed from the drawn cages.
const CAGES = [
  [18, ['R1C1', 'R1C2', 'R2C2']],
  [8, ['R2C1', 'R3C1', 'R3C2']],
  [27, ['R2C3', 'R3C3', 'R4C3', 'R4C2', 'R4C1']],
  [17, ['R5C2', 'R5C1']],
  [8, ['R6C1', 'R6C2']],
  [21, ['R7C3', 'R7C4', 'R8C4']],
  [5, ['R8C3', 'R9C3']],
  [15, ['R9C4', 'R9C5']],
  [8, ['R8C5', 'R7C5']],
  [11, ['R9C6', 'R9C7']],
  [19, ['R8C6', 'R7C6', 'R7C7']],
  [10, ['R8C7', 'R8C8', 'R9C8']],
  [16, ['R6C6', 'R5C6', 'R5C5', 'R5C7']],
  [12, ['R5C4', 'R4C4', 'R3C4', 'R4C5']],
  [6, ['R2C4', 'R2C5']],
  [28, ['R2C6', 'R3C6', 'R4C6', 'R3C5']],
  [17, ['R4C7', 'R4C8', 'R5C8', 'R5C9']],
  [15, ['R4C9', 'R3C9']],
  [4, ['R1C8', 'R1C9']],
];

const sums = CAGES.map(([sum, cells]) => new Sum(sum, ...cells));

// Chain each cage's cells to its first cell's region label so all of them
// share one CC value (numSets=2, two singleton sets => the two CC cells
// must hold the same value).
const confinement = CAGES.flatMap(([, cells]) =>
  cells.slice(1).map(cell => new SameValues(2, cc.at(cells[0]), cc.at(cell)))
);

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...sums,
  ...confinement,
];
