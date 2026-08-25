// Title: The Snake Nest
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=FDWJR8ITSJc
// Source: https://app.crackingthecryptic.com/webapp/LJQfd6G3JQ

// Rules encoded here:
//  - Normal sudoku.
//  - The 8 givens.
//  - Snake eggs: the non-snake cells form exactly 8 orthogonally-connected
//    regions, one of each size 1-8, each containing digits 1..n exactly once
//    (n = its size), no two eggs orthogonally touching. Each given is, by the
//    rule, the highest digit of its own egg -- since the 8 givens are exactly
//    the values 1-8 once each, a given's own value already names both which
//    egg it anchors and that egg's size, with no correspondence left open.
//  - Snake-cell area: a single orthogonally-connected region (the "snakes
//    connect to each other"), with no 2x2 block entirely snake cells.
//
// Omitted: the decomposition of that snake-cell area into an unknown number
// of individual snakes, each self-avoiding (no orthogonal self-touch, only
// consecutive path cells adjacent) while different snakes may freely touch
// or cross orthogonally, plus each snake's head/tail digit match. No known
// ISS construction covers an unknown-count decomposition into self-avoiding
// paths sharing a discovered, jointly-connected union.

const graph = cellGraph('9x9');

// One label per cell: 1-8 marks an egg (the label value is that egg's own
// size), 9 marks a snake cell. A full-grid overlay keeps the grid's own 1-9
// value range, which is exactly the 9 labels needed -- no widened Shape.
const label = graph.makeOverlay('VL');
const SNAKE = 9;

// The 8 givens, read from the payload: R2C1=6 R2C3=7 R2C8=2 R3C7=3 R4C8=4
// R7C3=8 R8C7=5 R9C5=1. Each value is also its own egg's size and label.
const GIVENS = [
  ['R2C1', 6], ['R2C3', 7], ['R2C8', 2], ['R3C7', 3],
  ['R4C8', 4], ['R7C3', 8], ['R8C7', 5], ['R9C5', 1],
];

const givenDigits = GIVENS.map(([cell, value]) => new Given(cell, value));
// Anchor each given cell into its own egg's label -- the given's value fixes
// both which egg and that egg's size, so no disjunction over the pairing is
// needed.
const anchorLabels = GIVENS.map(
  ([cell, value]) => new Given(label.at(cell), value));

// Each egg is a single connected region of exactly `size` cells (the `size`
// argument of ConnectedValues asserts the cell count, not just connectivity).
const eggConnectivity = Array.from(
  { length: 8 }, (_, i) => new ConnectedValues('VL', i + 1, i + 1));
// The snake area is a single connected region; its size (81 - 36 = 45) is
// already forced once every egg's size is fixed, so no size argument here.
const snakeConnectivity = new ConnectedValues('VL', SNAKE);

// Eggs must not touch orthogonally: adjacent cells may not carry two
// different non-snake labels. (Same-label adjacency is how an egg's own
// cells connect; snake cells touch anything freely.) One template per
// offset (right, down), stamped onto every cell with an in-grid neighbour at
// that offset via Replicate.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === SNAKE || b === SNAKE || a === b, 9);
const eggNoTouch = [[0, 1], [1, 0]].map(([dr, dc]) => {
  const gridTargets = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const gridOrigin = gridTargets[0];
  const gridOther = graph.step(gridOrigin, dr, dc);
  const targets = label.at(gridTargets);
  const origin = label.at(gridOrigin);
  const other = label.at(gridOther);
  return new Replicate(
    [new Pair(noTouchKey, 'egg-no-touch', origin, other)],
    Replicate.encodeTargetCells(targets, origin, label),
    origin,
  );
});

// No 2x2 block is entirely snake cells: at least one of its 4 cells must
// carry an egg label (1-8).
const noFullSnake2x2 = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const block = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ];
    noFullSnake2x2.push(new Or(
      block.map(cell => new Given(label.at(cell), 1, 2, 3, 4, 5, 6, 7, 8))));
  }
}

// Egg content: for a fixed egg size k, scan every cell's [label, digit] pair
// in turn. Track `matched` (this cell's label is k) and `seen`, the bitmask
// of digits already used by a label-k cell so far. A label-k cell must hold
// a digit in 1..k not already used; other cells are unconstrained here. With
// ConnectedValues above already pinning the region to exactly k cells, no
// repeats within k distinct values in 1..k forces the digit set to be
// exactly 1..k -- no separate coverage check is needed.
const eggContentSpec = (k) => NFA.encodeSpec({
  startState: { phase: 'label', seen: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { phase: 'digit', seen: state.seen, matched: value === k };
    }
    if (!state.matched) return { phase: 'label', seen: state.seen };
    if (value > k) return undefined;
    const bit = 1 << (value - 1);
    if (state.seen & bit) return undefined;
    return { phase: 'label', seen: state.seen | bit };
  },
  accept: (state) => state.phase === 'label',
}, 9);

const gridCells = graph.cells();
const labelDigitSeq = gridCells.flatMap(cell => [label.at(cell), cell]);
const eggContent = Array.from({ length: 8 }, (_, i) => new NFA(
  eggContentSpec(i + 1), 'egg-content', ...labelDigitSeq));

return [
  new Shape('9x9'),
  label.toVar('EggLabel'),
  ...givenDigits,
  ...anchorLabels,
  ...eggConnectivity,
  snakeConnectivity,
  ...eggNoTouch,
  ...noFullSnake2x2,
  ...eggContent,
];
