// Title: Star Python 2
// Author: Peter C. Hayward
// Video: https://www.youtube.com/watch?v=V9YepvtApnE
// Source: https://app.crackingthecryptic.com/sudoku/mM7rgHLjHD

// Sudoku rules apply: 1-9 once each in every row, column, and the 9 irregular
// (jigsaw) regions drawn in the payload -- there are no standard 3x3 boxes.
// Additionally: the digits 1 and 9 may not be within a king's move of
// themselves or each other -- any two king-adjacent cells cannot both hold a
// digit from {1, 9} (this also covers the orthogonal case, which plain row/
// column all-different does not already give for a *cross* pair like 1
// next to 9). The grid contains a 1-cell-wide "python": a path of
// orthogonally-connected cells, not branching, that does not touch itself
// even diagonally, beginning at the given red 1 (R6C7). Every 1 and 9 in the
// grid is part of the python (the converse does not hold -- other digits may
// also lie on it). Blue-shaded cells cannot be part of the python; not every
// possible blue cell is drawn, so this is a "some cells are marked off"
// clause, not an exhaustive one. No blue cell in this payload carries a
// printed count of surrounding python cells (checked: none of the 15 drawn
// blue cells carries a digit), so that half of the rule has no instances to
// encode here.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Jigsaw regions -- transcribed from the payload's 9 drawn irregular region
// outlines. Confirmed to be an exact partition of all 81 cells.
const JIGSAW_REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C2', 'R3C3', 'R4C3', 'R5C3'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R1C4', 'R1C5', 'R1C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C8', 'R3C9', 'R4C9'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R4C5', 'R5C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R3C6', 'R3C7', 'R4C7', 'R4C8', 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C9'],
  ['R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C8', 'R8C8', 'R8C9', 'R9C9'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C5', 'R8C6', 'R8C7'],
  ['R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C2', 'R5C2', 'R4C2', 'R4C1', 'R3C1'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C2', 'R9C1'],
];
const jigsaw = JIGSAW_REGIONS.map(cells => new Jigsaw('9x9', ...cells));

// Two given digits are drawn: R4C5=7 (plain given) and R6C7=1 (the red
// python-start cell).
const START = 'R6C7';
const givens = [
  new Given('R4C5', 7),
  new Given(START, 1),
];

// Blue-shaded cell positions, as drawn.
const BLUE_CELLS = [
  'R5C7', 'R1C9', 'R2C9', 'R2C7', 'R3C7', 'R4C7', 'R4C8', 'R7C8', 'R8C8',
  'R8C4', 'R9C2', 'R7C2', 'R5C1', 'R2C3', 'R2C5',
];

// --- Python membership layer: ON/OFF Var per cell (nordschleife pattern). ---
const python = graph.makeOverlay('VP');
const gridCells = graph.cells();
const originCell = python.cells()[0];
const membership = [
  // Restrict every python Var cell's domain to {ON, OFF}.
  python.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(python.at(START), ON),
  ...python.at(BLUE_CELLS).map(cell => new Given(cell, OFF)),
];

// --- Every 1 and 9 must be on the python (one-directional implication; other
// digits are free to be on or off it). ---
const digitImpliesOnKey = Pair.fnToKey(
  (digit, member) => !((digit === 1 || digit === 9) && member === OFF), 9);
const digitImpliesOn = gridCells.map(cell =>
  new Pair(digitImpliesOnKey, 'python-includes-1-9', cell, python.at(cell)));

// --- Degree <=2 under orthogonal adjacency: an on-cell's on-neighbour count
// never exceeds 2, so it cannot branch and cannot touch itself orthogonally
// (a same-row/column stray touch would push some cell's count past 2). Off
// cells are unconstrained. (Adapted from nordschleife.js, relaxed from
// exactly-2 to at-most-2 since the python is a path, not a closed loop.)
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, member) => {
    if (phase === 'start') {
      return member === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (member === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase }) => phase === 'off' || phase === 'on',
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...python.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on cells are a
// diagonal pair (nordschleife pattern, unchanged for a path). ---
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, member) => {
    if (block === null) return { block: null };
    const next = [...block, member === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template (anchored at the grid's own first cell) shifted to every
// valid 2x2 top-left, instead of 64 separately-authored NFA instances.
const noTouchOrigin = gridCells.find(cell => graph.block(cell, 2, 2));
const noTouchTargets = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = python.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...python.at(graph.block(noTouchOrigin, 2, 2))),
  python.at(noTouchTargets));

// --- Single path, not a cycle: the on cells are one connected orthogonal
// region (ConnectedValues) with every on-cell degree <=2 above; a connected
// graph with max degree 2 is a disjoint union of one path or one cycle, and a
// cycle has no degree-1 vertex, so forcing the start cell's degree to exactly
// 1 (its rules-text "beginning") rules out the cycle and leaves a single
// simple path. START's Var domain is only {ON, OFF}, so "exactly one ON
// neighbour" needs no explicit OFF count for the rest.
const startDegreeOne = new ContainExact(
  String(ON), ...python.at(graph.neighbours(START)));

// --- Restricted anti-king: no king-adjacent pair may both hold a digit from
// {1, 9}. Row/column all-different already forbids a repeated *same* digit on
// an orthogonal step, but not a differing cross pair like 1 next to 9, so all
// 4 forward king directions (covering every king edge exactly once, as
// nordschleife's `multiples` covers each orthogonal edge once) are needed --
// not just the 2 diagonal deltas a same-value AntiKing would use.
// One Replicate template per direction (each anchored at that direction's
// own first valid cell, not necessarily R1C1), instead of up to ~72
// separately-authored Pairs per direction.
const restrictedKingKey = Pair.fnToKey(
  (a, b) => !((a === 1 || a === 9) && (b === 1 || b === 9)), 9);
const KING_DIRS = [[0, 1], [1, -1], [1, 0], [1, 1]];
const antiKing19 = KING_DIRS.map(([dRow, dCol]) => {
  const targets = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = targets[0];
  const template = new Pair(
    restrictedKingKey, 'anti-king-1-9', origin, graph.step(origin, dRow, dCol));
  return new Replicate(
    [template], Replicate.encodeTargetCells(targets, origin, graph), origin);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsaw,
  python.toVar('python'),
  ...givens,
  ...membership,
  new ConnectedValues('VP', ON),
  ...degrees,
  startDegreeOne,
  noDiagonalTouches,
  ...antiKing19,
  ...digitImpliesOn,
];
