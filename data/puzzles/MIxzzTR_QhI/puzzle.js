// Title: Sum Fillomino
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=MIxzzTR_QhI
// Source: https://sudokupad.app/b2ocygdq48

// Sum Fillomino, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and numbers repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into orthogonally connected regions; each
//    cell holds a number equal to the number of cells in its own region.
//  * Regions of the same size never share an edge. This is not a separate
//    constraint below: `numberEdgeSpec` already forces two orthogonally
//    adjacent cells with equal numbers to name the same region root, so two
//    *different* regions of equal size meeting at an edge is already
//    excluded by the Fillomino model itself (they would have to carry equal
//    numbers there without being the same region).
//  * Sixteen outside clues, each giving the sum of the first X numbers read
//    into the grid from that clue, where X is the number in the first
//    (nearest) cell -- the standard `XSum` rule (`js/sudoku_constraint.js`'s
//    `XSum.DESCRIPTION`: "The sum of the first X numbers must add up to the
//    given sum. X is the number in the first cell in the direction of the
//    row or column"), which this puzzle's rules text matches almost
//    verbatim. Each clue's underlay sits exactly level with the row/column
//    it names (the ordinary position for a straight outside clue); nothing
//    draws an arrow or otherwise commits to a diagonal, so the straight
//    row/column reading is what is encoded.
//
// Nothing is omitted. A region may run to the board's 100 cells, so a number
// does not fit one 16-value cell: every cell's number is held as its tens
// digit on an overlay and its units digit on the board.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's root
// is its first cell in reading order. Five overlays carry the Fillomino:
//   tens     - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol  - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const MOD_A = 11;
const MOD_B = 13;

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

// ---- Fillomino ----

// Reads [rootRow, rootCol, d11, d13] of one cell. The root named must not come
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
    rootRow.at(cell), rootCol.at(cell), d11.at(cell), d13.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// one step nearer the root. Following such neighbours changes the residue pair
// by one each step, so the walk cannot revisit a cell within 143 steps and must
// reach a root: the region is connected and contains the cell it names.
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = cells.map(cell => new Or([
  new And([new Given(d11.at(cell), 0), new Given(d13.at(cell), 0)]),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepA, 'one step nearer the root', d11.at(cell), d11.at(other)),
    new Pair(stepB, 'one step nearer the root', d13.at(cell), d13.at(other)),
  ])),
]));

// Reads [d11(cell), d13(cell), tens(cell), units(cell), then rootRow and
// rootCol of this cell and of every cell after it in reading order]. A cell at
// distance 0 is a root, and exactly its number's worth of cells name it; only
// cells at or after it in reading order can, so `maxArea` (how many there are)
// bounds the count. A cell at positive distance is named by nobody.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'd11' },
      transition: (state, value) => {
        if (state.phase === 'd11') return { phase: 'd13', zero: value === 0 };
        if (state.phase === 'd13') {
          return state.zero && value === 0
            ? { phase: 'tens' } : { phase: 'skip', left: 2 };
        }
        if (state.phase === 'skip') {
          // Not a root: its own number is read past, then nobody may name it.
          return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'row', rem: 0 };
        }
        if (state.phase === 'tens') {
          return 10 * value <= maxArea ? { phase: 'units', rem: 10 * value } : undefined;
        }
        if (state.phase === 'units') {
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
    d11.at(cell), d13.at(cell), tens.at(cell), cell,
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

// Reads [tens(a), tens(b), units(a), units(b), rootRow(a), rootRow(b),
// rootCol(a), rootCol(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells are in the same region. This is also what stops
// two equal-size regions from sharing an edge: they would have to carry equal
// numbers across the boundary without being the same region.
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

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), d11(a), d11(b),
// d13(a), d13(b)]: within a region, one step changes the distance to the root
// by -1, 0 or +1, the same amount in both residues. This is what makes the
// residue pair the true distance rather than any descending chain.
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

const regionEdgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// ---- Sixteen outside X-Sum clues ----

// Transcribed from the sixteen text badges drawn outside the grid: [edge,
// row-or-column, clue total]. `bottom`/`top` name a column read
// upward/downward; `left`/`right` name a row read rightward/leftward, in
// each case starting at the cell nearest the clue.
const LANES = [
  ['bottom', 1, 7], ['bottom', 3, 19], ['bottom', 4, 6],
  ['left', 1, 9], ['left', 3, 4], ['left', 5, 6], ['left', 7, 8], ['left', 10, 7],
  ['right', 2, 15], ['right', 4, 8], ['right', 5, 5], ['right', 7, 13], ['right', 9, 25],
  ['top', 2, 20], ['top', 4, 20], ['top', 6, 20],
];

const laneCells = ([side, lane]) => {
  if (side === 'bottom') return graph.ray(makeCellId(SIDE, lane), -1, 0);
  if (side === 'top') return graph.ray(makeCellId(1, lane), 1, 0);
  if (side === 'left') return graph.ray(makeCellId(lane, 1), 0, 1);
  return graph.ray(makeCellId(lane, SIDE), 0, -1);   // right
};

// Reads [tens, units] of the lane's ten cells, nearest the clue first (the
// standard ISS `XSum` rule). The first cell's number is X; the running sum
// starts at X (the first cell counts once, for itself) and gains each further
// cell's number until X cells have been counted. X must leave enough cells to
// finish the count (X <= SIDE). No explicit position counter is kept: the NFA
// always consumes exactly ten (tens, units) pairs (the lane is fixed at SIDE
// cells), so `accept` alone -- checked only once, after every pair is read --
// is where "exactly X cells counted" is settled.
//
// Two prunes keep this well under the 4096-state cap. First, the running sum
// is abandoned the moment it would exceed the target (an exceeded sum can
// never recover). Second, once `remaining` (cells still to add) reaches 0, a
// cell's own number no longer affects anything, so its tens digit is not kept
// in state at all -- without this, every later cell's tens digit (up to 11
// values) would multiply out a dimension the rule never uses again.
const xSumSpecs = new Map();
const xSumSpec = (target) => {
  if (!xSumSpecs.has(target)) {
    xSumSpecs.set(target, NFA.encodeSpec({
      startState: { phase: 'tens0' },
      transition: (state, value) => {
        if (state.phase === 'tens0') return { phase: 'units0', tens: value };
        if (state.phase === 'units0') {
          const x = 10 * state.tens + value;
          if (x < 1 || x > SIDE || x > target) return undefined;
          return { phase: 'tens', remaining: x - 1, sum: x };
        }
        if (state.phase === 'tens') {
          const { remaining, sum } = state;
          if (remaining === 0) return { phase: 'units', remaining, sum };
          if (sum + 10 * value > target) return undefined;
          return { phase: 'units', remaining, sum, tens: value };
        }
        // phase === 'units'
        const { remaining, sum, tens } = state;
        if (remaining === 0) return { phase: 'tens', remaining, sum };
        const newSum = sum + 10 * tens + value;
        if (newSum > target) return undefined;
        return { phase: 'tens', remaining: remaining - 1, sum: newSum };
      },
      accept: state =>
        state.phase === 'tens' && state.remaining === 0 && state.sum === target,
    }, shape));
  }
  return xSumSpecs.get(target);
};

const xSumRules = LANES.map(entry => {
  const [side, lane, target] = entry;
  const laneCellIds = laneCells(entry);
  return new NFA(xSumSpec(target), `X-Sum ${side} of ${lane}`,
    ...laneCellIds.flatMap(c => [tens.at(c), c]));
});

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...domains,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...regionEdgeRules,
  ...xSumRules,
];
