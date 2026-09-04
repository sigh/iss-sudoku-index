// Title: Sudomino
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=HkosD24y1wU
// Source: https://sudokupad.app/tpi8hjfum7

// Sudomino, 8x8, 8 boxes of 2 rows x 4 columns.
// Every digit 1-8 appears exactly 8 times. Each digit is EITHER a sudoku
// digit (appears exactly once in every row, column and box) OR an omino
// digit (every maximal orthogonally-connected group of cells holding that
// digit -- its "omino" -- has exactly that many cells; two ominoes that
// share a digit may not touch, not even diagonally). Which digits are which
// is not given: the solver must determine it. Extra clues: a digit sitting
// on a circle names how many circled cells (of the 27 drawn) hold that same
// digit; a white dot marks two consecutive digits.
//
// Since the grid has repeats (an omino digit is not one-per-row/column/box),
// rows/columns/boxes carry no automatic rule: the shape is Raw and every
// rule is stated explicitly. The value range is widened to 0-8 so the
// region-identity overlays below (which need a 0 for "this is a region's
// root") share the grid's own alphabet; the 64 playable cells are then
// restricted back to 1-8.
//
// Nothing is omitted.

const SUDOKU = 1;
const OMINO = 2;

const shape = new Shape('8x8', '0-8', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// Boxes: the drawn regions are eight 2-row x 4-column blocks tiling the
// grid (rows 1-2/3-4/5-6/7-8 x columns 1-4/5-8); derived here rather than
// hand-transcribed.
const BOXES = [1, 3, 5, 7].flatMap(r0 => [1, 5].map(c0 =>
  graph.block(makeCellId(r0, c0), 2, 4)));
const ROWS = graph.rows();
const COLS = graph.columns();
const GROUPS = [...ROWS, ...COLS, ...BOXES];

// --- Region-identity overlays -----------------------------------------
// A "region" is a maximal orthogonally-connected group of equal-valued
// cells. Its identity is the (row, col) of its first cell in reading order
// (its root); every cell also carries its graph distance from that root, so
// the size of a region can be counted and compared to a digit's own value.
// Three grid-shaped overlays carry this (no split-digit trick needed: the
// largest possible region is 8 cells, well inside one cell's own alphabet):
//   rootRow, rootCol - coordinates of this cell's region's root.
//   depth            - this cell's distance from that root (0 at the root).
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

// One Var per digit 1-8, holding whether that digit is a sudoku digit or an
// omino digit. Not grid-shaped -- it is a fact about a *value*, not a cell.
const typeVar = new Var('S', 'digit type: 1 = sudoku digit, 2 = omino digit', 8);
const T = typeVar.cells(); // T[d - 1] is digit d's type.

const domains = [
  restrict(graph, range(1, 8)),      // the playable grid: real digits only
  restrict(rootRow, range(1, 8)),
  restrict(rootCol, range(1, 8)),
  restrict(depth, range(0, 7)),      // longest possible chain: 7 steps
  ...T.map(v => new Given(v, SUDOKU, OMINO)),
];

// Reads [rootRow, rootCol, depth] of one cell (row, col known at build time).
// The named root must not come after the cell in reading order, and depth is
// 0 exactly when the cell names itself (is its own root).
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = `${row}_${col}`;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          if (value > row) return undefined;
          return { phase: 1, rowEq: value === row };
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
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), depth.at(cell));
});

// Every cell other than a root has an orthogonal neighbour holding the same
// digit whose depth is exactly one less -- a monotone descent to the root.
const sameDigit = Pair.fnToKey((a, b) => a === b, shape);
const oneNearer = Pair.fnToKey((mine, other) => other === mine - 1, shape);
const descents = cells.map(cell => new Or([
  new Given(depth.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new Pair(sameDigit, 'same digit as the nearer neighbour', cell, other),
    new Pair(oneNearer, 'neighbour is one step nearer the root',
      depth.at(cell), depth.at(other)),
  ])),
]));

