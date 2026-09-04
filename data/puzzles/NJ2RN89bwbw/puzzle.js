// Title: Aqre Fillomino
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=NJ2RN89bwbw
// Source: https://app.crackingthecryptic.com/sudoku/Br6j7NpNJm

// Fillomino/Aqre hybrid, 15x11. There is no Sudoku layer, so the grid is Raw:
// rows, columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino ("divide the grid into regions of orthogonally connected
//    cells so that no two regions of the same size share an edge; enter a
//    number into each cell equal to the size of its region"). Equivalent and
//    used here: every maximal orthogonally-connected group of cells sharing
//    one value is a region, and the shared value must equal the group's cell
//    count -- no separate region-partition variable, the board digits
//    themselves carry it.
//  * The 26 given numbers (22 single-digit, 4 drawn as an "11" text overlay
//    because a plain given cell holds one digit).
//  * Aqre parity run: no more than 3 consecutive cells of the same parity
//    (odd/even value) in any row or column.
//  * Aqre connectivity: every odd-valued cell is orthogonally connected to
//    every other odd-valued cell (one connected region).
//
// Region sizes can in principle run up to all 165 cells, past the 16-value
// alphabet cap (CellGeometry.MAX_SIZE): one 0-15 cell cannot hold a number
// past 15. So a cell's number is split across two layers instead of widening
// past the cap: a "hi" overlay and the board's own value "lo", with
// number = hi*HI_BASE + lo. A base-10 split (tens digit on the overlay, units
// on the board) is the natural choice, but floor(165/10) = 16 would need a
// 17-value tens overlay (0-16), one past the cap -- so this split uses base
// 14 instead: "hi" ranges 0-11, "lo" ranges 0-13, covering every area up to
// 11*14+13 = 167. Base 14 is even, which also keeps the two Aqre rules
// cheap: since hi*14 is always even, a number's parity equals lo's parity,
// so both Aqre rules read straight off the board -- no extra parity overlay
// needed.
const ROWS = 15;
const COLS = 11;
const MAX_AREA = ROWS * COLS;                  // 165
const HI_BASE = 14;
const MAX_HI = Math.floor(MAX_AREA / HI_BASE); // 11

const shape = new Shape('15x11', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's
// root is its first cell in reading order. Five overlays carry it:
//   hi      - the cell's number, divided by 14 (the board holds the
//             remainder);
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   dA, dB  - the cell's distance from its root, as residues mod 11 and 16
//             (lcm 176 > 165, so the pair is the distance itself, not just a
//             descending chain -- see the `descents` comment).
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
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, HI_BASE - 1))),
  restrict(hi, range(0, MAX_HI)),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(dA, range(0, MOD_A - 1)),
  restrict(dB, range(0, MOD_B - 1)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((h, l) => h > 0 || l > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', hi.at(cell), cell));

// Reads [rootRow, rootCol, dA, dB] of one cell. The root named must not come
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
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), dA.at(cell), dB.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// one step nearer the root. Following such neighbours changes the residue
// pair by one each step, so the walk cannot revisit a cell within 176 steps
// (more than the 165 cells on the board) and must reach a root: the region
// is connected and contains the cell it names.
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
// this cell and of every cell after it in reading order]. A cell at distance
// 0 is a root, and exactly its number's worth of cells name it; only cells at
// or after it in reading order can, so `maxArea` (how many there are) bounds
// the count. A cell at positive distance is named by nobody.
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

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col, later.length), 'region size equals its number',
    dA.at(cell), dB.at(cell), hi.at(cell), cell,
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

// Reads [hi(a), hi(b), lo(a), lo(b), rootRow(a), rootRow(b), rootCol(a),
// rootCol(b)] for one orthogonal edge: the two numbers are equal exactly when
// the two cells are in the same region. This is what makes "no two regions of
// the same size share an edge" hold: two different regions never carry equal
// numbers, and a region's own number is its size, so adjacent regions always
// differ in size.
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
// or +1, the same amount in both residues. This is what makes the residue
// pair the true distance rather than any descending chain.
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

// Transcribed from the 26 numbers printed in the grid -- 22 as plain given
// digits, 4 ("11", at R6C2, R6C6, R13C5, R12C11) as text overlays at cell
// centres: [row, col, number].
const GIVENS = [
  [1, 2, 8], [1, 5, 4], [1, 7, 3], [1, 10, 3],
  [2, 1, 4], [2, 11, 7],
  [3, 2, 1], [3, 10, 2],
  [4, 5, 3], [4, 7, 2],
  [5, 1, 6], [5, 11, 4],
  [6, 2, 11], [6, 6, 11], [6, 10, 1],
  [8, 3, 5], [8, 9, 4],
  [10, 6, 1],
  [11, 6, 3],
  [12, 1, 6], [12, 11, 11],
  [13, 5, 11], [13, 7, 8],
  [14, 5, 4], [14, 6, 1], [14, 7, 8],
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(hi.at(cell), Math.floor(number / HI_BASE)),
    new Given(cell, number % HI_BASE),
  ];
});

// Aqre parity run: an NFA over a row or column's raw board values (each
// cell's `lo`, whose parity is the number's own parity since HI_BASE is
// even) tracking the length of the current same-parity run and rejecting a
// fourth same-parity cell in a row.
const parityRunSpec = NFA.encodeSpec({
  startState: { parity: null, run: 0 },
  transition: ({ parity, run }, value) => {
    const p = value % 2;
    const nextRun = p === parity ? run + 1 : 1;
    return nextRun > 3 ? undefined : { parity: p, run: nextRun };
  },
  accept: () => true,
}, shape);
const noLongRuns = [...graph.rows(), ...graph.columns()].map(
  (line, i) => new NFA(parityRunSpec, `parity-run-${i}`, ...line));

// Aqre connectivity: every odd-valued cell (odd `lo`, which is every
// odd-valued cell on the board for the same even-HI_BASE reason above) forms
// one orthogonally-connected region. Directly on the main grid -- no overlay
// needed, since ConnectedValues with an empty group prefix reads the board.
const oddConnected = new ConnectedValues('', range(1, HI_BASE - 1).filter(v => v % 2 === 1));

return [
  shape,
  hi.toVar('number divided by 14'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  dA.toVar('distance to root mod 11'),
  dB.toVar('distance to root mod 16'),
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...noLongRuns,
  oddConnected,
];
