// Title: Starmie
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=LwzoG4UsJA0
// Source: https://sudokupad.app/04zedl744q

// Masyu: draw a closed, non-branching, non-crossing loop along the dotted
// gridlines (the lattice of the 10x10 grid's own corners). It must visit
// every drawn circle: turning at a black circle with a straight cell on each
// side, and going straight through a white circle with a turn on at least
// one side. A gray circle is either a black or a white circle -- whichever
// the solver needs.
//
// Star battle: place one star per row and one per column so that no two
// stars touch, not even diagonally. The rules also require exactly one star
// in each region the Masyu loop divides the grid into, but that region
// partition is itself solver-discovered (unanchored -- no clue names or
// counts the regions -- and unbounded in both component size and count,
// since it depends on the still-unknown loop). No ISS primitive attaches a
// per-region exact-count predicate to a partition derived from a second,
// also-unknown structure. Omitted.
//
// Loop model: a "shape" Var per lattice vertex records which two (or zero) of
// the vertex's four incident edges the loop uses -- OFF, a straight
// HORIZ/VERT, or one of four turn corners UL/UR/DL/DR -- applied to the
// vertex lattice (an auxiliary 11x11 graph, one more vertex than cells on
// each side) rather than to the cells themselves, since here the circles sit
// on the grid's corners. Edge agreement between neighbouring vertices joins
// matching shapes into a loop; ConnectedValues over the on-loop codes gives a
// partial single-loop closure only (it forces one connected blob of on-loop
// vertices, not one edge-connected cycle, so a second loop fragment running
// vertex-adjacent to the first without sharing a used edge would still pass).
//
// Star placement lives directly on the main 10x10 board, a digit-free Raw
// grid. Every Var cell (including the loop's own shape overlay) shares one
// grid-wide value range, which the shape codes force wide enough to hold 7
// values, so the board is restricted back to two of those values, standing
// in for the puzzle's own 0/1 solution convention ("place a 1 into every
// cell containing a star... 0 into all other cells") at a constant offset.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR];
const ALL_SHAPES = [OFF, ...ON_CODES];
const TURN_CODES = [UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => TURN_CODES.includes(s);

// The one declared Shape every Var cell's value range comes from -- the
// board's own cellGraph reports a value range sized from its *dimensions*
// (10), not this widened range, so every custom key/NFA below is built
// against this object instead, never against a graph's gridGeometry().
const boardShape = new Shape('10x10', 7, 'Raw');

// --- The vertex lattice: an 11x11 auxiliary graph, R{r}C{c} standing for the
// grid corner the payload calls JSON coordinate (r-1, c-1) -- the SudokuPad
// integer-coordinate = shared-corner convention. Independent of the 10x10
// board Shape declared above; it only ever holds the loop's shape Var, which
// (like every Var cell) takes its value range from that Shape.
const vgraph = cellGraph('11x11');
const vgeometry = vgraph.gridGeometry();
const vertices = vgraph.cells();
const shape = vgraph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);

// Circle positions, transcribed from the drawn overlay circles' centres,
// converted to this vertex graph's 1-indexed ids (row+1, col+1). Colour is
// read from each overlay's fill: white (#ffffff), black (#000000),
// gray (#cfcfcf).
const WHITE = [[2, 5], [2, 7], [3, 7], [5, 8], [6, 11], [7, 4], [9, 8]]
  .map(([r, c]) => makeCellId(r, c));
const BLACK = [[3, 10], [4, 6], [6, 3], [8, 6], [8, 9], [10, 2]]
  .map(([r, c]) => makeCellId(r, c));
const GRAY = [[1, 4], [1, 6], [1, 8], [4, 1], [4, 11], [6, 1], [8, 1],
  [8, 11], [10, 10], [11, 4], [11, 6], [11, 8]].map(([r, c]) => makeCellId(r, c));

const DIRS = ['up', 'down', 'left', 'right'];
const usesDir = { up: usesUp, down: usesDown, left: usesLeft, right: usesRight };
const dirStep = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const presentDirs = cell => DIRS.filter(d => vgraph.step(cell, ...dirStep[d]));

// --- Shape domains: an edge code may only be used where the neighbouring
// vertex exists -- a vertex on the lattice border cannot use the edge(s)
// running off it. An interior vertex's every code is already legal (the
// widened Shape's native range is exactly ALL_SHAPES), so only the border
// vertices need a restricting Given.
const shapeDomains = vertices.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === vgeometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === vgeometry.numCols && usesRight(s)));
  return allowed.length < ALL_SHAPES.length ? [new Given(shapeCell(cell), ...allowed)] : [];
});

