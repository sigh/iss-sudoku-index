// Title: 'Outside': Castle Wall
// Author: Stefan Liew
// Video: https://www.youtube.com/watch?v=YLkCnfwPSRM
// Source: https://app.crackingthecryptic.com/sudoku/rFRF94qjg3

// Rules encoded here, in the order the constraints appear below:
//  - No sudoku layer, no digits: a Raw 12x12 grid.
//  - Row 1 and column 1 hold only the outside clues and are never on the loop
//    ("cells with arrows/numbers are not part of the loop"); the loop lives in
//    the 11x11 interior, rows/columns 2-12.
//  - A single closed loop, without intersections or crossings, through cell
//    centres of some of the interior cells.
//  - Each margin clue is the total sum of the lengths of the loop's segments
//    running in its arrow's direction along that row/column -- equivalently,
//    the count of that row/column's internal cell borders the loop crosses.
// Nothing is omitted.

// The rules say "without intersections or crossings", not "does not touch
// itself" or "not even diagonally" -- the weaker, centre-to-centre reading (a
// drawn line only meets itself by reusing a cell or branching), under which
// the loop MAY run alongside itself. A cheaper ON/OFF-membership +
// neighbour-degree model would be unsound for that case: two parallel,
// unconnected strands would force a cell's on-loop neighbour count above 2
// and reject a real solution. So each cell instead carries a directed
// "shape" code -- which two of its four edges (if any) the loop uses --
// with degree fixed by the code itself, and neighbours agreeing about their
// shared edge.
//
// Single-loop closure: no clue anchors any specific cell onto the route (the
// modular-position-counter technique needs a forced seam cell to pin, which
// this puzzle has none of), so the loop is closed by enclosure instead: a
// closed loop through cell centres divides the off-loop cells into inside and
// outside. Two disjoint loops leave two separate inside pockets and a nested
// loop leaves an outside-labelled hole that cannot reach the true outside, so
// requiring both classes to each be a single connected region forces exactly
// one loop. Margin row 1/column 1 are always outside, and the printed clue
// values (up to 3, several rows/columns nonzero) rule out the one loop shape
// (a bare 2x2 ring) that could enclose nothing, so the inside class is safe to
// require non-empty.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const IN = 1, OUT = 2;

const gridShape = new Shape('12x12', 7, 'Raw');
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// The inside/outside classification of every cell, read off the shape layer.
const inout = graph.makeOverlay('VI');

// --- Margin cells (row 1, column 1) are never on the loop: row 1 (columns
// 2-12) and column 1 (rows 2-12) carry the printed clue numbers, and the
// corner R1C1 carries none.
const marginCells = [...new Set([...graph.row(1), ...graph.column(1)])];
const margin = marginCells.map(cell => new Given(cell, OFF));

// --- Shape domains: an interior cell may only use an edge that stays on the
// grid (the far edge of the interior, row/column 12, has no further cell).
// Interior cells away from that far edge share one full-domain template;
// interior cells on it are pinned individually.
const interiorCells = gridCells.filter(cell => !marginCells.includes(cell));
const isAtFarEdge = cell => {
  const { row, col } = parseCellId(cell);
  return row === geometry.numRows || col === geometry.numCols;
};
// Stamped over the whole grid; the narrower margin/far-edge Givens below
// intersect it down further on the cells they cover.
const genericShapeDomain = graph.makeReplicate(new Given(gridCells[0], ...ALL_SHAPES));
const farEdgeShapeDomains = interiorCells.filter(isAtFarEdge).map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, ...ALL_SHAPES.filter(s =>
    !(row === geometry.numRows && usesDown(s)) &&
    !(col === geometry.numCols && usesRight(s))));
});

// --- Edge agreement: neighbours must agree on their shared edge, which joins
// the per-cell shapes into closed loops with no branch or crossing (a shape
// code uses at most two edges, so degree is fixed by the code itself).
const edgeAgreeRightKey = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), numValues);
const edgeAgreeDownKey = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), numValues);
const edgeAgreements = [
  graph.makeReplicate(
    new Pair(edgeAgreeRightKey, 'edge-h', gridCells[0], graph.step(gridCells[0], 0, 1)),
    gridCells.filter(cell => graph.step(cell, 0, 1))),
  graph.makeReplicate(
    new Pair(edgeAgreeDownKey, 'edge-v', gridCells[0], graph.step(gridCells[0], 1, 0)),
    gridCells.filter(cell => graph.step(cell, 1, 0))),
];

// --- Inside/outside: a ray cast west from just above a cell's centre line
// meets the loop exactly at the cells of that row using their north edge, so
// enclosure is the parity of `usesUp`, accumulated across the row from column
// 1 (always outside) up to and including the cell itself. One NFA per row,
// reading [shape, inout] pairs left to right.
const parityMachine = NFA.encodeSpec({
  startState: { phase: 'shape', p: 0 },
  transition: (state, value) => {
    if (state.phase === 'shape') {
      return { phase: 'inout', p: (state.p + (usesUp(value) ? 1 : 0)) % 2 };
    }
    return value === (state.p === 1 ? IN : OUT)
      ? { phase: 'shape', p: state.p } : undefined;
  },
  accept: state => state.phase === 'shape',
}, numValues);
const rowParities = Array.from({ length: geometry.numRows }, (_, i) => i + 1).map(r =>
  new NFA(parityMachine, 'parity', ...graph.row(r).flatMap(cell => [cell, inout.at(cell)])));

// --- Outside clues, read off row 1 (columns 2-12, "down" arrows -> column
// totals) and column 1 (rows 2-12, "right" arrows -> row totals). Each total
// counts the row/column's used horizontal/vertical edges, i.e. the cells
// using that edge towards their next cell along the line.
const ROW_CLUES = [2, 0, 2, 1, 3, 1, 2, 3, 3, 2, 1];      // rows 2..12
const COLUMN_CLUES = [1, 2, 1, 2, 3, 1, 3, 3, 1, 1, 2];   // columns 2..12

const rowSegmentMachine = target => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (usesRight(value) ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, numValues);
const columnSegmentMachine = target => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (usesDown(value) ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, numValues);
const rowSums = ROW_CLUES.map((target, i) => new NFA(
  rowSegmentMachine(target), 'row-sum', ...graph.row(i + 2)));
const columnSums = COLUMN_CLUES.map((target, i) => new NFA(
  columnSegmentMachine(target), 'col-sum', ...graph.column(i + 2)));

return [
  gridShape,
  inout.toVar('inside/outside'),
  ...margin,
  genericShapeDomain,
  ...farEdgeShapeDomains,
  inout.makeReplicate(new Given(inout.cells()[0], IN, OUT)),
  ...edgeAgreements,
  ...rowParities,
  // Single loop by enclosure: inside and outside each form one region.
  new ConnectedValues('VI', IN),
  new ConnectedValues('VI', OUT),
  ...rowSums,
  ...columnSums,
];
