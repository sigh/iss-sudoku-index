// Title: Dynamic Chaos
// Author: gdc
// Video: https://www.youtube.com/watch?v=hQVmN8yupLw
// Source: https://beta.sudokupad.app/xgn9g0d94r

// Chaos Construction: the solver deduces nine orthogonally-connected 9-cell
// regions (rows/columns keep their normal all-different rule; boxes are
// dropped since the discovered regions replace them). No givens. Dynamic Fog
// is solving UI only and is not encoded.
//
// Squares: a grey-square cell's digit equals the sum of its up-to-8
// king-move neighbours whose region differs from its own.
//
// CC Kropki Pairs: white-dot cells differ by 1 and share a region.
//
// CC Successor Arrows: a digit N on a directional arrow counts the run of
// cells (including itself) sharing its own region looking one way, blocked
// by the first region border; N+1 must be the digit immediately past that
// border. ChaosArrow(cell, 0, arm) natively enforces the run-length half of
// this ("offset 0" because the count includes the arrow's own cell); the
// "N+1 past the border" half has no native class, so each arrow also gets a
// custom NFA reading (region, digit) pairs along the same ray.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Squares: sum of king-neighbour digits lying in a different region.
// Cell list from the drawn grey-square markers.
const SQUARES = ['R2C2', 'R3C2', 'R9C4', 'R9C7', 'R5C9'];

// White dots (consecutive + same region). Cell pairs from the drawn dots.
const DOTS = [
  ['R3C7', 'R3C8'],
  ['R5C6', 'R6C6'],
  ['R6C9', 'R7C9'],
];

// Successor arrows: [cell, [dRow, dCol]]. Directions read from each arrow's
// drawn chevron.
const ARROWS = [
  ['R1C6', [0, -1]],  // left
  ['R5C1', [-1, 0]],  // up
  ['R1C2', [0, -1]],  // left
  ['R8C3', [-1, 0]],  // up
  ['R7C4', [0, -1]],  // left
  ['R9C6', [0, -1]],  // left
  ['R2C5', [1, 0]],   // down
  ['R8C7', [0, -1]],  // left
];

// Reads [region(cell0), digit(cell0), region(cell1), digit(cell1), ...] for
// an ordered cell list.
const regionDigitStream = (cells) => {
  const regions = cc.at(cells);
  return cells.flatMap((cell, i) => [regions[i], cell]);
};

// Successor-arrow NFA. Stages cycle originRegion -> originValue -> then
// cellRegion/cellValue per further ray cell. `base` is the arrow cell's own
// region, `target` is its digit N. While a ray cell's region still matches
// `base` the run continues; the first cell whose region differs is the
// border, and the value read right after it (the same cell's own digit, via
// the paired cellValue read) must equal target+1. Ending the ray while still
// mid-run (no `done`) is a reject: every arrow must see a border in-grid.
const successorSpec = {
  startState: { stage: 'originRegion' },
  transition(state, value) {
    const { stage, base, target, sameRegion, done } = state;
    if (done) return { done: true };
    if (stage === 'originRegion') return { stage: 'originValue', base: value };
    if (stage === 'originValue') return { stage: 'cellRegion', base, target: value };
    if (stage === 'cellRegion') {
      return { stage: 'cellValue', base, target, sameRegion: value === base };
    }
    // stage === 'cellValue'
    if (sameRegion) return { stage: 'cellRegion', base, target };
    if (value !== target + 1) return undefined;
    return { done: true };
  },
  accept: (state) => !!state.done,
};
const successorNFA = NFA.encodeSpec(successorSpec, 9);

const arrows = ARROWS.flatMap(([cell, [dr, dc]]) => {
  const ray = graph.ray(cell, dr, dc);
  return [
    new ChaosArrow(cell, 0, cc.at(ray)),
    new NFA(successorNFA, 'Successor', ...regionDigitStream(ray)),
  ];
});

// Squares NFA. Reads the square's own digit (`target`) and region (`base`),
// then (region, digit) for each king-move neighbour; each neighbour whose
// region differs from `base` adds its digit to a running sum, clamped at
// target+1 once it can only fail. Final state must land back at `nRegion`
// (i.e. a whole number of neighbours consumed) with sum === target.
const squareSpec = {
  startState: { stage: 'target' },
  transition(state, value) {
    const { stage, target, base, sum, pendingDiffer } = state;
    if (stage === 'target') return { stage: 'base', target: value };
    if (stage === 'base') return { stage: 'nRegion', target, base: value, sum: 0 };
    if (stage === 'nRegion') {
      return { stage: 'nValue', target, base, sum, pendingDiffer: value !== base };
    }
    // stage === 'nValue'
    const added = pendingDiffer ? value : 0;
    return { stage: 'nRegion', target, base, sum: Math.min(sum + added, target + 1) };
  },
  accept: (state) => state.stage === 'nRegion' && state.sum === state.target,
};
const squareNFA = NFA.encodeSpec(squareSpec, 9);

const squares = SQUARES.map((cell) => {
  const neighbours = graph.kingNeighbours(cell);
  return new NFA(
    squareNFA, 'Square', cell, cc.at(cell), ...regionDigitStream(neighbours));
});

const dots = DOTS.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new SameValues(2, cc.at(a), cc.at(b)),
]);

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...arrows,
  ...squares,
  ...dots,
];
