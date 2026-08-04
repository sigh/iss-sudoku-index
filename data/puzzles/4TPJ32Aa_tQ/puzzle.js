// Title: SYO Sum Lines
// Author: Xendari
// Video: https://www.youtube.com/watch?v=4TPJ32Aa_tQ
// Source: https://app.crackingthecryptic.com/sudoku/H2Lb4hnFgm

// Rules encoded here:
//  * Shade some cells; every shaded cell is orthogonally connected to every
//    other shaded cell (one connected region across the whole grid).
//  * A circled cell's digit equals the count of shaded cells within that
//    circle's own 3x3 box.
//
// Omitted: "within each 3x3 box, every separate orthogonally connected group
// of shaded cells sums to N, the same N for every box." A box-local shaded
// group is a solver-discovered, unbounded-count partition of up to 9 cells
// tied to one value shared across all 9 boxes.

const SHADED = 2;
const UNSHADED = 1;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const boxes = graph.boxes();

// Every shade Var is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Seven circled cells (drawn as circle overlays with no visible text). Two
// carry a pre-filled digit (also given below); the other five are undrawn
// but still bound by the count rule.
const circles = [
  'R2C5', 'R2C8', 'R5C2', 'R5C9', 'R7C2', 'R7C4', 'R7C7',
];

// digit(circle) = count of shaded cells in the circle's box
//   = sum over the box of (shadeVal - 1), since SHADED=2, UNSHADED=1
//   => circle - sum(shadeVal) = -9
const circleCounts = circles.map(cell => {
  const box = boxes.find(b => b.includes(cell));
  return new Sum(-9, [cell, 1], ...box.map(c => [shade.at(c), -1]));
});

return [
  new Shape('9x9'),
  new Given('R3C5', 6),
  new Given('R5C9', 1),
  new Given('R6C2', 9),
  new Given('R7C7', 5),
  new Given('R8C9', 6),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  ...circleCounts,
];
