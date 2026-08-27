// Title: Blue Cages
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=lWdISywjRVQ
// Source: https://sudokupad.app/9xec41tr2z
//
// Rules encoded:
// - The nine 3x3 boxes are not fixed: the solver must partition the grid into
//   nine orthogonally-connected 9-cell regions, each holding every digit once.
//   That is exactly `ChaosConstruction` (region labels live on the `CC`
//   overlay), so `NoBoxes` drops the default boxes.
// - Some region borders are already drawn on the grid (as bold cell-border
//   walls; the drawn outer grid frame is not one of them): the cell pairs on
//   either side of a given border must sit in different regions.
// - Eleven cages are drawn (all no-total, all-different-only): digits within
//   a cage don't repeat, and no cage lies entirely inside one region. Where a
//   region border crosses a cage, it must split the cage's cells (within
//   that region) into pieces that are each a single orthogonally connected
//   group, and every piece of the cage (across all regions it touches) has
//   the same sum.
// - White dots are drawn on some cell edges: the two digits are consecutive.
//   Not every possible dot is necessarily drawn.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Cages: cell lists transcribed from the drawn cage outlines. All eleven
// cages are marked all-different, with no printed total.
const CAGES = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3'],
  ['R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C7', 'R3C8'],
  ['R5C6', 'R5C7', 'R6C7'],
];

// Given region borders: the seven cell-border walls drawn on the grid
// (distinct from the drawn grid frame, which is not a region border). Cells
// on either side of each listed edge must be in different regions.
const GIVEN_BORDERS = [
  ['R3C2', 'R4C2'],
  ['R4C2', 'R5C2'],
  ['R8C2', 'R8C3'],
  ['R3C8', 'R4C8'],
  ['R2C2', 'R3C2'],
  ['R2C3', 'R3C3'],
  ['R1C7', 'R2C7'],
];

// White dots: the four edge-sized rounded white marks drawn on the grid.
const WHITE_DOTS = [
  ['R2C2', 'R3C2'],
  ['R3C2', 'R4C2'],
  ['R4C2', 'R5C2'],
  ['R8C2', 'R8C3'],
];

const eqKey = Pair.fnToKey((a, b) => a === b, 9);

function isAdjacent(a, b) {
  const A = parseCellId(a), B = parseCellId(b);
  return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
}

// Every way to partition a cage's cells into 2+ parts, each part connected
// under the cage's own cell-adjacency (not the whole grid's). A region
// border can only ever produce such a partition -- an unbroken cage is
// excluded here, which is exactly "no cage entirely in one region" -- and
// each part is, by construction, the single connected piece the rule
// requires wherever a region actually holds it.
function connectedPartitions(cells) {
  const adj = cells.map(a => cells.map(b => a !== b && isAdjacent(a, b)));

  function isConnected(part) {
    if (part.length <= 1) return true;
    const idx = part.map(c => cells.indexOf(c));
    const seen = new Set([idx[0]]);
    const stack = [idx[0]];
    while (stack.length) {
      const i = stack.pop();
      for (const j of idx) {
        if (!seen.has(j) && adj[i][j]) { seen.add(j); stack.push(j); }
      }
    }
    return seen.size === idx.length;
  }

  // Standard set-partition generator (Bell-number growth), bounded because
  // every cage here has at most 9 cells.
  function* allPartitions(rest) {
    if (rest.length === 1) { yield [rest]; return; }
    const [first, ...tail] = rest;
    for (const smaller of allPartitions(tail)) {
      for (let n = 0; n < smaller.length; n++) {
        yield smaller.map((part, i) => i === n ? [first, ...part] : part);
      }
      yield [[first], ...smaller];
    }
  }

  const result = [];
  for (const partition of allPartitions(cells)) {
    if (partition.length < 2) continue;
    if (partition.every(isConnected)) result.push(partition);
  }
  return result;
}

// One branch per valid region-border partition of a cage: cells sharing a
// piece share a region label (chained `Pair` equality suffices, since
// equality is transitive), pieces are pairwise in different regions
// (`AllDifferent` on one representative label per piece), and the pieces'
// digit sums are equal (`EqualSum`).
function cageEqualSumConstraint(cells) {
  const branches = connectedPartitions(cells).map(partition => {
    const parts = [
      ...partition
        .filter(part => part.length > 1)
        .map(part => new Pair(eqKey, 'cage piece same region', ...cc.at(part))),
      new AllDifferent(...cc.at(partition.map(part => part[0]))),
      new EqualSum(...partition),
    ];
    return new And(parts);
  });
  return new Or(branches);
}

const cageAllDifferents = CAGES.map(cells => new AllDifferent(...cells));
const cageEqualSums = CAGES.map(cageEqualSumConstraint);
const givenBorders = GIVEN_BORDERS.map(
  ([a, b]) => new AllDifferent(cc.at(a), cc.at(b)));
const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...givenBorders,
  ...cageAllDifferents,
  ...cageEqualSums,
  ...whiteDots,
];
