// Title: Quadswallop
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=rDZQmwt-PnY
// Source: https://sudokupad.app/da3cezx5at

// CHAOS CONSTRUCTION: the grid splits into 8 orthogonally-connected 8-cell
// regions; digits 1-8 don't repeat in any row, column, or region.
//
// GREY/RED/BLUE LINES: the two end cells of every drawn line lie in
// different regions.
//
// Not encoded: DOUBLERS (which cell in each row/column/region is the
// doubler, and that the 8 doublers show different digits); QUADSWALLOP (the
// 14 lettered quad circles); and the equal-segment-sum part of REGION SUM
// LINES (blue). Because Doublers is omitted, a cell's true
// displayed value (digit, or double the digit if it is an unmodelled
// doubler) is unknown, so PURPLE X and the red PARITY lines below are
// encoded against the *achievable* value under a free, per-cell doubling
// choice -- the rule's necessary condition, which never rejects the true
// grid but is weaker than the full rule.

const cc = cellGraph('8x8').makeOverlay('CC');

// Purple X marks: small purple crosses drawn on the shared edge of two
// orthogonal cells. Values sum to 10 and the two cells are in the same
// region.
const PURPLE_X_PAIRS = [
  ['R1C1', 'R2C1'],
  ['R6C1', 'R6C2'],
  ['R6C2', 'R6C3'],
  ['R8C5', 'R8C6'],
  ['R5C5', 'R5C6'],
  ['R4C6', 'R4C7'],
];

// Sum to 10 allowing either cell to be an (unmodelled) doubler: the shown
// value is its digit or double its digit, so accept the sum under any of
// the four doubling combinations.
const sumToTenKey = Pair.fnToKey(
  (a, b) => (a + b === 10) || (2 * a + b === 10) ||
    (a + 2 * b === 10) || (2 * a + 2 * b === 10),
  8);

const purpleX = PURPLE_X_PAIRS.flatMap(([a, b]) => [
  new Pair(sumToTenKey, 'PurpleXSum', a, b),
  // Same region: the two cells' Chaos-region labels are equal.
  new SameValues(2, cc.at(a), cc.at(b)),
]);

// Red parity lines: adjacent cells alternate even/odd value. Doubling
// always yields an even value and never yields odd, so the only value
// combination doubling can never rescue is "both digits even" -- that is
// the necessary condition encoded here (see header).
const notBothEvenKey = Pair.fnToKey((a, b) => (a % 2 === 1) || (b % 2 === 1), 8);
const RED_LINES = [
  ['R1C2', 'R2C3', 'R3C4'],
  ['R5C4', 'R6C4'],
];
const redParity = RED_LINES.map(cells =>
  new Pair(notBothEvenKey, 'RedParity', ...cells));

// Every drawn grey/red/blue line, by its full cell path (used below only
// for its two end cells -- the common "different regions" rule).
const ALL_LINES = [
  ...RED_LINES,
  ['R5C3', 'R6C3'],           // grey
  ['R8C7', 'R8C8'],           // grey
  ['R3C8', 'R4C8'],           // grey
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'], // blue (region-sum totals not encoded)
  ['R7C1', 'R7C2', 'R8C3'],          // blue (region-sum totals not encoded)
  ['R3C7', 'R3C6', 'R2C6'],          // blue (region-sum totals not encoded)
];
const differentRegionEnds = ALL_LINES.map(cells => {
  const ends = [cells[0], cells[cells.length - 1]];
  return new AllDifferent(...cc.at(ends));
});

return [
  new Shape('8x8'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...purpleX,
  ...redParity,
  ...differentRegionEnds,
];
