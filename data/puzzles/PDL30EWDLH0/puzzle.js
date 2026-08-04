// Title: Confined Sandwich Chaos
// Author: PrimeWeasel
// Video: https://www.youtube.com/watch?v=PDL30EWDLH0
// Source: https://app.crackingthecryptic.com/sudoku/bpM7GtF94D

// Rules encoded: standard row/column/region Sudoku with unknown regions
// (Chaos Construction: nine orthogonally-connected 9-cell regions, one digit
// each); no region may cover a full 2x2 block; outside sandwich clues (sum of
// digits strictly between the 1 and 9 in a row/column) with the extra rule
// that every cell of the sandwich's span -- both crusts and everything
// between -- shares one region; and circled cells whose own placed digit
// states how many of their up-to-8 king-move neighbours share their region.
// "All circles are given" -- no circle is omitted.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cc = graph.makeOverlay('CC');
const gridCells = graph.cells();

// Row/column sandwich totals, read from the outside-clue overlays.
const ROW_SANDWICHES = [[1, 4], [4, 2], [7, 5], [9, 6]];
const COL_SANDWICHES = [[1, 24], [2, 3], [7, 2], [8, 11], [9, 6]];

// Circle overlay cells (drawn art, no separate printed value): the digit the
// solver places in each cell doubles as the circle's own clue value.
const CIRCLE_CELLS = [
  'R3C1', 'R1C2', 'R3C4', 'R3C8', 'R3C9', 'R4C2', 'R6C1', 'R6C6', 'R7C5',
  'R8C3', 'R9C1', 'R9C3', 'R4C3',
];

const givens = [
  new Given('R2C5', 7),
  new Given('R5C6', 4),
  new Given('R7C6', 1),
  new Given('R8C4', 7),
];

// No region may cover a full 2x2 block: an NFA over each block's 4 region
// labels (top-left, top-right, bottom-left, bottom-right, in that reading
// order from `graph.block`) rejects only when all 4 match. Replicated from
// the top-left block to every block origin.
const noMonoRegion2x2Spec = {
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
};
const noMonoRegion2x2NFA = NFA.encodeSpec(noMonoRegion2x2Spec, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMonoRegion2x2 = cc.makeReplicate(
  new NFA(noMonoRegion2x2NFA, 'no-mono-region-2x2',
    ...cc.at(graph.block(gridCells[0], 2, 2))),
  cc.at(blockOrigins));

// Circle clue: cell sequence is [own digit, own region label, each king
// neighbour's region label]. `digit` is read first (the clue's target
// count), `label` second (what a matching neighbour must equal), then each
// neighbour increments `count` when its label matches, clamped at digit+1
// (a sink meaning "already too many") to keep the state space finite. Accept
// only once both have been read and count === digit; neighbour-count varies
// by cell (corner/edge/interior), which this handles without a fixed length.
const circleCountSpec = {
  startState: { digit: null, label: null, count: 0 },
  transition: ({ digit, label, count }, value) => {
    if (digit === null) return { digit: value, label, count };
    if (label === null) return { digit, label: value, count };
    const hit = value === label ? 1 : 0;
    return { digit, label, count: Math.min(count + hit, digit + 1) };
  },
  accept: ({ digit, label, count }) =>
    digit !== null && label !== null && count === digit,
  maxDepth: 10,
};
const circleCountNFA = NFA.encodeSpec(circleCountSpec, geometry.numValues);
const circleCounts = CIRCLE_CELLS.map(cell => new NFA(
  circleCountNFA, 'circle-region-neighbours',
  cell, cc.at(cell), ...cc.at(graph.kingNeighbours(cell))));

// Sandwich sum plus the "whole span shares a region" rule. The span's ends
// are wherever the 1 and 9 land (order unknown), so enumerate every cell pair
// as the crusts: Or over (And(1 at i, 9 at j) or And(9 at i, 1 at j), with
// every region label from i to j forced equal via SameValues on singleton
// sets -- SameValues(numSets = cells.length, ...cells) makes each set one
// cell, so "sets hold the same values" means the cells are pairwise equal).
function sandwichConstraints(cells, sum) {
  const sumClue = Sandwich.fromCells(sum, cells, geometry);
  const branches = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const window = cc.at(cells.slice(i, j + 1));
      branches.push(new And([
        new Given(cells[i], 1), new Given(cells[j], 9),
        new SameValues(window.length, ...window),
      ]));
      branches.push(new And([
        new Given(cells[i], 9), new Given(cells[j], 1),
        new SameValues(window.length, ...window),
      ]));
    }
  }
  return [sumClue, new Or(branches)];
}

const rowSandwiches = ROW_SANDWICHES.flatMap(
  ([row, sum]) => sandwichConstraints(graph.row(row), sum));
const colSandwiches = COL_SANDWICHES.flatMap(
  ([col, sum]) => sandwichConstraints(graph.column(col), sum));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...givens,
  noMonoRegion2x2,
  ...circleCounts,
  ...rowSandwiches,
  ...colSandwiches,
];