// One combined check per orthogonal edge: (1) the two cells hold equal
// digits exactly when they share a region -- this is what stops two
// separate same-digit regions from sitting unmerged next to each other, and
// (2) within one region, depth changes by at most one across the edge. (1)
// plus the existential descent above forces depth to be the true distance
// from the root, not merely some consistent labelling -- otherwise a region
// with a cycle in its adjacency (e.g. a 2x2 block) would admit several
// depth assignments for the same grid and the search would see a unique
// puzzle as non-unique.
const edgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, va: value };
    if (state.phase === 1) return { phase: 2, sameValue: value === state.va };
    if (state.phase === 2) return { phase: 3, sameValue: state.sameValue, ra: value };
    if (state.phase === 3) {
      return { phase: 4, sameValue: state.sameValue, rowSame: value === state.ra };
    }
    if (state.phase === 4) {
      return { phase: 5, sameValue: state.sameValue, rowSame: state.rowSame, ca: value };
    }
    if (state.phase === 5) {
      const sameRegion = state.rowSame && value === state.ca;
      if (sameRegion !== state.sameValue) return undefined;
      return { phase: 6, sameRegion };
    }
    if (state.phase === 6) return { phase: 7, sameRegion: state.sameRegion, da: value };
    if (state.phase === 7) {
      if (!state.sameRegion) return { phase: 8 };
      return Math.abs(value - state.da) <= 1 ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);
const orthEdges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));
const edgeRules = orthEdges.map(([a, b]) => new NFA(edgeSpec,
  'equal digits exactly within a region, depth changes by at most one',
  a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
  depth.at(a), depth.at(b)));

// Reads, for one cell: [depth, digit, T1..T8, then (rootRow, rootCol) of
// every cell at or after it in reading order]. A cell at depth 0 is a
// region's root, and always names itself first among the pairs scanned
// below. Its digit selects which type-Var (T1..T8) applies: a sudoku-digit
// root just needs that self-match and nothing more (sudoku digits are
// already forced to singleton regions by the row/column/box rule below, via
// groupGates); an omino-digit root needs exactly that many namers in total
// (itself included) -- the omino's size must equal its own digit.
const sizeSpecs = new Map();
const sizeSpec = (row, col) => {
  const key = `${row}_${col}`;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'depth' },
      transition: (state, value) => {
        if (state.phase === 'depth') return { phase: 'digit', isRoot: value === 0 };
        if (state.phase === 'digit') {
          return { phase: 'type', tIdx: 0, isRoot: state.isRoot, target: value, isOmino: false };
        }
        if (state.phase === 'type') {
          const idx = state.tIdx + 1; // 1-based position among T1..T8
          const isOmino = idx === state.target ? (value === OMINO) : state.isOmino;
          if (idx < 8) {
            return { phase: 'type', tIdx: idx, isRoot: state.isRoot, target: state.target, isOmino };
          }
          // A root always names itself first in the scan below, so even a
          // sudoku-digit root (no size to check) needs rem = 1 to absorb
          // that mandatory self-match; a non-root expects no namers at all.
          const rem = state.isRoot ? (isOmino ? state.target : 1) : 0;
          return { phase: 'row', rem };
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
    }, shape));
  }
  return sizeSpecs.get(key);
};
const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col),
    "an omino root's later namers equal its own digit in count",
    depth.at(cell), cell, ...T,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// One check per diagonal edge: two cells holding the same digit, where that
