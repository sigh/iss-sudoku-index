// Title: Dodekanesos
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=StSN0FLX1HY
// Source: https://app.crackingthecryptic.com/sudoku/MRfqQRbHmB

// Rules encoded here, in full:
//   Normal sudoku rules apply. Shade the grid according to the following rules:
//   all odd digits are 'water' and should be unshaded; all even digits must be
//   shaded to form islands; all water cells must be orthogonally connected but
//   there cannot be any 2x2 areas of water. An island is formed of orthogonally
//   connected cells. Islands cannot touch each other orthogonally but they can
//   touch diagonally. Digits may repeat on an island. A cage cell is
//   representing the leftmost cell in the top row of an island and the clue of
//   the cage cell is equal to the sum of digits of the island. Not necessarily
//   all cage cells are given.
//
// The shading is not a free choice: a cell is water exactly when its digit is
// odd, so the islands are the orthogonally-connected components of the
// even-digit cells. The VL overlay names, for every cell, which island it
// belongs to: 1..7 for the seven clued islands (in cage-clue order), UNCLUED for
// an even cell in an island with no cage clue, WATER for an odd cell. "Islands
// cannot touch each other orthogonally" is what makes each island a *maximal*
// connected even area, and is encoded as the maximality Pair below rather than
// as a separate no-touch rule.

const WATER = 9;    // VL label: this cell's digit is odd (unshaded)
const UNCLUED = 8;  // VL label: shaded cell of an island carrying no cage clue

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();       // row-major reading order
const island = graph.makeOverlay('VL');

const givens = [
  ['R1C2', 4], ['R1C6', 1], ['R2C2', 9], ['R2C6', 6], ['R2C8', 5],
  ['R3C9', 3], ['R6C2', 3], ['R7C7', 1], ['R9C3', 7],
].map(([cell, digit]) => new Given(cell, digit));

// The seven drawn single-cell cages, as (cage cell, printed total). Each is the
// leftmost cell of the top row of its island, i.e. the first cell of that island
// in reading order. Distinct cage cells therefore mark distinct islands, so each
// takes its own VL label 1..7.
const cages = [
  ['R1C1', 18],
  ['R3C2', 20],
  ['R2C5', 44],
  ['R1C9', 6],
  ['R5C4', 60],
  ['R9C1', 2],
  ['R9C7', 18],
];
const anchorIndex = cages.map(([cell]) => gridCells.indexOf(cell));

// A cage cell is its island's first cell in reading order, so no cell earlier in
// reading order can carry that island's label.
const anchors = cages.map(([cell], i) => new Given(island.at(cell), i + 1));
const labelDomains = gridCells.flatMap((cell, index) => {
  const reachable = anchorIndex.flatMap((start, i) => index >= start ? [i + 1] : []);
  if (reachable.length === cages.length) return [];
  return [new Given(island.at(cell), ...reachable, UNCLUED, WATER)];
});

// Odd digit <=> water; even digit <=> a member of some island.
const parityKey = Pair.fnToKey(
  (digit, label) => (digit % 2 === 1) === (label === WATER), geometry.numValues);
const shading = gridCells.map(
  cell => new Pair(parityKey, 'shading follows parity', cell, island.at(cell)));

// Island maximality: two orthogonally adjacent shaded cells are in the same
// island. Right/down steps cover each orthogonal pair exactly once.
const sameIslandKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, geometry.numValues);
const maximality = [[0, 1], [1, 0]].map(([dR, dC]) => {
  const starts = gridCells.filter(cell => graph.step(cell, dR, dC));
  const origin = island.at(starts[0]);
  return new Replicate(
    [new Pair(sameIslandKey, 'islands do not touch',
      origin, island.at(graph.step(starts[0], dR, dC)))],
    Replicate.encodeTargetCells(island.at(starts), origin, island),
    origin);
});

// Each clued island is one orthogonally-connected area; together with
// maximality above, the label-k cells are exactly one whole island.
const islandRegions = cages.map((_, i) => new ConnectedValues('VL', i + 1));

// At least one even digit in every 2x2 block: no 2x2 area of water.
const no2x2Water = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .map(block => new Regex('.*[2468].*', ...block));

// The digits of an island sum to its cage clue. The machine reads the cells from
// the cage cell onwards in reading order as (island label, digit) pairs, adding
// the digit only when the label is this island's; `add === null` means the next
// symbol is a label. `sum` is capped by rejecting any total past the clue.
function islandSumMachine(label, total) {
  return NFA.encodeSpec({
    startState: { sum: 0, add: null },
    transition: ({ sum, add }, value) => {
      if (add === null) return { sum, add: value === label };
      const next = add ? sum + value : sum;
      return next > total ? undefined : { sum: next, add: null };
    },
    accept: ({ sum, add }) => add === null && sum === total,
  }, geometry.numValues);
}
const islandSums = cages.map(([cell, total], i) => new NFA(
  islandSumMachine(i + 1, total),
  `island sum ${total}`,
  ...gridCells.slice(anchorIndex[i]).flatMap(c => [island.at(c), c])));

return [
  new Shape('9x9'),
  island.toVar('island membership'),
  ...givens,
  ...anchors,
  ...labelDomains,
  ...shading,
  ...maximality,
  ...islandRegions,
  // All water cells form one orthogonally-connected region.
  new ConnectedValues('', [1, 3, 5, 7, 9]),
  ...no2x2Water,
  ...islandSums,
];
