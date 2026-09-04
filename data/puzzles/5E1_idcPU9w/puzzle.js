// Title: Snake Egg
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=5E1_idcPU9w
// Source: https://sudokupad.app/fDrRP46trL

// No sudoku layer: draw a 1-cell-wide snake from a given head to a given tail
// cell (rounded circle overlays, no digit). The snake may touch itself
// diagonally but not orthogonally, and cannot revisit a cell. Every cell not
// on the snake belongs to one of exactly nine orthogonally-connected white
// areas, sized 1 through 9 with no size repeated. A given digit must lie in
// the white area of that size.
//
// Modelling choice: rather than a separate region-label overlay, every white
// cell's own grid value IS its area's size (this is also literally the
// source's solution-check convention -- see the payload's parenthetical
// remark). A snake cell instead holds the marker value SNAKE, standing in
// for the source's "unfilled" `.`. Sizes 1-9 plus SNAKE is 10 values, one
// more than the board's own 9 real digits, so the grid is widened to 11 and
// value 10 is never used -- excluded per-cell below -- purely so ISS's
// letter-valued short form (and this pipeline's '.'-conversion of it) can
// tell the marker apart from a real digit that happens to reach the board's
// own dimension.

const SNAKE = 11;
const REAL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('10x10', SNAKE, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Head/tail circles (overlays: center [5.5,0.5] and [6.5,1.5], i.e. 0-indexed
// row/col -> R6C1 and R7C2).
const ends = [makeCellId(6, 1), makeCellId(7, 2)];

// Numeric givens: R4C8=1, R6C3=2, R9C7=8.
const numberGivens = [
  [makeCellId(4, 8), 1],
  [makeCellId(6, 3), 2],
  [makeCellId(9, 7), 8],
].map(([cell, value]) => new Given(cell, value));

// --- Domain: every cell is a white-area size (1-9) or the snake (SNAKE).
// Value 10 is part of the widened alphabet but never a legal cell value.
// One template Given, Replicated onto every cell (including the ones pinned
// below): Given merges by cell, so the narrower pins still win.
const domain = graph.makeReplicate(new Given(gridCells[0], ...REAL_DIGITS, SNAKE), gridCells);

// --- Fixed clues: the two ends are on the snake.
const endGivens = ends.map(cell => new Given(cell, SNAKE));

// --- Degree machine: a snake cell counts its orthogonally-adjacent snake
// neighbours; an off-snake (white) cell is unconstrained. Reads the cell's
// own value, then each neighbour's. `targetDegree` is 1 at the two given
// ends (a path endpoint) and 2 everywhere else (an ordinary path cell) --
// this is exactly what forbids branching, forbids an orthogonal self-touch
// (any such touch would push some cell's degree past its target), and
// (being a plain membership model, not a sequence) makes revisiting a cell
// unrepresentable in the first place.
const degreeMachine = targetDegree => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === SNAKE ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === SNAKE ? 1 : 0);
    return count > targetDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === targetDegree,
}, geometry.numValues);

const endDegreeMachine = degreeMachine(1);
const bodyDegreeMachine = degreeMachine(2);
const endSet = new Set(ends);

// Fixed up/down/left/right order (rather than graph.neighbours()'s own
// order) so that every interior cell's argument list is a uniform shift of
// its neighbours -- required below to Replicate the interior body-degree
// copies, which all share this same 4-neighbour shape.
const ORTHOGONAL = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const orderedNeighbours = cell => ORTHOGONAL
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(c => c !== null);
const isInterior = cell => orderedNeighbours(cell).length === 4;

// The 63 interior cells needing an ordinary (non-end) degree-2 check share
// one 5-cell template (self + 4 neighbours); Replicate it instead of
// stamping 63 near-identical NFAs by hand.
const interiorBody = gridCells.filter(cell => isInterior(cell) && !endSet.has(cell));
const interiorBodyOrigin = interiorBody[0];
const interiorBodyTemplate = new NFA(bodyDegreeMachine, 'body-degree',
  interiorBodyOrigin, ...orderedNeighbours(interiorBodyOrigin));
const interiorBodyDegree = new Replicate(
  [interiorBodyTemplate],
  Replicate.encodeTargetCells(interiorBody, interiorBodyOrigin, graph),
  interiorBodyOrigin);

// The remaining body-degree cells (board edges and corners: 2 or 3
// neighbours, several distinct shapes, each too small a group to bother
// Replicating) and the two end cells (degree 1) are stamped directly.
const interiorBodySet = new Set(interiorBody);
const otherDegrees = gridCells
  .filter(cell => !endSet.has(cell) && !interiorBodySet.has(cell))
  .map(cell => new NFA(bodyDegreeMachine, 'body-degree', cell, ...orderedNeighbours(cell)));
const endDegrees = ends.map(cell => new NFA(endDegreeMachine, 'end-degree',
  cell, ...orderedNeighbours(cell)));

// --- Single snake: the SNAKE cells form one orthogonally-connected region.
// Size 55 is a plain arithmetic fact (100 cells - the 45 forced by the nine
// white-area sizes below), not a derived answer -- combined with the degree
// machine above (2-regular except the two given degree-1 ends) this forces
// exactly one simple path from end to end, excluding any separate stray loop
// the local degree checks alone would miss.
const snakeConnected = new ConnectedValues('', SNAKE, 55);

// --- Nine white areas, sizes 1-9, no repeats: label each region by its own
// size, since the multiset of sizes is fixed and pairwise distinct.
// ConnectedValues(L, L) forces exactly one connected area of exactly L cells
// holding value L, for every L in 1-9 -- which is "one area of each size"
// directly, with no separate label layer needed since the size digit and the
// displayed digit coincide.
const whiteAreas = REAL_DIGITS.map(size => new ConnectedValues('', size, size));

return [
  shape,
  domain,
  ...endGivens,
  ...numberGivens,
  interiorBodyDegree,
  ...otherDegrees,
  ...endDegrees,
  snakeConnected,
  ...whiteAreas,
];
