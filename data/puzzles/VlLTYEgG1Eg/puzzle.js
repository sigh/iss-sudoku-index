// Title: Just Do The Moth
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=VlLTYEgG1Eg
// Source: https://app.crackingthecryptic.com/sudoku/DHd3Fg3QTH

// Normal sudoku rules apply. Draw two closed loops that travel orthogonally
// between cell centres, each confined entirely to one side of the highlighted
// diagonal (the anti-diagonal R9C1-R1C9) and a mirror image of the other
// across it. A digit in a grey cell (the four underlay cells on the diagonal:
// R7C3, R6C4, R5C5, R4C6) gives the count of cells in its row -- equivalently
// its column, by the mirror symmetry -- that are on neither loop. Adjacent
// digits along either loop differ by at least 5.
//
// Loop cells get a 7-state "shape" overlay Var on every grid cell (OFF, or
// one of six used-edge pairs), with per-edge agreement joining neighbouring
// shapes into loops (same "loop may run alongside itself" family as other
// touch-permitting loop puzzles: the source only forbids the loops
// crossing/repeating a cell, not touching, so a stricter ConnectedValues+
// degree-2 model would reject legal touching solutions). Diagonal cells are
// pinned OFF -- neither loop may use them. Every side-A cell's shape is tied
// to its mirror cell's shape by
// the reflection's direction relabelling (up<->right, down<->left, so
// horizontal<->vertical and up-left<->down-right, while up-right and
// down-left map to themselves); that is what "mirror image" means for a
// cell-centre path, and it is also why the row-count and column-count are
// automatically equal for a diagonal cell -- the rules' own "because of the
// symmetry".
//
// "Don't intersect each other" needs no separate constraint: row+col changes
// by exactly 1 per grid step, so a side-A cell (row+col<10) and a side-B cell
// (row+col>10) can never be orthogonally adjacent or identical -- the two
// loops are geometrically incapable of touching or crossing.
//
// OMITTED: the encoding enforces exact local degree/edge-agreement (so the
// on-loop cells of each side decompose into a disjoint union of simple
// cycles) and forces at least one on-loop cell per side, but does not force
// there to be exactly ONE cycle per side rather than several smaller ones.
// ISS has no primitive for connectivity over a solver-chosen USED-EDGE set
// without a clue-forced seed cell to anchor a modular-position-counter
// closure, and no clue here forces any specific cell onto the route.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Domains: a diagonal cell (row+col === 10) is pinned OFF; any other cell may
// use an edge only if the neighbour exists, so border cells can't take shapes
// that point off the grid.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  if (row + col === 10) return new Given(shape.at(cell), OFF);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shape.at(cell), ...allowed);
});

// --- Edge agreement: neighbours must agree on the shared edge -- the first
// uses the edge towards the second iff the second uses the edge back. Pair
// chains apply a key to every consecutive cell in the list, so one Pair per
// row (or column) covers that whole row's (or column's) horizontal (or
// vertical) neighbour pairs at once.
const pairKey = fn => Pair.fnToKey(fn, geometry.numValues);
const edgeRightKey = pairKey((a, b) => usesRight(a) === usesLeft(b));
const edgeDownKey = pairKey((a, b) => usesDown(a) === usesUp(b));
const edgeRowRules = graph.rows().map(row => new Pair(edgeRightKey, 'edge-h', ...shape.at(row)));
const edgeColRules = graph.columns().map(col => new Pair(edgeDownKey, 'edge-v', ...shape.at(col)));

