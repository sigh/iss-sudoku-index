// Title: Fillominosaurus
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=byiVj-en91A
// Source: https://sudokupad.app/xpkfq77yk0

// The grid is a dinosaur silhouette cut out of a 10x11 canvas: 64 cells are
// playable, the other 46 are outside the drawn shape and hold no digit. No
// Sudoku layer applies to the playable cells either, so the board is Raw.
//
// Rules encoded:
//  * Fillomino: divide the playable cells into orthogonally connected
//    regions and fill every cell with a digit equal to its own region's
//    size; two regions of the same size never share a border (diagonal
//    contact is allowed). The stated "maximum size of 9 cells" falls out of
//    the board's own 1-9 alphabet: a region of size 10+ would need a digit
//    the board cannot hold.
//  * Dark green line: adjacent digits along the line differ by exactly 5.
//  * White dot: the two cells it sits between hold consecutive digits.
//  * Gum cells (the eight playable cells a drawn tooth is attached to; the
//    teeth themselves hang off the shape's edge and are not grid cells)
//    hold eight different digits.
//
// Omitted:
//  * The circled cell R2C5 ("the digit in the circle shows how many times
//    it appears in that circle"): the payload draws one single-cell,
//    ringless circle, so nothing local fixes what "that circle" ranges
//    over.

const ROWS = 10;
const COLS = 11;
const MOD_A = 11;
const MOD_B = 13; // lcm(11, 13) = 143 > 64 playable cells, so the residue
                   // pair below is the true distance to a region's root,
                   // not just a cycle.

// The playable columns in each row (1-indexed), read off the drawn shape.
const PLAYABLE_COLS = {
  1: [3, 4, 5],
  2: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  5: [1, 2, 3],
  6: [1, 2, 3, 4],
  7: [1, 2, 3, 4, 5, 6],
  8: [1, 2, 3, 4, 5, 6, 7, 8],
  9: [1, 2, 6, 7, 8, 9, 10],
  10: [9, 10],
};
const isPlayableRC = (row, col) => (PLAYABLE_COLS[row] || []).includes(col);

// Widened to 0-12 so the root-row/root-column/distance overlays (up to 12)
// fit the same value alphabet as the board; the board's own digits are
// restricted back to 1-9 (or, off the drawn shape, pinned to 0) below.
const shape = new Shape('10x11', '0-12', 'Raw');
const graph = cellGraph(shape);
const allCells = graph.cells();
const isPlayableCell = cell => {
  const { row, col } = parseCellId(cell);
  return isPlayableRC(row, col);
};
const playCells = allCells.filter(isPlayableCell);
const blankCells = allCells.filter(cell => !isPlayableCell(cell));

// A region is the set of cells naming the same root, where a region's root is
// its first cell in reading order. Four whole-grid overlays carry it:
//   rootRow, rootCol - which cell is the root of this cell's region;
//   d11, d13         - the cell's distance from its root, as residues mod 11
//                       and mod 13.
// Off-shape cells take no part in any of this; their four overlay values are
// pinned below purely so they do not each contribute a free choice.
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
// Replicate a same-domain Given across many cells rather than stamping one
// copy per cell (each group below shares one value set). A blank cell's
// pinned value always sits inside the wider domain covering every cell, so
// each pair below is a wide restatement over the whole grid narrowed further
// on one side of the play/blank split, never a target list that excludes a
// cell a narrower Given elsewhere still pins.
const boardReplicate = (cells, values) =>
  graph.makeReplicate(new Given(allCells[0], ...values), cells);
const overlayReplicate = (overlay, cells, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values), cells.map(c => overlay.at(c)));
const domains = [
  boardReplicate(allCells, range(0, 9)),
  boardReplicate(playCells, range(1, 9)),
  boardReplicate(blankCells, [0]),
  overlayReplicate(rootRow, allCells, range(1, ROWS)),
  overlayReplicate(rootRow, blankCells, [1]),
  overlayReplicate(rootCol, allCells, range(1, COLS)),
  overlayReplicate(rootCol, blankCells, [1]),
  overlayReplicate(d11, allCells, range(0, MOD_A - 1)),
  overlayReplicate(d11, blankCells, [0]),
  overlayReplicate(d13, allCells, range(0, MOD_B - 1)),
  overlayReplicate(d13, blankCells, [0]),
];

// Reads [rootRow, rootCol, d11, d13] of one cell. The root named must not
// come after the cell in reading order, and the cell is at distance 0
// exactly when it is its own root.
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
          return { phase: 3, self: state.self, zero: value === 0 };
        }
        if (state.phase === 3) {
          const zero = state.zero && value === 0;
          return zero === state.self ? { phase: 4 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 4,
    }, shape));
  }
  return rootSpecs.get(key);
};

const roots = playCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), d11.at(cell), d13.at(cell));
});

// Every cell other than a root has an orthogonal neighbour, also on the
// drawn shape, in its own region one step nearer the root. Following such
// neighbours changes the residue pair by one each step, so the walk cannot
// revisit a cell within 143 steps and must reach a root: the region is
// connected and contains the cell it names.
const playNeighbours = cell => graph.neighbours(cell).filter(isPlayableCell);
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = playCells.map(cell => new Or([
  new And([new Given(d11.at(cell), 0), new Given(d13.at(cell), 0)]),
  ...playNeighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepA, 'one step nearer the root', d11.at(cell), d11.at(other)),
    new Pair(stepB, 'one step nearer the root', d13.at(cell), d13.at(other)),
  ])),
]));

