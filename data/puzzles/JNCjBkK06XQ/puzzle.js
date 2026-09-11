// Title: Top Right Boi
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=JNCjBkK06XQ
// Source: https://sudokupad.app/5dhw33gsql

// Pure region-partition puzzle on a 12x12 board, no Sudoku layer: the grid is
// Raw, so rows, columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino: the grid is divided into orthogonally connected regions, every
//    cell holds a number equal to the size of its own region, and two regions
//    of the same size may not share an edge.
//  * Top Right Boi: every region contains a cell such that no cell of the
//    region is further east (larger column) or further north (smaller row)
//    than it -- i.e. the corner (minimum row, maximum column) of the region's
//    bounding box is itself a cell of the region.
//  * The 20 printed numbers (8 given cell values, 12 two-digit text overlays).
//
// Not encoded, because it is not a rule about the grid: "For the solution
// check to work, for all regions with less than 10 cells, fill cells with the
// digit equal to the size of the region." That sentence tells the solver how
// to type an answer into the source's answer-check widget, which holds one
// character per cell and so cannot accept a region size of 10 or more.
//
// A region can in principle hold all 144 cells, and one given is already 17,
// past the 16-value alphabet cap (CellGeometry.MAX_SIZE): a single cell cannot
// hold a number above 15. So a cell's number is split across two layers,
// number = hi * 10 + lo, with "lo" the board's own value and "hi" a tens
// overlay ranging 0-14 (floor(144 / 10) = 14, inside the cap). The split is
// base 10 rather than any other base the alphabet allows because the source
// splits its own answer entry at ten ("for all regions with less than 10
// cells, fill cells with the digit equal to the size of the region"): at base
// 10 the board carries exactly the digit that rule asks for, and "hi is zero"
// is exactly "this region is small enough to write down".
const ROWS = 12;
const COLS = 12;
const MAX_AREA = ROWS * COLS;                  // 144
const HI_BASE = 10;
const MAX_HI = Math.floor(MAX_AREA / HI_BASE); // 14

// The alphabet is 16 values because the overlays need them (root coordinates
// run to 12, dB to 15); the board's own cells are cut back to one decimal
// digit in `domains` below.
const shape = new Shape('12x12', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells naming the same root, and the root is taken to
// be the region's Top Right Boi. That choice is what encodes the second rule:
// the machinery below forces the named root to lie inside the region, and the
// per-cell test forces every cell to be at or below the root's row and at or
// left of the root's column. Nothing else is needed for it, and no canonical
// tie-break is needed either -- the Top Right Boi is unique in its region when
// it exists, so the labelling is a function of the partition. Five overlays:
//   hi      - the cell's number divided by 10 (the board holds the units);
//   rootRow
//   rootCol - the Top Right Boi of this cell's region;
//   dA, dB  - the cell's distance from that root, as residues mod 11 and mod
//             16 (lcm 176 > 144 cells, so the pair is the distance itself and
//             not merely a descending chain -- see `descents`).
const hi = graph.makeOverlay('VH');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const dA = graph.makeOverlay('VA');
const dB = graph.makeOverlay('VB');
const MOD_A = 11;
const MOD_B = 16;

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
// `dB` needs no restriction: it uses the board's whole 0-15 alphabet.
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, HI_BASE - 1))),
  restrict(hi, range(0, MAX_HI)),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(dA, range(0, MOD_A - 1)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((h, l) => h > 0 || l > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', hi.at(cell), cell));

// Reads [rootRow, rootCol, dA, dB] of one cell. The root named must be no
// further south and no further west than the cell itself, and the cell is at
// distance 0 exactly when it is that root.
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
          if (value < col) return undefined;
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

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is north-east of the cell',
    rootRow.at(cell), rootCol.at(cell), dA.at(cell), dB.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// one step nearer the root. Following such neighbours changes the residue pair
// by one each step, so the walk cannot revisit a cell within 176 steps (more
// than the 144 cells on the board) and must reach a root: the region is
// connected and contains the cell it names.
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = cells.map(cell => new Or([
  new And([new Given(dA.at(cell), 0), new Given(dB.at(cell), 0)]),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepA, 'one step nearer the root', dA.at(cell), dA.at(other)),
    new Pair(stepB, 'one step nearer the root', dB.at(cell), dB.at(other)),
  ])),
]));