// --- Loop differences: two cells joined by a loop edge differ by at least 5.
// One NFA per row (or column) reads digit, shape, digit, shape, ..., digit in
// that row (or column) -- `joined` (whether the shape just read uses the edge
// towards the next cell) gates the check against the following digit, so all
// of a row's (or column's) horizontal (or vertical) pairs are covered by one
// machine instead of one machine per pair.
const diffChainSpec = usesJoinDir => NFA.encodeSpec({
  startState: { expectDigit: true, prevDigit: null, joined: false },
  transition: (state, value) => {
    if (state.expectDigit) {
      if (state.prevDigit === null) return { expectDigit: false, prevDigit: value, joined: false };
      if (state.joined && Math.abs(state.prevDigit - value) < 5) return undefined;
      return { expectDigit: false, prevDigit: value, joined: false };
    }
    return { expectDigit: true, prevDigit: state.prevDigit, joined: usesJoinDir(value) };
  },
  accept: () => true,
}, geometry.numValues);
const diffChainRight = diffChainSpec(usesRight), diffChainDown = diffChainSpec(usesDown);
// Interleaves a line's digit cells with its (one-fewer) shape cells:
// d1, s1, d2, s2, ..., s(n-1), dn.
const interleaveDiffLine = digitCells => {
  const shapeCells = shape.at(digitCells);
  const out = [digitCells[0]];
  for (let i = 0; i < digitCells.length - 1; i++) out.push(shapeCells[i], digitCells[i + 1]);
  return out;
};
const diffRowRules = graph.rows().map(row =>
  new NFA(diffChainRight, 'diff-h', ...interleaveDiffLine(row)));
const diffColRules = graph.columns().map(col =>
  new NFA(diffChainDown, 'diff-v', ...interleaveDiffLine(col)));

// --- Mirror: side-A cells (row+col < 10) have their shape tied to their
// mirror cell shape.at(10-col, 10-row) on side B, transformed by the
// reflection's direction relabelling derived above.
const MIRROR_SHAPE = {
  [OFF]: OFF, [HORIZ]: VERT, [VERT]: HORIZ, [UL]: DR, [DR]: UL, [UR]: UR, [DL]: DL,
};
const mirrorCellOf = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - col, 10 - row);
};
const mirrorKey = pairKey((a, b) => b === MIRROR_SHAPE[a]);
const sideACells = gridCells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row + col < 10;
});
const mirrorRules = sideACells.map(cell =>
  new Pair(mirrorKey, 'loop-mirror', shape.at(cell), shape.at(mirrorCellOf(cell))));

// --- Grey cells: R7C3, R6C4, R5C5, R4C6 (drawn as light-grey squares on the
// diagonal). Each one's own digit must equal the number of OFF-shape cells
// in its row (which already counts the grey cell itself, since diagonal
// cells are pinned OFF).
const greyCells = ['R7C3', 'R6C4', 'R5C5', 'R4C6'];
const offCountSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'count', target: value, count: 0 };
    const count = state.count + (value === OFF ? 1 : 0);
    if (count > state.target) return [];
    return { phase: 'count', target: state.target, count };
  },
  accept: state => state.phase === 'count' && state.count === state.target,
}, geometry.numValues);
const greyRules = greyCells.map(cell => {
  const { row } = parseCellId(cell);
  return new NFA(offCountSpec, 'grey-off-count', cell, ...shape.at(graph.row(row)));
});

// --- At least one cell of each loop is drawn (side B follows by mirroring).
const nonEmptySpec = NFA.encodeSpec({
  startState: { onSeen: false },
  transition: ({ onSeen }, value) => ({ onSeen: onSeen || value !== OFF }),
  accept: ({ onSeen }) => onSeen === true,
}, geometry.numValues);
const nonEmptyRule = new NFA(nonEmptySpec, 'loop-nonempty', ...shape.at(sideACells));

return [
  new Shape('9x9'),
  new Given('R1C4', 5),
  new Given('R5C9', 6),
  new Given('R6C1', 6),
  new Given('R6C4', 3),
  new Given('R9C5', 5),
  shape.toVar('shape'),
  ...shapeDomains,
  ...edgeRowRules,
  ...edgeColRules,
  ...diffRowRules,
  ...diffColRules,
  ...mirrorRules,
  ...greyRules,
  nonEmptyRule,
];
