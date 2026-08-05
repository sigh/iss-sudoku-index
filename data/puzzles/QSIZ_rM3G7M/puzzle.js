// Title: Balanced Chaos
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=QSIZ_rM3G7M
// Source: https://app.crackingthecryptic.com/sudoku/pf8979mT6F

// Divide the grid into nine orthogonally connected 9-cell regions, with 1-9
// once per row, column, and region. The black drawn border segments separate
// the paired cells below. The blue region-sum-line rule is omitted.
const knownBorders = [
  ['R1C7', 'R2C7'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
];
const cc = cellGraph('9x9').makeOverlay('CC');

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...knownBorders.map(([a, b]) => new AllDifferent(...cc.at([a, b]))),
];
