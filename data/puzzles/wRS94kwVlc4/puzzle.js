// Title: double negative
// Author: arctan
// Video: https://www.youtube.com/watch?v=wRS94kwVlc4
// Source: https://sudokupad.app/k6k9bgnqht
//
// Normal sudoku rules (6x6, digits 1-6, default 2x3 boxes). Seven 2x2 cages
// and three little-killer-style diagonals must each sum to zero; cage digits
// (the raw grid digits) must not repeat, diagonal digits may repeat. The grid
// is unmarked, split by the solver into two orthogonally-connected regions
// with no monochrome 2x2 block. In one region every digit counts double for
// the cage/diagonal sums; in the other every digit counts as its negative.
//
// Modeling the region split: a whole-grid Var overlay 'VR' holds each cell's
// region (DOUBLE or NEGATE). ConnectedValues enforces each region is a single
// connected area (they partition the grid, so this is the disjoint
// single-value-per-set case the primitive supports). A local rule forbids a
// monochrome 2x2 window (Or of pairwise 2-cell AllDifferent from one corner).
//
// Modeling the weighted sum: a digit's contribution is 2*d when DOUBLE, -d
// when NEGATE -- a product of two unknowns (digit and region), which Sum
// cannot express directly. A second Var overlay 'VP' holds, per cell,
// "digit if DOUBLE else 0" (domain 0-6, linked to the digit and region cells
// by an Or of the two region cases). Substituting p = d if DOUBLE else 0
// gives, in both cases, weighted = 3*p - d (DOUBLE: 3*d-d=2*d; NEGATE:
// 3*0-d=-d), so each cage/diagonal total becomes the plain linear equation
// Sum(0, [cell,-1]..., [p,3]...) -- no widened weighted-value domain needed.
//
// The grid alphabet is widened to 0-6 (valueOffset -1) so 'VP' and the Given
// grid digits share one value range; every real grid cell is then given back
// down to 1-6.

const shape = new Shape('6x6', '0-6');
const graph = cellGraph(shape);
const cells = graph.cells();

const region = graph.makeOverlay('VR');   // region flag per cell
const p = graph.makeOverlay('VP');        // digit if DOUBLE, else 0, per cell
const DOUBLE = 1;
const NEGATE = 2;

// Cages: seven 2x2 blocks, each drawn with total 0.
const cages = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R1C3', 'R1C4', 'R2C3', 'R2C4'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
];

// Diagonals: each drawn as a short off-grid arrow (entry cell + direction)
// paired with a "0" total badge; walked to the far edge with graph.ray().
const diagonals = [
  graph.ray('R2C1', -1, 1),
  graph.ray('R1C2', 1, 1),
  graph.ray('R1C4', 1, 1),
];

// weighted total of `cells` (2*digit if DOUBLE, -digit if NEGATE) == 0.
function weightedZeroSum(cageCells) {
  return new Sum(
    0,
    ...cageCells.map(c => [c, -1]),
    ...cageCells.map(c => [p.at(c), 3]));
}

return [
  shape,
  region.toVar('region (1=double, 2=negate)'),
  p.toVar('digit if double region, else 0'),

  // Restrict the widened 0-6 alphabet back to real sudoku digits 1-6.
  ...cells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)),

  // Region flag domain.
  ...cells.map(cell => new Given(region.at(cell), DOUBLE, NEGATE)),

  // Each region is exactly one orthogonally-connected area (the two flag
  // values partition the whole grid, satisfying ConnectedValues' single-value
  // disjoint-set requirement).
  new ConnectedValues('VR', DOUBLE),
  new ConnectedValues('VR', NEGATE),

  // No 2x2 area is entirely one region: for every 2x2 window, at least one
  // cell's region differs from the window's first cell (sufficient to rule
  // out all-4-equal for any domain size, not just the 2 region values).
  ...(() => {
    const blocks = [];
    for (let r = 1; r < 6; r++) {
      for (let c = 1; c < 6; c++) {
        blocks.push(graph.block(makeCellId(r, c), 2, 2));
      }
    }
    return blocks.map(block => {
      const [a, b, c2, d] = region.at(block);
      return new Or([
        new AllDifferent(a, b),
        new AllDifferent(a, c2),
        new AllDifferent(a, d),
      ]);
    });
  })(),

  // p (per cell) = digit if region is DOUBLE, else 0.
  ...cells.map(cell => new Or([
    new And([new Given(region.at(cell), DOUBLE), new SameValues(2, p.at(cell), cell)]),
    new And([new Given(region.at(cell), NEGATE), new Given(p.at(cell), 0)]),
  ])),

  // Cages: raw digits distinct, weighted total zero.
  ...cages.flatMap(cageCells => [
    new AllDifferent(...cageCells),
    weightedZeroSum(cageCells),
  ]),

  // Diagonals: repeats allowed, weighted total zero.
  ...diagonals.map(weightedZeroSum),
];
