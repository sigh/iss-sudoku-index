// Title: Castle Wall by Prasanna Seshadri
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=cfn1gXSf7fg
// Source: https://tinyurl.com/ryngldp

// Draw a single closed loop along grid edges, with no self-touch or crossing.
// Each cell is IN (enclosed by the loop) or OUT; there are no sudoku digits,
// so this is built on a Raw shape carrying only the IN/OUT side per cell.
// iss_solution is the 100-cell (10x10) IN/OUT grid, not a digit grid.
//
// Shaded cells are always OUT and never on the loop; no heavy-border (forced
// IN) cells are drawn. Unshaded numbered cells are free -- solver-decided IN
// or OUT. A numbered cell counts the loop's border crossings from itself to
// the grid's edge, in the direction its clue names: R2C9=6 left, R3C4=1 up,
// R3C5=0 left, R4C7=1 left, R5C9=1 up, R6C2=1 down, R7C4=1 right, R8C6=0
// right, R8C7=1 down, R9C2=6 right.

const IN = 1;
const OUT = 2;
// CONCAVE (below) is a third code no grid cell ever takes; corner points need
// it, so the shape is widened to 3 values and every grid cell is restricted
// back to {IN, OUT}.
const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

const sideDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// Clue table: [cell, direction, target, isBlack], read off the drawn cell
// shading and printed numbers.
const CLUES = [
  ['R2C9', 'left', 6, true],
  ['R3C4', 'up', 1, false],
  ['R3C5', 'left', 0, false],
  ['R4C7', 'left', 1, true],
  ['R5C9', 'up', 1, false],
  ['R6C2', 'down', 1, true],
  ['R7C4', 'right', 1, false],
  ['R8C6', 'right', 0, true],
  ['R8C7', 'down', 1, true],
  ['R9C2', 'right', 6, false],
];
// Shaded cells with no printed clue: forced OUT, no ray to encode.
const BLACK_NO_CLUE = ['R5C2', 'R5C3'];

const rayCells = (row, col, dir) => {
  const cells = [];
  if (dir === 'up') for (let r = row - 1; r >= 1; r--) cells.push(makeCellId(r, col));
  else if (dir === 'down') for (let r = row + 1; r <= 10; r++) cells.push(makeCellId(r, col));
  else if (dir === 'left') for (let c = col - 1; c >= 1; c--) cells.push(makeCellId(row, c));
  else if (dir === 'right') for (let c = col + 1; c <= 10; c++) cells.push(makeCellId(row, c));
  return cells;
};

// A border-crossing count: the lane starts at the clue cell itself, whose
// IN/OUT side seeds `prev` with no count on that first read (adjacent-relation
// scan pattern), then counts a crossing each time the next position differs
// from the last one, out to the grid's edge.
const makeCrossingMachine = target => NFA.encodeSpec({
  startState: { count: 0, prev: null },
  transition: ({ count, prev }, value) => {
    if (prev === null) return { count, prev: value };
    const hit = value !== prev ? 1 : 0;
    return { count: Math.min(count + hit, target + 1), prev: value };
  },
  accept: ({ count }) => count === target,
}, numValues);

const blackGivens = [
  ...CLUES.filter(c => c[3]).map(c => new Given(c[0], OUT)),
  ...BLACK_NO_CLUE.map(c => new Given(c, OUT)),
];

const crossingConstraints = CLUES.map(([cell, dir, target]) => {
  const { row, col } = parseCellId(cell);
  const lane = [cell, ...rayCells(row, col, dir)];
  return new NFA(makeCrossingMachine(target), `crossing ${cell} ${dir}=${target}`, ...lane);
});

// --- Single loop: connected IN region, no hole, no self-touch --------------
// Standard corner-classification trick (edge loop as a side overlay): a
// lattice corner is convex/plain/concave by how many of its (up to 4) cells
// are IN -- treating an off-grid cell as OUT -- and forbidding the diagonal
// 2-2 split at a true 2x2 corner rules out the loop crossing/touching itself.
// With the IN region connected, (convex - concave) = 4 forces exactly one
// hole-free loop; that sum is realised as 2*(corner count) - 4 over corner
// codes 1/2/3 -- see the Sum below.
const CONVEX = 1, PLAIN = 2, CONCAVE = 3;
const corner = cellGraph('11x11').makeOverlay('VC');
const cornerAt = (row, col) => corner.cells()[row * 11 + col];

const cornerClass = inCount => (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

const cornerMachine = (arity, checkDiagonal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === -1) return undefined;
    if (state.i === 0) return { i: 1, code: value, seen: [] };
    const seen = [...state.seen, value === IN];
    if (seen.length < arity) return { i: state.i + 1, code: state.code, seen };
    if (checkDiagonal) {
      const [topLeft, topRight, bottomLeft, bottomRight] = seen;
      if ((topLeft && bottomRight && !topRight && !bottomLeft)
        || (topRight && bottomLeft && !topLeft && !bottomRight)) return undefined;
    }
    return state.code === cornerClass(seen.filter(Boolean).length)
      ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, numValues);
const cornerMachines = new Map([2, 4].map(
  arity => [arity, cornerMachine(arity, arity === 4)]));
const gridCornerKey = Pair.fnToKey(
  (code, sv) => code === cornerClass(sv === IN ? 1 : 0), numValues);

const cornerCells = [];
const cornerCodes = [];
for (let row = 0; row <= 10; row++) {
  for (let col = 0; col <= 10; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= 10 && c >= 1 && c <= 10)
      .map(([r, c]) => makeCellId(r, c));
    cornerCells.push(cornerAt(row, col));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner',
        cornerAt(row, col), ...around));
  }
}

const singleLoop = [
  new ConnectedValues('', IN),
  new Sum(2 * cornerCells.length - 4, ...cornerCells),
];

return [
  shape,
  sideDomain,
  corner.toVar('loop corner type'),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),
  ...cornerCodes,
  ...singleLoop,
  ...blackGivens,
  ...crossingConstraints,
];
