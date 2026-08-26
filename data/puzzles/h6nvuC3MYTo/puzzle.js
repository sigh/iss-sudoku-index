// Title: Even Regions
// Author: Vythic
// Video: https://www.youtube.com/watch?v=h6nvuC3MYTo
// Source: https://sudokupad.app/gaonp82fme

// Rules encoded here, in full:
//  * Normal sudoku (rows, columns, boxes).
//  * Even Regions: the cells holding even digits (2/4/6/8, always 36 cells)
//    split into exactly four orthogonally-connected regions of nine cells
//    each, and orthogonally adjacent even cells always share a region.
//  * Opposite Arrows: the digit on an arrow cell counts, along the arrow's
//    straight ray to the grid edge, the cells whose digit has the opposite
//    parity to the arrow cell's own digit.
//  * Kropki dots: white = consecutive, black = one digit double the other.
//    Not every such pair is marked (no exhaustiveness claim in the rules).
//  * Killer cages: sum to the corner total, no repeats.

const graph = cellGraph('9x9');

// --- Even Regions --------------------------------------------------------
// One overlay cell per grid cell holds the region label: NOT_EVEN for an odd
// digit, or one of REGION_LABELS (mapped 1-4 -> values 2-5) for an even
// digit's region. Adjacency forces same-label on adjacent even cells;
// ConnectedValues' size argument pins each label's cells to one connected
// nonant; a reading-order NFA breaks the 4! relabelling symmetry so the
// solution count matches the grid alone.
const NOT_EVEN = 1;
const REGION_LABELS = [2, 3, 4, 5];

const el = graph.makeOverlay('VL');
const elVar = el.toVar('EvenRegion');

const parityLinkKey = Pair.fnToKey(
  (digit, label) => (label === NOT_EVEN) === (digit % 2 === 1), 9);
const parityLinks = graph.cells().map(cell =>
  new Pair(parityLinkKey, 'EvenParity', cell, el.at(cell)));

const sameRegionKey = Pair.fnToKey(
  (a, b) => a === NOT_EVEN || b === NOT_EVEN || a === b, 9);
const elCells = el.cells();
const elOrigin = elCells[0];
const rightTargets = elCells.filter(c => el.step(c, 0, 1) !== null);
const downTargets = elCells.filter(c => el.step(c, 1, 0) !== null);
const regionAdjacency = [
  el.makeReplicate(
    new Pair(sameRegionKey, 'EvenRegionAdjacent', elOrigin, el.step(elOrigin, 0, 1)),
    rightTargets),
  el.makeReplicate(
    new Pair(sameRegionKey, 'EvenRegionAdjacent', elOrigin, el.step(elOrigin, 1, 0)),
    downTargets),
];

const regionSizes = REGION_LABELS.map(label =>
  new ConnectedValues('VL', label, 9));

// Canonical order: the first-seen label in reading order must be 2, the next
// new label 3, and so on -- forbids e.g. label 3 appearing before label 2.
const orderSpec = NFA.encodeSpec({
  startState: 1,                      // highest label emitted so far, offset by 1
  transition: (maxSeen, value) => {
    if (value === NOT_EVEN) return maxSeen;
    if (value > maxSeen + 1) return undefined;
    return Math.max(maxSeen, value);
  },
  accept: () => true,
}, 9);
const regionOrder = new NFA(orderSpec, 'EvenRegionOrder', ...el.cells());

// --- Opposite Arrows -------------------------------------------------------
// Cell sequence per clue: [arrow_cell, ray_cell_1, ray_cell_2, ...] to the
// grid edge. Same machine as the parity-count arrows in uncovering_tunnels.js.
const parityCountSpec = {
  startState: { target: null, count: 0 },
  transition({ target, count }, value) {
    if (target === null) return { target: value, count };
    const newCount = count + ((value % 2) !== (target % 2) ? 1 : 0);
    if (newCount > target) return undefined;
    return { target, count: newCount };
  },
  accept: ({ target, count }) => target !== null && count === target,
};
const parityCountNFA = NFA.encodeSpec(parityCountSpec, 9);

const ARROWS = [
  { origin: 'R5C2', dir: [0, 1] },    // right
  { origin: 'R5C2', dir: [-1, 0] },   // up
  { origin: 'R3C2', dir: [0, 1] },    // right
  { origin: 'R3C2', dir: [1, 0] },    // down
  { origin: 'R8C5', dir: [-1, 0] },   // up
  { origin: 'R6C8', dir: [0, -1] },   // left
  { origin: 'R4C8', dir: [0, -1] },   // left
  { origin: 'R4C8', dir: [1, 0] },    // down
  { origin: 'R2C7', dir: [1, 0] },    // down
  { origin: 'R2C7', dir: [0, -1] },   // left
  { origin: 'R1C6', dir: [1, -1] },   // down-left
  { origin: 'R5C5', dir: [1, 1] },    // down-right
  { origin: 'R6C5', dir: [-1, -1] },  // up-left
];

const arrowCounts = ARROWS.map(({ origin, dir }) => {
  const ray = graph.ray(origin, dir[0], dir[1]).slice(1);
  return new NFA(parityCountNFA, 'OppositeArrowCount', origin, ...ray);
});

// --- Kropki dots -----------------------------------------------------------
// Provenance: the drawn dot markers, classified by fill colour (white fill +
// black border = white/consecutive; black fill = black/ratio).
const WHITE_DOTS = [
  ['R5C9', 'R6C9'],
  ['R1C3', 'R2C3'],
  ['R2C9', 'R3C9'],
  ['R4C5', 'R4C6'],
  ['R9C5', 'R9C6'],
  ['R2C1', 'R2C2'],
  ['R3C3', 'R4C3'],
];
const BLACK_DOTS = [
  ['R3C3', 'R3C4'],
  ['R4C1', 'R5C1'],
  ['R4C2', 'R4C3'],
];
const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));
const blackDots = BLACK_DOTS.map(([a, b]) => new BlackDot(a, b));

// --- Killer cages ------------------------------------------------------
// Provenance: the drawn cage outlines and their corner totals.
const cages = [
  new Cage(27, 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R7C9'),
  new Cage(20, 'R6C1', 'R6C2', 'R7C1', 'R7C2'),
  new Cage(28, 'R2C5', 'R2C6', 'R3C5', 'R3C6', 'R4C6'),
];

return [
  new Shape('9x9'),
  elVar,
  ...parityLinks,
  ...regionAdjacency,
  ...regionSizes,
  regionOrder,
  ...arrowCounts,
  ...whiteDots,
  ...blackDots,
  ...cages,
];
