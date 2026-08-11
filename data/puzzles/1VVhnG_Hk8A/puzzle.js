// Title: 500k Subs
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=1VVhnG_Hk8A
// Source: https://app.crackingthecryptic.com/sudoku/tnHfB78T98

// Normal sudoku. 3 snakes are hidden in the grid: a snake is a set of cells
// connected in a simple chain, each cell sharing an edge or a corner with the
// next (the rules' own words, and a drawn grey segment R1C6-R2C7 is diagonal,
// so a corner join is a real path step, not just a "touching" definition). A
// snake cannot branch and cannot touch itself or another snake, orthogonally
// or diagonally, except at the shared edge/corner that joins two consecutive
// cells of the same snake. Each snake's digits multiply to exactly 500, and no
// snake may start or end on a 1. Parts of some snakes are drawn as grey lines.
//
// Omitted: whole-path connectivity for each snake (equivalently: a snake label
// could in principle cover the real path plus a small disjoint same-label
// cycle elsewhere that also satisfies the local checks below). No available
// primitive gives connectivity over a king-move-adjacent, solver-chosen cell
// set (the usual orthogonal-only connectivity check would reject the real,
// partly-diagonal solution here). Closing it needs per-snake directed step
// variables, in/out-degree checks and two coprime modular position counters
// seeded at a non-endpoint anchor (no snake cell is otherwise known) -- that
// construction has only ever been built for a single anchored path, and
// tripling it for three mutually-exclusive, fully unknown snakes is well
// beyond that precedent. This is a relaxation, not a tightening: it cannot
// reject the real solution, only (in principle) admit an unintended extra
// one. Everything else the rules state is encoded below.

const NONE = 1, S1 = 2, S2 = 3, S3 = 4;   // snake-label values (1-indexed, ISS convention)

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const numValues = graph.gridGeometry().numValues;

// One label per grid cell: which of the 3 snakes (if any) that cell belongs to.
const label = graph.makeOverlay('VS');
const domain = label.makeReplicate(new Given(label.cells()[0], NONE, S1, S2, S3));

// --- Per-cell shape check -------------------------------------------------
// Reads a cell's own label and digit, then its up-to-8 king neighbours'
// labels. An off-snake cell (NONE) is unconstrained. An on-snake cell must
// not king-touch a different label at all, and may king-touch its own label
// 1 or 2 times (never 0 -- a lone cell can't multiply to 500 -- never 3+,
// which would be a branch); exactly 1 same-label king-neighbour makes it a
// path endpoint, which the rule forbids holding a 1.
const snakeCellMachine = NFA.encodeSpec({
  startState: { phase: 'label' },
  transition: (s, value) => {
    if (s.phase === 'label') return { phase: 'digit', ownLabel: value };
    if (s.phase === 'digit') return { phase: 'nbr', ownLabel: s.ownLabel, ownDigit: value, count: 0 };
    // phase 'nbr': value is one king-neighbour's label
    if (s.ownLabel === NONE) return s;
    if (value === NONE) return s;
    if (value !== s.ownLabel) return undefined;      // touches a different snake
    const count = s.count + 1;
    return count > 2 ? undefined : { ...s, count };  // branch guard
  },
  accept: (s) => {
    if (s.phase !== 'nbr') return false;
    if (s.ownLabel === NONE) return true;
    if (s.count === 0) return false;                 // isolated on-snake cell
    if (s.count === 1 && s.ownDigit === 1) return false; // endpoint can't be 1
    return true;
  },
}, numValues);

const snakeCells = gridCells.map(cell => new NFA(
  snakeCellMachine, 'snake-cell',
  label.at(cell), cell, ...label.at(graph.kingNeighbours(cell)),
));

// --- Per-snake product = 500 ----------------------------------------------
// 500 = 2^2 x 5^3. Scans the whole grid (label, digit) pairs in any fixed
// order -- the product doesn't care about path order -- tracking the
// exponents of 2 and 5 contributed by cells carrying this snake's label.
// A digit outside {1,2,4,5} (or an 8, which alone already exceeds 2^2)
// cannot appear in any factorisation of 500, so it dead-ends the branch.
const FACTORS = { 1: [0, 0], 2: [1, 0], 4: [2, 0], 5: [0, 1] };
const productMachine = (snake) => NFA.encodeSpec({
  startState: { phase: 'label', a: 0, b: 0 },
  transition: (s, value) => {
    if (s.phase === 'label') return { phase: 'digit', a: s.a, b: s.b, isThis: value === snake };
    if (!s.isThis) return { phase: 'label', a: s.a, b: s.b };
    const f = FACTORS[value];
    if (!f) return undefined;
    const a = s.a + f[0], b = s.b + f[1];
    return (a > 2 || b > 3) ? undefined : { phase: 'label', a, b };
  },
  accept: (s) => s.phase === 'label' && s.a === 2 && s.b === 3,
}, numValues);
const productReads = gridCells.flatMap(cell => [label.at(cell), cell]);
const products = [S1, S2, S3].map(snake =>
  new NFA(productMachine(snake), 'snake-product', ...productReads));

// --- Canonical snake numbering ---------------------------------------------
// The 3 snakes are otherwise interchangeable, so without this the same grid
// would count as up to 3! distinct "solutions" over the label layer alone.
// Break the symmetry: scanning row-major, a new label may only ever be one
// more than the highest label already used, and label S3 must appear (there
// really are 3 snakes, not fewer).
const orderMachine = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  transition: (s, value) => {
    const idx = value - NONE;
    if (idx === 0) return s;
    return idx > s.maxSeen + 1 ? undefined : { maxSeen: Math.max(s.maxSeen, idx) };
  },
  accept: (s) => s.maxSeen === 3,
}, numValues);
const canonicalOrder = new NFA(orderMachine, 'canonical-snake-order', ...label.at(gridCells));

// --- Drawn partial reveals --------------------------------------------------
// Grey line segments drawn in the grid: each joins two cells shown as
// consecutive on some snake, so they share one (unknown) label.
const sameSnakeKey = Pair.fnToKey((a, b) => a === b && a !== NONE, numValues);
const REVEALED_SEGMENTS = [['R2C3', 'R3C3'], ['R1C6', 'R2C7'], ['R8C2', 'R9C3']];
const revealed = REVEALED_SEGMENTS.map(([x, y]) =>
  new Pair(sameSnakeKey, 'revealed-snake-segment', label.at(x), label.at(y)));

// --- Givens ------------------------------------------------------------
// Transcribed from the drawn grid.
const givens = [
  ['R3C1', 3], ['R3C2', 4], ['R3C4', 6],
  ['R4C1', 6], ['R4C3', 4], ['R4C5', 7], ['R4C8', 3],
  ['R5C1', 5], ['R5C2', 8], ['R5C3', 7], ['R5C5', 6], ['R5C7', 9], ['R5C9', 1],
  ['R6C2', 9], ['R6C3', 3], ['R6C5', 2], ['R6C7', 7], ['R6C9', 4],
  ['R7C1', 4], ['R7C2', 7], ['R7C4', 3], ['R7C7', 1], ['R7C9', 8],
  ['R8C8', 9],
].map(([cell, value]) => new Given(cell, value));

return [
  shape,
  ...givens,
  label.toVar('snake label'),
  domain,
  ...snakeCells,
  ...products,
  canonicalOrder,
  ...revealed,
];
