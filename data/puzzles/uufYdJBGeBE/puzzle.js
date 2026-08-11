// Title: Tetrakiller
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=uufYdJBGeBE
// Source: https://app.crackingthecryptic.com/sudoku/9T86Nq6r4b

// Normal sudoku rules apply. 21 killer-style cages are drawn on the grid
// (some single cells, some no-total; 26 of the 81 cells belong to no cage at
// all). Rules text: "In each cage, the digits sum to one of four distinct
// values. No two cages with the same total share an edge. Digits may not
// repeat within a cage."
//
// "One of four distinct values" only says every cage total is drawn from a
// set of size <= 4; it does not require all four to actually occur, so it is
// encoded as an upper bound on the number of distinct totals, not as a
// requirement that exactly four appear.
//
// A cage total can reach 39 (the 6-cell cage), past ISS's 16-value alphabet
// cap, so each cage's total is represented off-grid as a base-10 (high, low)
// Var pair tied to the cage's own cells with a coefficient Sum. Four
// (high, low) pairs stand for the puzzle's at-most-four shared totals; each
// cage's pair must equal one of them (Or), and every pair of cages that
// share a grid edge is forced to differ on high or low, i.e. to have
// different totals.

const graph = cellGraph('9x9');

// Cage cell membership, transcribed from the puzzle's 21 drawn cages (no
// printed totals; 26 of the 81 cells belong to no cage).
const CAGES = [
  ['R2C2', 'R2C3'],
  ['R3C1', 'R4C1', 'R4C2'],
  ['R1C3', 'R1C4', 'R2C4', 'R3C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R2C6', 'R3C6', 'R3C5'],
  ['R2C7', 'R3C7', 'R4C7', 'R3C8'],
  ['R4C3', 'R4C4', 'R4C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R5C5'],
  ['R5C4'],
  ['R5C3', 'R6C3', 'R6C4', 'R6C5'],
  ['R6C2', 'R7C2', 'R7C3'],
  ['R7C1', 'R8C1', 'R9C1', 'R8C2'],
  ['R9C2', 'R9C3'],
  ['R8C3', 'R8C4'],
  ['R9C4'],
  ['R7C5', 'R8C5', 'R9C5', 'R7C6', 'R8C6', 'R8C7'],
  ['R9C6'],
  ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'],
  ['R7C8'],
];

// Widen the alphabet to 16 (the max ISS allows) so the off-grid total Vars
// below have room; restrict the real grid cells back to digits 1-9 with one
// Replicate over the whole grid.
const shape = new Shape('9x9', '0-15');
const gridRestriction = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// No repeats within a cage. A single-cell cage adds no local constraint.
const allDifferents = CAGES
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// Per-cage total, split base-10: total = 10*high + low. `low` is pinned to
// 0-9 so the split is the unique one for that total -- otherwise 25 could
// serialize as (high=1, low=15) as well as (high=2, low=5), and the equality
// comparisons below would stop meaning "same total".
const high = new Var('H', 'cage total tens', CAGES.length);
const low = new Var('L', 'cage total ones', CAGES.length);
const lowRange = low.cells().map(
  cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const totalTies = CAGES.map((cells, i) => new Sum(
  0, ...cells, [high.cell(i + 1), -10], [low.cell(i + 1), -1]));

// The puzzle's at-most-four shared totals, represented the same way.
const repHigh = new Var('RH', 'shared total tens', 4);
const repLow = new Var('RL', 'shared total ones', 4);

// Every cage's total must equal one of the four shared totals.
const oneOfFourTotals = CAGES.map((_, i) => new Or([1, 2, 3, 4].map(k => new And([
  new SameValues(2, high.cell(i + 1), repHigh.cell(k)),
  new SameValues(2, low.cell(i + 1), repLow.cell(k)),
]))));

// Cage adjacency (share a grid edge), derived from the cage membership above
// rather than hand listed: any orthogonal grid-cell pair whose cells belong
// to two different cages.
const cellCage = new Map();
CAGES.forEach((cells, i) => cells.forEach(cell => cellCage.set(cell, i)));
const seenPairs = new Set();
const adjacentCagePairs = [];
for (const [cell, i] of cellCage) {
  for (const neighbour of graph.neighbours(cell)) {
    const j = cellCage.get(neighbour);
    if (j === undefined || j === i) continue;
    const key = i < j ? `${i}_${j}` : `${j}_${i}`;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    adjacentCagePairs.push([i, j]);
  }
}

// Edge-adjacent cages must differ on high or low, i.e. have different totals.
const noSharedEdgeTotal = adjacentCagePairs.map(([i, j]) => new Or([
  new AllDifferent(high.cell(i + 1), high.cell(j + 1)),
  new AllDifferent(low.cell(i + 1), low.cell(j + 1)),
]));

return [
  shape,
  gridRestriction,
  ...allDifferents,
  high, low,
  ...lowRange,
  ...totalTies,
  repHigh, repLow,
  ...oneOfFourTotals,
  ...noSharedEdgeTotal,
];
