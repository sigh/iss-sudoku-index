// Title: Someone ate all my Candy :(
// Author: Pychael
// Video: https://www.youtube.com/watch?v=twJzFRPy1Fg
// Source: https://sudokupad.app/ajb3ccmjg6

// The 11x11 canvas allows repeated blanks, so its row-major answer is stored in
// VA: 0 is blank and 1-9 are placed digits. VO marks occupied cells, and VP is
// the 9x9 array of possible 3x3 top-left corners; a 1 selects that placement.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const occupied = canvas.makeOverlay('VO');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
const selectorsCovering = cell => placements.at(topLefts.filter(topLeft =>
  canvas.block(topLeft, 3, 3).includes(cell)));

// A selected top-left creates a complete 1-9 region. Coverage constraints below
// tie each occupied cell to exactly one selected placement.
const regions = topLefts.map(topLeft => {
  const cells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new AllDifferent(...cells),
  ]);
});

const placementCoverage = canvas.cells().map(cell =>
  new EqualSum([occupied.at(cell)], selectorsCovering(cell)));
const digitMembershipKey = Pair.fnToKey(
  (isOccupied, digit) => isOccupied === (digit === BLANK ? 0 : 1), shape);
const digitMembership = canvas.cells().map(cell => new Pair(
  digitMembershipKey, 'region membership', occupied.at(cell), answer.at(cell)));

// Reject a second occurrence of any nonblank digit in a row or column.
const nonblankDifferentKey = PairX.fnToKey(
  (a, b) => a === BLANK || b === BLANK || a !== b, shape);
const rowAndColumnUniqueness = [
  ...canvas.rows().map(row =>
    new PairX(nonblankDifferentKey, 'row nonblank digits differ', ...answer.at(row))),
  ...canvas.columns().map(column =>
    new PairX(nonblankDifferentKey, 'column nonblank digits differ', ...answer.at(column))),
];

// All possible candies are given, and none are drawn. Therefore adjacent placed
// digits have opposite parity and sum to neither 5 nor 7. Blanks do not form a
// candy pair.
const noCandyKey = Pair.fnToKey((a, b) =>
  a === BLANK || b === BLANK ||
  ((a % 2) !== (b % 2) && a + b !== 5 && a + b !== 7), shape);
const noCandyAdjacencies = [
  ...canvas.rows().map(row =>
    new Pair(noCandyKey, 'no unmarked candy', ...answer.at(row))),
  ...canvas.columns().map(column =>
    new Pair(noCandyKey, 'no unmarked candy', ...answer.at(column))),
];

const leftWrapper = answer.at([makeCellId(10, 8), makeCellId(11, 8)]);
const rightWrapper = answer.at([makeCellId(10, 9), makeCellId(11, 9)]);
const wrapperOccupied = occupied.at([
  makeCellId(10, 8), makeCellId(11, 8), makeCellId(10, 9), makeCellId(11, 9),
]);
const wrapperAtMostTenKey = Pair.fnToKey((a, b) =>
  a !== BLANK && b !== BLANK && a + b <= 10, shape);

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answer.toVar('11x11 answer, row-major; 0 is blank'),
  occupied.toVar('inside a selected 3x3 region'),
  placements.toVar('selected 3x3 top-left corners'),
  occupied.makeReplicate(new Given(occupied.cells()[0], UNUSED, SELECTED)),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new SearchPriority(100, ...placements.cells()),
  new Sum(9, ...placements.cells()),
  ...regions,
  ...placementCoverage,
  ...digitMembership,
  ...rowAndColumnUniqueness,
  ...noCandyAdjacencies,
  ...wrapperOccupied.map(cell => new Given(cell, SELECTED)),
  new EqualSum(leftWrapper, rightWrapper),
  new Pair(wrapperAtMostTenKey, 'wrapper total at most 10', ...leftWrapper),
  new Pair(wrapperAtMostTenKey, 'wrapper total at most 10', ...rightWrapper),
];