// --- Edge agreement: neighbouring vertices must agree on their shared edge
// -- A uses the edge to B iff B uses the edge back.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey((a, b) => toB(a) === toA(b), boardShape);
const edgeAgreeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeAgreeDownKey = edgeAgreeKey(usesDown, usesUp);
const edgeAgreementConstraints = [
  shape.makeReplicate(
    [new Pair(edgeAgreeRightKey, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2'))],
    shape.at(vertices.filter(cell => vgraph.step(cell, 0, 1)))),
  shape.makeReplicate(
    [new Pair(edgeAgreeDownKey, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1'))],
    shape.at(vertices.filter(cell => vgraph.step(cell, 1, 0)))),
];

// --- Black circle: must turn, and go straight through the vertex on each
// side (the neighbour in each used direction continues in the same axis).
function blackMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (!isTurn(value)) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value };
      }
      const dir = dirs[state.idx];
      if (usesDir[dir](state.shapeVal)) {
        const axis = (dir === 'up' || dir === 'down') ? VERT : HORIZ;
        if (value !== axis) return undefined;
      }
      const idx = state.idx + 1;
      return idx < dirs.length ? { phase: 'dir', idx, shapeVal: state.shapeVal } : { phase: 'done' };
    },
    accept: (state) => state.phase === 'done',
  }, boardShape);
}
const blackNFA = (cell) => {
  const dirs = presentDirs(cell);
  const neighbourShapes = dirs.map(d => shapeCell(vgraph.step(cell, ...dirStep[d])));
  return new NFA(blackMachine(dirs), 'black-straight-sides', shapeCell(cell), ...neighbourShapes);
};

// --- White circle: must go straight, and turn on at least one side.
function whiteMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (value !== HORIZ && value !== VERT) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value, sawTurn: false };
      }
      const dir = dirs[state.idx];
      const used = usesDir[dir](state.shapeVal);
      const sawTurn = state.sawTurn || (used && isTurn(value));
      const idx = state.idx + 1;
      if (idx < dirs.length) return { phase: 'dir', idx, shapeVal: state.shapeVal, sawTurn };
      return sawTurn ? { phase: 'done' } : undefined;
    },
    accept: (state) => state.phase === 'done',
  }, boardShape);
}
const whiteNFA = (cell) => {
  const dirs = presentDirs(cell);
  const neighbourShapes = dirs.map(d => shapeCell(vgraph.step(cell, ...dirStep[d])));
  return new NFA(whiteMachine(dirs), 'white-turn-side', shapeCell(cell), ...neighbourShapes);
};

// Pure white/black circles get the matching domain restriction (already on
// the loop, already the right kind) plus the side rule.
const whiteRules = WHITE.flatMap(cell => [new Given(shapeCell(cell), HORIZ, VERT), whiteNFA(cell)]);
const blackRules = BLACK.flatMap(cell => [new Given(shapeCell(cell), ...TURN_CODES), blackNFA(cell)]);
// A gray circle behaves as either kind -- disjoin over the two full readings
// (domain restriction plus its own side rule), rather than merging domains,
// since a white and a black reading need different side rules.
const grayRules = GRAY.map(cell => new Or([
  new And([new Given(shapeCell(cell), HORIZ, VERT), whiteNFA(cell)]),
  new And([new Given(shapeCell(cell), ...TURN_CODES), blackNFA(cell)]),
]));

// --- Star battle: one star per row and per column, no two stars
// king-adjacent. "One star per Masyu-loop region" is omitted -- see the
// header comment. All Var cells (including the loop's own shape overlay)
// share one grid-wide value range, which the shape codes above need widened
// to 7 -- so the board itself is restricted back to two of those seven
// values, NOSTAR=1/STAR=2, standing in for the puzzle's own 0/1 solution
// convention at a constant +1 offset.
const NOSTAR = 1, STAR = 2;
const graph = cellGraph('10x10');
const boardCells = graph.cells();
const boardDomain = graph.makeReplicate(new Given(boardCells[0], NOSTAR, STAR));
// A row/column of 10 cells sums to 10*NOSTAR + (STAR - NOSTAR) for each star
// it holds, so one star per line is target 10 + 1 = 11.
const rowCounts = graph.rows().map(row => new Sum(10 + 1, ...row));
const colCounts = graph.columns().map(col => new Sum(10 + 1, ...col));

// Every king-adjacent pair lies in some 2x2 block, and all six pairs inside a
// block are king-adjacent, so one all-pairs relation stamped on every block
// covers every king-adjacent pair exactly once.
const noTwoStarsKey = PairX.fnToKey((a, b) => !(a === STAR && b === STAR), boardShape);
const starBlocks = boardCells.filter(c => graph.block(c, 2, 2) !== null);
const starSpacing = graph.makeReplicate(
  new PairX(noTwoStarsKey, 'no-adjacent-stars', ...graph.block(starBlocks[0], 2, 2)),
  starBlocks);

return [
  boardShape,
  boardDomain,
  shape.toVar('masyu loop shape'),
  ...shapeDomains,
  ...edgeAgreementConstraints,
  ...whiteRules,
  ...blackRules,
  ...grayRules,
  // Partial single-loop closure -- see the header comment for the residual gap.
  new ConnectedValues('VS', ON_CODES),
  ...rowCounts,
  ...colCounts,
  starSpacing,
];