// Reads [dA(cell), dB(cell), hi(cell), lo(cell), then rootRow and rootCol of
// this cell and of every cell that could name it]. A cell at distance 0 is a
// root, and exactly its number's worth of cells name it; by the root test above
// only cells at or below its row and at or left of its column can, so the size
// of that rectangle (`maxArea`) bounds the count. A cell at positive distance
// is named by nobody in the list, which starts with the cell itself.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'dA' },
      transition: (state, value) => {
        if (state.phase === 'dA') return { phase: 'dB', zero: value === 0 };
        if (state.phase === 'dB') {
          return state.zero && value === 0
            ? { phase: 'hi' } : { phase: 'skip', left: 2 };
        }
        if (state.phase === 'skip') {
          // Not a root: its own number is read past, then nobody may name it.
          return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'row', rem: 0 };
        }
        if (state.phase === 'hi') {
          return HI_BASE * value <= maxArea
            ? { phase: 'lo', rem: HI_BASE * value } : undefined;
        }
        if (state.phase === 'lo') {
          const rem = state.rem + value;
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

// The cells that the root test allows to name (row, col): rows at or below it,
// columns at or left of it.
const canName = (row, col) => {
  const list = [];
  for (let r = row; r <= ROWS; r++) {
    for (let c = 1; c <= col; c++) list.push(makeCellId(r, c));
  }
  return list;
};

const sizes = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const namers = canName(row, col);
  return new NFA(sizeSpec(row, col, namers.length), 'region size equals its number',
    dA.at(cell), dB.at(cell), hi.at(cell), cell,
    ...namers.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b)] and ends in a state
// recording whether a and b are in the same region.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Reads [hi(a), hi(b), lo(a), lo(b), rootRow(a), rootRow(b), rootCol(a),
// rootCol(b)] for one orthogonal edge: the two numbers are equal exactly when
// the two cells are in the same region. This is what makes "regions of the same
// size cannot share an edge" hold: two different regions never carry equal
// numbers, and a region's own number is its size, so adjacent regions always
// differ in size. It also makes each region's cells agree on one number.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameNumber: state.same && value === state.mine };
    }
    if (state.phase === 4) return { phase: 5, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 5) {
      return { phase: 6, sameNumber: state.sameNumber, same: value === state.mine };
    }
    if (state.phase === 6) {
      return { phase: 7, sameNumber: state.sameNumber, same: state.same, mine: value };
    }
    if (state.phase === 7) {
      const sameRegion = state.same && value === state.mine;
      return sameRegion === state.sameNumber ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), dA(a), dA(b), dB(a),
// dB(b)]: within a region, one step changes the distance to the root by -1, 0
// or +1, the same amount in both residues. This is what makes the residue pair
// the true distance rather than any descending chain.
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

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    hi.at(a), hi.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    dA.at(a), dA.at(b), dB.at(a), dB.at(b)),
]);

// Transcribed from the 20 numbers printed in the grid -- 8 as plain given cell
// values, 12 (every two-digit one) as text overlays drawn at cell centres:
// [row, col, number].
const GIVENS = [
  [1, 1, 13], [1, 2, 10], [1, 6, 11], [1, 7, 10], [1, 12, 2],
  [2, 12, 5],
  [5, 6, 2],
  [6, 1, 10], [6, 8, 10], [6, 12, 5],
  [7, 1, 14], [7, 5, 10], [7, 12, 10],
  [8, 7, 6],
  [11, 1, 8],
  [12, 1, 6], [12, 6, 10], [12, 7, 5], [12, 11, 10], [12, 12, 17],
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(hi.at(cell), Math.floor(number / HI_BASE)),
    new Given(cell, number % HI_BASE),
  ];
});

return [
  shape,
  hi.toVar('number divided by 10'),
  rootRow.toVar('Top Right Boi row'),
  rootCol.toVar('Top Right Boi column'),
  dA.toVar('distance to root mod 11'),
  dB.toVar('distance to root mod 16'),
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
];