// Reads [d11(cell), d13(cell), cell's own digit, then rootRow and rootCol of
// this cell and of every playable cell after it in reading order]. A cell at
// distance 0 is a root, and exactly its digit's worth of cells name it; only
// cells at or after it in reading order can, so `maxArea` (how many there
// are) bounds the count. A cell at positive distance is named by nobody.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'd11' },
      transition: (state, value) => {
        if (state.phase === 'd11') return { phase: 'd13', zero: value === 0 };
        if (state.phase === 'd13') {
          return state.zero && value === 0 ? { phase: 'size' } : { phase: 'skip' };
        }
        if (state.phase === 'skip') {
          // Not a root: its own digit is read past, then nobody may name it.
          return { phase: 'row', rem: 0 };
        }
        if (state.phase === 'size') {
          return value <= maxArea ? { phase: 'row', rem: value } : undefined;
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

const sizes = playCells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = playCells.slice(i);
  return new NFA(sizeSpec(row, col, later.length), 'region size equals its own digit',
    d11.at(cell), d13.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b)] and ends in a state
// recording whether a and b are in the same region.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Reads [digit(a), digit(b), rootRow(a), rootRow(b), rootCol(a), rootCol(b)]
// for one orthogonal edge between two playable cells: the two digits are
// equal exactly when the two cells are in the same region. This is what
// keeps two same-size regions from sharing a border -- equal digits on
// either side of a border would force the same root, contradicting the
// border.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameNumber: value === state.mine };
    if (state.phase === 2) return { phase: 3, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameNumber: state.sameNumber, same: value === state.mine };
    }
    if (state.phase === 4) return { phase: 5, sameNumber: state.sameNumber, same: state.same, mine: value };
    if (state.phase === 5) {
      const sameRegion = state.same && value === state.mine;
      return sameRegion === state.sameNumber ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), d11(a), d11(b),
// d13(a), d13(b)]: within a region, one step changes the distance to the
// root by -1, 0 or +1, the same amount in both residues. This is what makes
// the residue pair the true distance rather than any descending chain.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRegion(state, value);
    // Different regions: the four residues are unconstrained, read them past.
    if (!state.same) {
      return state.phase < 8 ? { phase: state.phase + 1, same: false } : undefined;
    }
    if (state.phase === 4) return { phase: 5, same: true, mine: value };
    if (state.phase === 5) {
      const delta = (value - state.mine + MOD_A) % MOD_A;
      if (delta !== 0 && delta !== 1 && delta !== MOD_A - 1) return undefined;
      return { phase: 6, same: true, delta: delta === MOD_A - 1 ? -1 : delta };
    }
    if (state.phase === 6) return { phase: 7, same: true, delta: state.delta, mine: value };
    if (state.phase === 7) {
      const delta = (value - state.mine + MOD_B) % MOD_B;
      const expected = (state.delta + MOD_B) % MOD_B;
      return delta === expected ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

const edges = playCells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return (other && isPlayableCell(other)) ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal digits exactly within a region',
    a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// Cell references above column/row 9 need makeCellId (its base-17 R.C.
// encoding), not a literal 'R_C10'-style string.
const cellAt = (row, col) => makeCellId(row, col);

// Dark green line: each pair of cells adjacent along the drawn line differs
// by exactly 5 (provenance: the six drawn dark-green line segments).
const diff5 = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, shape);
const GREEN_LINES = [
  [[2, 4], [3, 5]],
  [[3, 3], [4, 4]],
  [[9, 1], [8, 1], [8, 2], [7, 2], [7, 3], [6, 3]],
  [[2, 3], [3, 4]],
  [[8, 7], [8, 8]],
  [[3, 2], [4, 3]],
];
const greenLineRules = GREEN_LINES.flatMap(chain => {
  const ids = chain.map(([r, c]) => cellAt(r, c));
  return ids.slice(1).map((b, i) => new Pair(diff5, 'differ by exactly 5', ids[i], b));
});

// White dot: the two cells it sits between are consecutive (provenance: the
// two edge-sized white-filled, black-bordered rounded marks drawn on the
// grid).
const WHITE_DOTS = [
  [[3, 10], [4, 10]],
  [[3, 11], [4, 11]],
];
const whiteDotRules = WHITE_DOTS.map(([[r1, c1], [r2, c2]]) =>
  new WhiteDot(cellAt(r1, c1), cellAt(r2, c2)));

// Gum cells: the eight playable cells a tooth is drawn hanging off of.
// Each tooth is an oversized rotated "V" mark whose reported centre falls
// off the drawn shape, spanning three candidate rows at its column; in
// every case exactly one of those rows is on the shape, which is the gum
// cell (the tooth's other candidate rows are the open background the tooth
// tip hangs into). All different.
const GUM_CELLS = [
  [4, 7], [4, 8], [4, 9], [4, 10], [8, 7], [8, 8], [9, 9], [9, 10],
].map(([r, c]) => cellAt(r, c));
const gumAllDifferent = new AllDifferent(...GUM_CELLS);

return [
  shape,
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...domains,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...greenLineRules,
  ...whiteDotRules,
  gumAllDifferent,
];