// digit is an omino digit, may not belong to different regions -- "two
// ominoes of the same size may not touch, not even diagonally" (an omino's
// size is its own digit, and different digits have different sizes, so
// "same size" means "same digit" here). Reads [digit(a), digit(b), T1..T8,
// rootRow(a), rootRow(b), rootCol(a), rootCol(b)].
const diagSpec = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', va: value };
    if (state.phase === 'b') {
      if (value !== state.va) return { phase: 'skip', left: 12 }; // 8 T's + 4 roots
      return { phase: 'type', tIdx: 0, target: value, isOmino: false };
    }
    if (state.phase === 'skip') {
      return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
    if (state.phase === 'type') {
      const idx = state.tIdx + 1;
      const isOmino = idx === state.target ? (value === OMINO) : state.isOmino;
      if (idx < 8) return { phase: 'type', tIdx: idx, target: state.target, isOmino };
      return { phase: 'rootRowA', isOmino };
    }
    if (state.phase === 'rootRowA') return { phase: 'rootRowB', isOmino: state.isOmino, ra: value };
    if (state.phase === 'rootRowB') {
      return { phase: 'rootColA', isOmino: state.isOmino, rowSame: value === state.ra };
    }
    if (state.phase === 'rootColA') {
      return { phase: 'rootColB', isOmino: state.isOmino, rowSame: state.rowSame, ca: value };
    }
    if (state.phase === 'rootColB') {
      const sameRegion = state.rowSame && value === state.ca;
      return (!state.isOmino || sameRegion) ? { phase: 'done' } : undefined;
    }
    if (state.phase === 'done') return { phase: 'done' };
    return undefined;
  },
  accept: state => state.phase === 'done',
}, shape);
const diagEdges = cells.flatMap(cell => [[1, -1], [1, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));
const diagRules = diagEdges.map(([a, b]) => new NFA(diagSpec,
  'same-digit ominoes may not touch diagonally',
  a, b, ...T, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)));

// A sudoku digit appears exactly once in every row, column and box; an
// omino digit is unconstrained by this (it is bound by the omino rules
// above instead). "At most one per group" plus every digit appearing
// exactly 8 times (COUNT_RULE below, unconditional on type) forces "exactly
// once per group" for a sudoku digit by pigeonhole over 8 groups of each
// kind. Reads [T_d, ...group cells] (9 symbols); one spec per digit, reused
// over its 8 rows + 8 columns + 8 boxes.
const gateSpecs = range(1, 8).map(d => NFA.encodeSpec({
  startState: { phase: 'read-type' },
  transition: (state, value) => {
    if (state.phase === 'read-type') {
      if (value === SUDOKU) return { phase: 'sudoku', count: 0 };
      if (value === OMINO) return { phase: 'omino' };
      return undefined;
    }
    if (state.phase === 'omino') return state;
    const hit = value === d ? 1 : 0;
    return { phase: 'sudoku', count: Math.min(state.count + hit, 2) };
  },
  accept: state => state.phase === 'omino' || state.count <= 1,
}, shape));
const groupGates = range(1, 8).flatMap(d => GROUPS.map(group =>
  new NFA(gateSpecs[d - 1], `digit ${d} is at most once per group if a sudoku digit`,
    T[d - 1], ...group)));

// Every digit 1-8 appears exactly 8 times in the grid, whatever its type.
const COUNT_RULE = new ContainExact(
  range(1, 8).flatMap(d => Array(8).fill(d)).join('_'), ...cells);

// Circles: 27 drawn single-cell markers. A digit on a circle names how many
// of these 27 cells hold that same digit.
const CIRCLE_CELLS = [
  [3, 5], [4, 5], [4, 6], [3, 6], [3, 7], [3, 8], [4, 8], [4, 7],
  [1, 3], [1, 5], [1, 7], [2, 5], [2, 6], [2, 7], [2, 8],
  [3, 4],
  [6, 2], [6, 3], [6, 5],
  [5, 6], [5, 7],
  [6, 8],
  [7, 4], [8, 4],
  [7, 5],
  [7, 7],
  [8, 6],
].map(([r, c]) => makeCellId(r, c));
const CIRCLES = new CountingCircles(...CIRCLE_CELLS);

// White dots: 7 drawn rounded, textless edge markers.
const DOTS = [
  [[5, 5], [5, 6]],
  [[6, 7], [6, 8]],
  [[8, 1], [8, 2]],
  [[3, 1], [3, 2]],
  [[1, 7], [2, 7]],
  [[3, 5], [3, 6]],
  [[5, 1], [5, 2]],
].map(([a, b]) => new WhiteDot(makeCellId(...a), makeCellId(...b)));

return [
  shape,
  rootRow.toVar('region root row'),
  rootCol.toVar('region root column'),
  depth.toVar('distance to the region root'),
  typeVar,
  ...domains,
  ...roots,
  ...descents,
  ...edgeRules,
  ...sizes,
  ...diagRules,
  ...groupGates,
  COUNT_RULE,
  CIRCLES,
  ...DOTS,
];
