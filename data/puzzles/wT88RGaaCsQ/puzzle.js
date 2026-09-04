// Title: Fillomino Whispers
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=wT88RGaaCsQ
// Source: https://sudokupad.app/jm86sbi0bb

// 9x9, no Sudoku layer: rows/columns/boxes carry no rule and digits repeat
// freely, so the grid is Raw. Rules encoded:
//  * Fillomino. Divide the grid into orthogonally-connected regions, each
//    filled uniformly with its own cell count (1-9, since regions run up to
//    9 cells).
//  * Anti Row/Column. Except for the given 1 in R3C1, digit N is forbidden
//    from row N and column N.
//  * German Whispers. Adjacent digits in different regions differ by >= 5.
// Nothing is omitted.
//
// Fillomino has no drawn region boundary and no clue anchoring any region, so
// each cell carries its own region identity: which cell is its region's root
// (the region's first cell in reading order) and its BFS distance to that
// root. Regions cap at 9 cells, so one 0-8 depth layer holds the true
// distance directly (a <=9-cell region's diameter never exceeds 8) and the
// board digit doubles as the Fillomino number with no extra split.

const SIDE = 9;
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells naming the same root, where a region's root is
// its first cell in reading order. Three overlays carry the identity:
//   rootRow, rootCol - which cell is this cell's region's root;
//   depth            - this cell's BFS distance to that root (0 at the root;
//                       a <= 9-cell region has diameter <= 8, so one 0-8
//                       layer holds the true distance with no aliasing).
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  // Board digits are region sizes, 1-9 -- never 0.
  graph.makeReplicate(new Given(cells[0], ...range(1, SIDE))),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(depth, range(0, SIDE - 1)),
];

// Reads [rootRow, rootCol, depth] of one cell. The named root must not come
// after the cell in reading order, and depth is 0 exactly when the cell names
// itself as its own root.
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
    }, shape));
  }
  return rootSpecs.get(key);
};

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order, self exactly at depth 0',
    rootRow.at(cell), rootCol.at(cell), depth.at(cell));
});

// Every non-root cell has an orthogonal neighbour in its own region exactly
// one step nearer the root. This forces the named root to sit inside the
// region and pins depth to the true distance.
const stepIn = Pair.fnToKey((mine, other) => other === mine - 1, shape);
const descents = cells.map(cell => new Or([
  new Given(depth.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepIn, 'one step nearer the root', depth.at(cell), depth.at(other)),
  ])),
]));

// Reads [depth(cell), digit(cell), then rootRow and rootCol of this cell and
// every cell after it in reading order]. A root (depth 0) is named by exactly
// its own digit's worth of cells (itself included); a non-root must be named
// by nobody. `maxArea` (how many later cells exist) bounds the count so an
// infeasible root claim near the grid's end is rejected rather than skipped.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'depth' },
      transition: (state, value) => {
        if (state.phase === 'depth') return { phase: 'digit', zero: value === 0 };
        if (state.phase === 'digit') {
          const rem = state.zero ? value : 0;
          return rem <= maxArea ? { phase: 'row', rem } : undefined;
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && state.rem === 0,
    }, shape));
  }
  return sizeSpecs.get(key);
};

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col, later.length), "region size equals the digit at its root",
    depth.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [digit(a), digit(b), rootRow(a), rootRow(b), rootCol(a), rootCol(b)]
// for one orthogonal edge: the two digits are equal exactly when the two
// cells share a root (same region). This is what makes "region" mean the
// maximal same-digit connected component, and is also exactly the German
// Whispers scope test below: for an edge, "different regions" reduces to
// "different digit" once this holds.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameDigit: value === state.mine };
    if (state.phase === 2) return { phase: 3, mine: value, sameDigit: state.sameDigit };
    if (state.phase === 3) return { phase: 4, sameRow: value === state.mine, sameDigit: state.sameDigit };
    if (state.phase === 4) return { phase: 5, mine: value, sameRow: state.sameRow, sameDigit: state.sameDigit };
    if (state.phase === 5) {
      const sameRegion = state.sameRow && value === state.mine;
      return sameRegion === state.sameDigit ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), depth(a), depth(b)]:
// within a shared region, depth may differ by at most one across an edge
// (paired with the descent NFA's "at least one neighbour exactly one step
// nearer", this pins depth to the true BFS distance rather than any
// depth-violating shortcut); across different regions depth is unconstrained.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameRow: value === state.mine };
    if (state.phase === 2) return { phase: 3, mine: value, sameRow: state.sameRow };
    if (state.phase === 3) return { phase: 4, sameRegion: state.sameRow && value === state.mine };
    if (state.phase === 4) return { phase: 5, mine: value, sameRegion: state.sameRegion };
    if (state.phase === 5) {
      if (!state.sameRegion) return { phase: 6 };
      return Math.abs(value - state.mine) <= 1 ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal digits exactly within a region',
    a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'depth differs by at most one within a region',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b), depth.at(a), depth.at(b)),
]);

// German Whispers: same digit (same region, no whisper obligation) or a
// difference of at least 5 (necessarily different regions, per numberEdgeSpec
// above). All 144 orthogonal edges share this one predicate and fall into
// exactly two shift templates (one column right, one row down), so each is one
// Replicate rather than 144 separate Pairs.
const whisperPred = Pair.fnToKey((a, b) => a === b || Math.abs(a - b) >= 5, shape);
const horizOrigins = cells.filter(cell => parseCellId(cell).col < SIDE);
const vertOrigins = cells.filter(cell => parseCellId(cell).row < SIDE);
const whispers = [
  graph.makeReplicate(
    new Pair(whisperPred, 'German Whispers: equal digit, or differ by >= 5', 'R1C1', 'R1C2'),
    horizOrigins),
  graph.makeReplicate(
    new Pair(whisperPred, 'German Whispers: equal digit, or differ by >= 5', 'R1C1', 'R2C1'),
    vertOrigins),
];

// Anti Row/Column: digit N forbidden from row N and column N. R3C1's given 1
// is the rules' stated exception to the column-1 half of this ban; every
// other cell (including the diagonal, where the row- and column-forbidden
// digit coincide) keeps both halves.
const antiRowCol = [];
for (let row = 1; row <= SIDE; row++) {
  for (let col = 1; col <= SIDE; col++) {
    const forbidden = new Set([row, col]);
    if (row === 3 && col === 1) forbidden.delete(1); // stated exception
    const allowed = range(1, SIDE).filter(v => !forbidden.has(v));
    antiRowCol.push(new Given(makeCellId(row, col), ...allowed));
  }
}

// Transcribed from the four printed givens: R3C1=1, R4C2=1, R6C3=2, R6C7=2.
const GIVENS = [[3, 1, 1], [4, 2, 1], [6, 3, 2], [6, 7, 2]];
const givens = GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value));

return [
  shape,
  rootRow.toVar('row of this cell region root'),
  rootCol.toVar('column of this cell region root'),
  depth.toVar('BFS distance to this cell region root'),
  ...domains,
  ...antiRowCol,
  ...givens,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...whispers,
];
