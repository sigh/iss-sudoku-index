// Title: Castle Wall by Ken Endo
// Author: Ken Endo
// Video: https://www.youtube.com/watch?v=cfn1gXSf7fg
// Source: https://tinyurl.com/uayep59

// Draw a single closed loop along grid edges, with no self-touch or
// crossing. Each cell is IN (enclosed by the loop) or OUT; the space beyond
// the grid's border is OUT. There are no sudoku digits: the grid carries
// only this IN/OUT side per cell, so it is built on a Raw shape.
// iss_solution is the 100-cell (10x10) IN/OUT grid, not a digit grid.
//
// Row 1 and column 1 hold 19 shaded (grey) cells; every one but R1C1 carries
// a printed number, one per row (R2..R10) and one per column (C2..C10). The
// rules describe black/white/grey shaded cells as forced outside/inside/
// either the loop; none of these 19 are drawn differently from one another
// (no heavy border, so no white cells; a single uniform shading, not two
// distinguishable colours), so all 19 are read as grey -- IN or OUT is free,
// exactly as printed for an ordinary cell.
//
// Each clue counts border crossings starting at its own (grey) cell and
// scanning straight into the grid to the far edge: down the clue's own
// column for a row-1 clue, right along the clue's own row for a column-1
// clue. No arrow is drawn; every other direction from a border cell is
// degenerate (either off the grid, or back along row 1/column 1, which is
// all other clue cells and never varies), so straight-into-the-grid is the
// only reading the clue table is consistent with (the printed values are
// non-zero and vary).
//
// A "border crossed" is a boundary between two orthogonally adjacent,
// same-lane cells whose IN/OUT sides differ -- that boundary is exactly
// where the loop runs.

const IN = 1;
const OUT = 2;
// CONCAVE (below) is a third code the 100 grid cells never take; corner
// cells need it, so the shape is widened to 3 values and every grid cell is
// restricted back to {IN, OUT}.

const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();
const rows = graph.rows();       // rows[i] = row i+1, left to right
const columns = graph.columns(); // columns[i] = column i+1, top to bottom

const sideDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// Clue tables, from the source's border ring: column clues above C2..C10,
// row clues left of R2..R10.
const colClues = [1, 2, 4, 6, 1, 2, 5, 2, 3];
const rowClues = [1, 4, 3, 6, 1, 2, 5, 2, 2];

// --- Single loop: connected IN region, no hole, no self-touch --------------
// Standard corner-classification trick: a lattice corner is convex/plain/
// concave by how many of its (up to 4) cells are IN -- treating an off-grid
// cell as OUT -- and forbidding the diagonal 2-2 split at a true 2x2 corner
// rules out the loop crossing/touching itself. With the IN region connected,
// (convex - concave) = 4 forces exactly one hole-free loop; that sum is
// realised as 2*(corner count) - 4 over corner codes 1/2/3 -- see the Sum
// below.
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

// --- Border-crossing count clues: reads a full lane (clue cell first, then
// the 9 cells inward to the far edge) and counts a crossing each time two
// consecutively-read cells differ. The target is baked into the machine per
// clue, clamped at target+1 so the state stays bounded.
const makeCrossingMachine = target => NFA.encodeSpec({
  startState: { started: false, prev: null, count: 0 },
  transition: ({ started, prev, count }, value) => {
    if (!started) return { started: true, prev: value, count: 0 };
    const hit = value !== prev ? 1 : 0;
    return { started: true, prev: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ started, count }) => started && count === target,
}, numValues);

// Column i+1's clue cell is R1C(i+2); its lane is the whole column i+1
// (0-indexed among 10, C2..C10 -> index 1..9), clue cell first.
const colCounts = colClues.map((clue, i) =>
  new NFA(makeCrossingMachine(clue), 'column crossing count', ...columns[i + 1]));
// Row i+1's clue cell is R(i+2)C1; its lane is the whole row i+1 (R2..R10
// -> index 1..9), clue cell first.
const rowCounts = rowClues.map((clue, i) =>
  new NFA(makeCrossingMachine(clue), 'row crossing count', ...rows[i + 1]));

return [
  shape,
  sideDomain,
  corner.toVar('loop corner type'),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),
  ...cornerCodes,
  ...singleLoop,
  ...colCounts,
  ...rowCounts,
];
