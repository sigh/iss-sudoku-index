// Title: Flurry
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dXUzvJNkZBk
// Source: https://sudokupad.app/kivcdm7p7s

// Rules encoded here, in full:
//  1. Divide the grid into eight 2x4 boxes, each placed either horizontally
//     (2 rows x 4 columns) or vertically (4 rows x 2 columns).
//  2. Fill the grid with 1-8 so that no digit repeats in a row, column or box.
//  3. A digit in a circle indicates exactly how many circles contain that
//     digit.
//  4. Digits joined by a small white dot are consecutive. Not all possible
//     white dots are shown, so an unmarked edge carries no restriction and no
//     negative (strict) dot constraint is added.
// There are no given digits and no drawn region borders.

const graph = cellGraph('8x8');

// Region labels the solver assigns: CC cell paired with each grid cell.
const cc = graph.makeOverlay('CC');

// Drawn data: the 35 large white circles (underlay circles), by row.
const CIRCLES = [
  'R1C4', 'R1C5', 'R1C6', 'R1C7',
  'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R3C4', 'R3C6',
  'R4C1', 'R4C3', 'R4C5', 'R4C7',
  'R5C2', 'R5C5', 'R5C6', 'R5C7', 'R5C8',
  'R6C2', 'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C1', 'R7C2', 'R7C6', 'R7C7', 'R7C8',
  'R8C1', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8',
];

// Drawn data: the 6 small white edge dots (overlay circles on cell edges).
const WHITE_DOTS = [
  ['R3C1', 'R4C1'],
  ['R4C4', 'R5C4'],
  ['R5C8', 'R6C8'],
  ['R5C5', 'R5C6'],
  ['R7C6', 'R7C7'],
  ['R8C7', 'R8C8'],
];

// "Same region" / "different region" over the region-label overlay.
const sameRegion = (a, b) => new SameValues(2, cc.at(a), cc.at(b));
const diffRegion = (a, b) => new AllDifferent(cc.at(a), cc.at(b));

const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

// Rule 1, part one: ChaosConstruction gives eight orthogonally-connected
// regions of eight cells, each holding every digit once. That is not yet a 2x4
// box, so the region shape is pinned by the two groups below.
//
// Part two - each region is a rectangle. A connected 8-cell region is a
// rectangle exactly when no 2x2 window holds three of its cells and not the
// fourth (a concave corner); such a window always lies inside the region's
// bounding box, so scanning the 49 in-grid 2x2 windows is the whole condition.
// For each window, for each of its four cells in turn, forbid "the other three
// share a region that this one is not in":
//   NOT(t0 = t1 AND t1 = t2 AND t0 != odd)  ==  t0 != t1 OR t1 != t2 OR t0 = odd
const rectangularRegions = range(7).flatMap((r) => range(7).flatMap((c) => {
  const window = [
    makeCellId(r, c), makeCellId(r, c + 1),
    makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
  ];
  return window.map((odd, i) => {
    const [t0, t1, t2] = window.filter((_, j) => j !== i);
    return new Or([diffRegion(t0, t1), diffRegion(t1, t2), sameRegion(t0, odd)]);
  });
}));

// Part three - each rectangle is at least two cells thick both ways, which for
// an 8-cell rectangle leaves only 2x4 and 4x2 (1x8 and 8x1 are excluded).
// Every cell therefore shares its region with a left-or-right neighbour and
// with an above-or-below neighbour; on an edge of the grid only one candidate
// exists, so that neighbour is forced.
const thickRegions = graph.cells().flatMap((cell) => {
  const horizontal = [graph.step(cell, 0, -1), graph.step(cell, 0, 1)];
  const vertical = [graph.step(cell, -1, 0), graph.step(cell, 1, 0)];
  return [horizontal, vertical].map((dirs) => {
    const neighbours = dirs.filter((n) => n !== null);
    return neighbours.length === 1
      ? sameRegion(cell, neighbours[0])
      : new Or(neighbours.map((n) => sameRegion(cell, n)));
  });
});

return [
  new Shape('8x8'),
  // The boxes are solver-determined, so the fixed default boxes are dropped.
  new NoBoxes(),
  new ChaosConstruction(),
  ...rectangularRegions,
  ...thickRegions,

  // Rule 3: one counting-circle set over all 35 circles.
  new CountingCircles(...CIRCLES),

  // Rule 4.
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
