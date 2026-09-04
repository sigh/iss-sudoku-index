// Title: Fillomino Knights
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=4IFxx4XSskQ
// Source: https://sudokupad.app/n8uzh6og6f

// 9x9, no Sudoku layer: rows, columns and boxes carry no rule and values
// repeat freely.
//
// Rules encoded:
//  * Standard Fillomino, sizes 1-9 only: divide the grid into orthogonally
//    connected regions; every cell holds its own region's size; two regions
//    of the same size never share an edge.
//  * The digit N cannot appear in row N or column N.
//  * Seven black dots, each a 1:2 ratio between its two cells.
//  * Antiknight: no two cells a knight's move apart repeat a digit.
//  * The one given, R2C2=1.
//
// Nothing is omitted. Since a region can hold at most nine cells, its size
// fits the board's own 1-9 alphabet directly -- no split-number overlay is
// needed (contrast the 10x10+ Fillomino rows, which do need one).

// Widened to 0-9 (10 values) so the dist overlay -- a Var group, which always
// takes the grid's own value range -- can hold 0. The board and the rootRow/
// rootCol overlays are restricted back to 1-9 below.
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A custom Pair/NFA key spanning every field this script reads together
// (board digits 1-9, root row/col 1-9, distance 0-8) needs one alphabet wide
// enough for all of them: 0-9.
const WIDE = 10;
// NFA.encodeSpec/Pair.fnToKey read a plain numValues count as 1-based
// (userValue = loopValue + valueOffset for loopValue in 1..numValues), so
// values 0-9 need valueOffset -1, not 0.
const WIDE_OPTS = { valueOffset: -1 };

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// ---- Fillomino ----
//
// A region is the set of cells naming the same root, where a region's root is
// its own first cell in reading order. Three whole-grid overlays carry it:
//   rootRow, rootCol - which cell is the root of this cell's region;
//   dist             - the cell's distance from its root (0-8: a region holds
//                       at most nine cells, so no member is more than eight
//                       connecting steps from the root that names it).
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const dist = graph.makeOverlay('VD');
const domains = [
  restrict(rootRow, range(1, 9)),
  restrict(rootCol, range(1, 9)),
  restrict(dist, range(0, 8)),
];

// Reads [rootRow, rootCol, dist] of one cell. The named root must not come
// after the cell in reading order, and the cell is at distance 0 exactly when
// it is its own root.
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return value <= row ? { phase: 1, rowEq: value === row } : undefined;
        }
        if (state.phase === 1) {
          if (state.rowEq && value > col) return undefined;
          return { phase: 2, self: state.rowEq && value === col };
        }
        if (state.phase === 2) {
          return (value === 0) === state.self ? { phase: 3 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 3,
    }, WIDE, WIDE_OPTS));
  }
  return rootSpecs.get(key);
};

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), dist.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// one step nearer the root. Following such neighbours strictly decreases
// dist, so the chain cannot cycle and must reach a root: the region named by
// any cell is connected and contains it.
const stepCloser = Pair.fnToKey((mine, other) => other === mine - 1, WIDE, -1);
const descents = cells.map(cell => new Or([
  new Given(dist.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepCloser, 'one step nearer the root', dist.at(cell), dist.at(other)),
  ])),
]));

// Reads [dist(cell), digit(cell), then rootRow and rootCol of this cell and
// every cell after it in reading order]. A cell at distance 0 is a root, and
// exactly its own digit's worth of cells (itself included) name it as root;
// only cells at or after it in reading order can, since a root must not come
// after the cells it names. A cell at positive distance is named by nobody.
const sizeSpecs = new Map();
const sizeSpec = (row, col) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'dist' },
      transition: (state, value) => {
        if (state.phase === 'dist') return { phase: 'digit', root: value === 0 };
        if (state.phase === 'digit') {
          return { phase: 'row', rem: state.root ? value : 0 };
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        // phase === 'col'
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && state.rem === 0,
    }, WIDE, WIDE_OPTS));
  }
  return sizeSpecs.get(key);
};

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col), 'region size equals its number',
    dist.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [digit(a), digit(b), rootRow(a), rootRow(b), rootCol(a), rootCol(b)]
// for one orthogonal edge: the two digits are equal exactly when the two
// cells share a root. Within a region that makes the digit uniform; across a
// boundary it is "regions of equal size do not share an edge".
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, da: value };
    if (state.phase === 1) return { phase: 2, sameDigit: value === state.da };
    if (state.phase === 2) return { phase: 3, sameDigit: state.sameDigit, ra: value };
    if (state.phase === 3) {
      return { phase: 4, sameDigit: state.sameDigit, rowSame: value === state.ra };
    }
    if (state.phase === 4) {
      return { phase: 5, sameDigit: state.sameDigit, rowSame: state.rowSame, ca: value };
    }
    if (state.phase === 5) {
      const sameRoot = state.rowSame && value === state.ca;
      return sameRoot === state.sameDigit ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, WIDE, WIDE_OPTS);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), dist(a), dist(b)]
// for the same edge: within one region, dist changes by at most one across
// it. That is what makes dist the true distance to the root rather than any
// merely-decreasing chain, keeping the overlay a function of the partition
// (no extra symmetry across region-internal cycles in the adjacency graph).
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, ra: value };
    if (state.phase === 1) return { phase: 2, rowSame: value === state.ra };
    if (state.phase === 2) return { phase: 3, rowSame: state.rowSame, ca: value };
    if (state.phase === 3) {
      const sameRoot = state.rowSame && value === state.ca;
      return { phase: 4, sameRoot };
    }
    if (state.phase === 4) return { phase: 5, sameRoot: state.sameRoot, da: value };
    if (state.phase === 5) {
      if (!state.sameRoot) return { phase: 6 };
      return Math.abs(value - state.da) <= 1 ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, WIDE, WIDE_OPTS);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b), dist.at(a), dist.at(b)),
]);

// ---- Digit N banned from row N and column N ----
const rowColBans = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const banned = new Set([row, col]);
  return new Given(cell, ...range(1, 9).filter(v => !banned.has(v)));
});

// ---- Black dots: 1:2 ratio, drawn edge-centred overlays ----
// Transcribed from the payload's seven small black rounded-rectangle
// overlays, each centred on the midpoint of the two cells it joins.
const DOTS = [
  ['R8C4', 'R8C5'],
  ['R6C4', 'R6C5'],
  ['R4C4', 'R5C4'],
  ['R3C9', 'R4C9'],
  ['R1C6', 'R2C6'],
  ['R6C1', 'R7C1'],
  ['R9C7', 'R9C8'],
];
const blackDots = DOTS.map(([a, b]) => new BlackDot(a, b));

// ---- Antiknight ----
// AntiKnight requires the default Sudoku grid, which this Raw grid is not, so
// the "no two cells a knight's move apart share a digit" rule is stated
// explicitly as one AllDifferent per knight-move edge. Only the four offsets
// with a positive row step are walked, so each edge is visited once.
const KNIGHT_OFFSETS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const knightEdges = cells.flatMap(cell => KNIGHT_OFFSETS.flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [new AllDifferent(cell, other)] : [];
}));

// ---- Given ----
const given = new Given('R2C2', 1);

return [
  shape,
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  dist.toVar('distance to root'),
  ...domains,
  ...rowColBans,
  given,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...blackDots,
  ...knightEdges,
];
