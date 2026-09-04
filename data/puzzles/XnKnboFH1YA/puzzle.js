// Title: Egg-Sighting
// Author: Nordy
// Video: https://www.youtube.com/watch?v=XnKnboFH1YA
// Source: https://app.crackingthecryptic.com/sudoku/23BhrPf6Q9

// Not a Sudoku: no row/column/box distinctness at all, so the grid is Raw.
// Shade a 1-cell-wide, non-branching, non-looping snake that does not touch
// itself orthogonally (may touch diagonally); one end is the drawn white
// circle, the other end is undrawn. The remaining cells split into ten
// distinct orthogonally-connected areas, sizes 1-10 one each, and two
// orthogonally-adjacent non-snake cells must belong to the same area (the
// rule's "areas of different sizes do not touch orthogonally"). Diagonal
// touching between different areas, and between the snake and any area, is
// unrestricted.
//
// Cell value encoding (this encoding's own alphabet, not the puzzle's "write
// the area size, 0 for size 10" app convention): 1-10 on a non-snake cell is
// its area's size; 11/12 mark a snake cell, split into two sub-values so the
// degree rule below can tell an endpoint from an interior cell.
const SIZE_MAX = 10;
const SNAKE_BODY = 11;   // interior snake cell: exactly two on-snake neighbours
const SNAKE_END = 12;    // endpoint snake cell: exactly one on-snake neighbour

const shape = new Shape('12x10', SNAKE_END, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

// Numeric givens: cell's area size (payload per-cell `value`).
const sizeGivens = [
  [2, 3, 1],
  [2, 6, 4],
  [4, 2, 2],
  [6, 4, 5],
].map(([r, c, size]) => new Given(makeCellId(r, c), size));

// '?' overlays: confirmed non-snake, size not given (payload `overlays`).
const nonSnakeValues = Array.from({ length: SIZE_MAX }, (_, i) => i + 1);
const unknownSizeGivens = [[7, 2], [11, 9]]
  .map(([r, c]) => new Given(makeCellId(r, c), ...nonSnakeValues));

// White circle: the one drawn snake end (payload `underlays`).
const snakeEndGiven = new Given(makeCellId(10, 3), SNAKE_END);

// One connected region of exactly `size` cells per area size, labelled by
// that same size -- the multiset of areas (1..10, pairwise distinct) is
// fixed by the rules, so each size can anchor its own ConnectedValues.
const sizeRegions = nonSnakeValues.map(
  size => new ConnectedValues('', size, size));

// The snake itself is the other single connected region on this layer.
const snakeConnected = new ConnectedValues('', [SNAKE_BODY, SNAKE_END]);

// Exactly two snake-endpoint cells in the whole grid (one is the white
// circle above; the other is wherever the solver finds it).
const snakeEndsCount = new ContainExact(
  `${SNAKE_END}_${SNAKE_END}`, ...gridCells);

// Degree rule closing the snake into a single non-branching, non-looping,
// orthogonally-non-self-touching path: a SNAKE_END cell must have exactly one
// snake neighbour (value > SIZE_MAX), a SNAKE_BODY cell exactly two: non-snake
// cells are unconstrained ('off'). Combined with snakeConnected (one
// component) this admits only a simple path, per the no-self-touch route
// model (a stray disjoint loop would satisfy the degree count alone).
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, target, count }, value) => {
    if (phase === 'start') {
      if (value <= SIZE_MAX) return { phase: 'off' };
      return { phase: 'on', target: value === SNAKE_END ? 1 : 2, count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value > SIZE_MAX ? 1 : 0);
    return next > target ? undefined : { phase: 'on', target, count: next };
  },
  accept: ({ phase, target, count }) => phase === 'off' || count === target,
}, numValues);

// A flat-index (row-major) shift by a constant delta translates a cell and
// its 4-neighbour references consistently only while it never crosses a row
// boundary -- true for any interior-to-interior shift (row 2..numRows-1, col
// 2..numCols-1), since +-1 stays in-row and +-numCols stays in-column there.
// One Replicate covers the 80-cell interior template that way; edge and
// corner cells (fewer than 4 neighbours, too few to share one shape at any
// useful count) keep their own individually-built NFA.
const { numRows, numCols } = graph.gridGeometry();
const interiorCells = [];
for (let r = 2; r <= numRows - 1; r++) {
  for (let c = 2; c <= numCols - 1; c++) interiorCells.push(makeCellId(r, c));
}
const interiorOrigin = interiorCells[0];
const interiorDegree = new Replicate(
  [new NFA(degreeMachine, 'degree',
    interiorOrigin, ...graph.neighbours(interiorOrigin))],
  Replicate.encodeTargetCells(interiorCells, interiorOrigin, graph),
  interiorOrigin);
const interiorSet = new Set(interiorCells);
const borderDegrees = gridCells
  .filter(cell => !interiorSet.has(cell))
  .map(cell => new NFA(degreeMachine, 'degree', cell, ...graph.neighbours(cell)));

// Adjacent non-snake cells must share an area (a differing pair would be two
// differently-sized areas touching orthogonally); either cell being on the
// snake (value > SIZE_MAX) frees the pair. Every horizontal edge (a cell and
// its right neighbour) shares one relative offset and every vertical edge
// (a cell and its neighbour below) shares the other, so each direction is one
// Replicate over every cell that has that neighbour, rather than one Pair per
// edge -- the same edge set as "one step per cell, right and down only".
const sameAreaKey = Pair.fnToKey(
  (a, b) => a === b || a > SIZE_MAX || b > SIZE_MAX, numValues);
const rightEdgeOrigin = makeCellId(1, 1);
const rightEdgeCells = [];
for (let r = 1; r <= numRows; r++) {
  for (let c = 1; c <= numCols - 1; c++) rightEdgeCells.push(makeCellId(r, c));
}
const rightEdgeAdjacency = new Replicate(
  [new Pair(sameAreaKey, 'same-area',
    rightEdgeOrigin, graph.step(rightEdgeOrigin, 0, 1))],
  Replicate.encodeTargetCells(rightEdgeCells, rightEdgeOrigin, graph),
  rightEdgeOrigin);
const downEdgeOrigin = makeCellId(1, 1);
const downEdgeCells = [];
for (let r = 1; r <= numRows - 1; r++) {
  for (let c = 1; c <= numCols; c++) downEdgeCells.push(makeCellId(r, c));
}
const downEdgeAdjacency = new Replicate(
  [new Pair(sameAreaKey, 'same-area',
    downEdgeOrigin, graph.step(downEdgeOrigin, 1, 0))],
  Replicate.encodeTargetCells(downEdgeCells, downEdgeOrigin, graph),
  downEdgeOrigin);

return [
  shape,
  ...sizeGivens,
  ...unknownSizeGivens,
  snakeEndGiven,
  ...sizeRegions,
  snakeConnected,
  snakeEndsCount,
  interiorDegree,
  ...borderDegrees,
  rightEdgeAdjacency,
  downEdgeAdjacency,
];
