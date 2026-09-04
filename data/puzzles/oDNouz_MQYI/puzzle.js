// Title: A Fistful of Circles
// Author: Skeptical Mario
// Video: https://www.youtube.com/watch?v=oDNouz_MQYI
// Source: https://sudokupad.app/51pjq2i21m

// A Fistful of Circles, 11x11. There is no Sudoku layer, so the grid is Raw:
// rows, columns and boxes carry no rule and numbers repeat freely.
//
// Rules encoded:
//  * Fillomino-style region division. Divide the grid into orthogonally
//    connected regions of any size (including one cell); every cell holds a
//    number equal to the size of its own region.
//  * Regions of the same size do not share an edge (diagonal contact is
//    allowed).
//  * Counting Circles: a number shown in a circle gives how many of the 41
//    circles hold that same number. A number that never appears in a circle
//    is unconstrained by this rule. "Number" here is the region's true size
//    (rule 1's "number equal to the size of its own region"), not the
//    truncated units digit a >9-cell region prints (rule below) -- the same
//    true-size reading the same-size-adjacency rule already needs, since
//    both rules use the one word "number" defined once, by rule 1.
//  * The 14 single-digit given numbers.
//  * The two printed two-digit totals (R3C8=26, R10C2=15): the region
//    containing that cell has exactly that many cells. "Leave these cells
//    empty" is a solving/entry note (the app can only take one digit and the
//    total is already shown as text) -- the region still occupies the cell,
//    so its board digit is still the total's own units digit (rule below).
//
// Nothing is omitted. Region sizes run to the board's own cap of 121 cells,
// so a size does not fit in one cell of a single-digit alphabet: every
// cell's number is held as its tens digit on an overlay and its printed
// units digit on the board.

const ROWS = 11;
const COLS = 11;
const MAX_AREA = ROWS * COLS;
const MAX_TENS = Math.floor(MAX_AREA / 10); // 12: the tens digit of 121

const shape = new Shape('11x11', '0-12', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's
// root is its first cell in reading order. Five overlays carry it:
//   tens    - tens digit of the cell's number (the board holds the units digit);
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 121, so the pair is the distance itself).
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
  // The board's own printed alphabet is not independently declared by the
  // payload (no digit-range field), so the units digit is left free over
  // 0-9 rather than assumed to skip 0 -- a region whose size is a multiple
  // of ten is not ruled out by any stated rule.
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
];

// A region's true size is at least 1, so tens and units are never both 0.
const positiveKey = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(cell =>
  new Pair(positiveKey, 'region size is positive', tens.at(cell), cell));

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

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), d11.at(cell), d13.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// one step nearer the root. Following such neighbours changes the residue
// pair by one each step, so the walk cannot revisit a cell within 143 steps
// and must reach a root: the region is connected and contains the cell it
// names.
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

// Reads [d11(cell), d13(cell), tens(cell), ones(cell), then rootRow and
// rootCol of this cell and of every cell after it in reading order]. A cell
// at distance 0 is a root, and exactly its number's worth of cells name it;
// only cells at or after it in reading order can, so `maxArea` (how many
// there are) bounds the count. A cell at positive distance is named by
// nobody.
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
          return 10 * value <= maxArea ? { phase: 'ones', rem: 10 * value } : undefined;
        }
        if (state.phase === 'ones') {
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

// Reads [tens(a), tens(b), ones(a), ones(b), rootRow(a), rootRow(b),
// rootCol(a), rootCol(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells are in the same region. This is what enforces
// "regions of the same size cannot share an edge": two touching cells in
// different regions must show different full numbers, so two touching
// regions can never carry equal true sizes (comparing tens and units
// together, not just the printed units digit).
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

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// Transcribed from the payload's `cells` array: [row, col, printed digit].
const GIVENS = [
  [1, 1, 5], [1, 4, 3], [1, 9, 6], [2, 5, 3], [3, 4, 5], [4, 6, 2],
  [6, 6, 1], [6, 8, 7], [7, 2, 4], [8, 3, 2], [8, 4, 1], [9, 4, 2],
  [10, 5, 4], [11, 11, 3],
];
const givens = GIVENS.map(([row, col, digit]) => new Given(makeCellId(row, col), digit));

// Transcribed from the payload's `underlays` array: two text labels (not
// circles) print a region's full two-digit size directly on one of its own
// cells: [row, col, total]. Unlike an ordinary single-digit given (which
// pins only the units digit -- the payload never says whether it is the
// true size or just its units digit), a two-digit total is unambiguous, so
// both the tens overlay and the board's units digit are pinned.
const TOTALS = [
  [3, 8, 26],
  [10, 2, 15],
];
const totalGivens = TOTALS.flatMap(([row, col, total]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(tens.at(cell), Math.floor(total / 10)),
    new Given(cell, total % 10),
  ];
});

// Counting Circles. Transcribed from the payload's `underlays` array (41
// plain circles, each on a grid cell, printing no number of its own -- its
// value is whatever the region-division solve puts there).
//
// The rule's "number" is a circle's true region size (10*tens + ones), which
// can exceed the board's own printed range (a region can run to 121 cells),
// so a single bounded value layer cannot hold it faithfully. Encoded per
// candidate true size v = 1..41 instead (a size above 41 could never be held
// by "how many of the 41 circles" -- see the bound below) as one Or between
// two tiny NFAs, each reading the 41 circles' (tens, ones) pairs directly,
// with no extra overlay:
//  - "no circle's true size is v" -- rejects the instant a circle's
//    (tens, ones) pair decodes to v, else accepts unconditionally.
//  - "exactly v of the circles have true size v" -- a counting NFA, the
//    running count clamped at v + 1 (a state that can only fail, so it need
//    not climb further), accepting when the final count equals v.
// Either half holding satisfies the rule for that v; when no circle's true
// size is v, the first NFA always holds vacuously (matching "no limit on a
// number that never appears in a circle").
const CIRCLE_COORDS = [
  [1, 2], [1, 3], [1, 5], [1, 11], [2, 1], [2, 2], [2, 6], [2, 7], [3, 1],
  [3, 2], [3, 7], [3, 9], [4, 7], [4, 8], [4, 9], [4, 10], [5, 2], [5, 6],
  [5, 8], [5, 9], [6, 2], [6, 3], [6, 9], [7, 1], [7, 3], [7, 7], [8, 2],
  [8, 4], [9, 5], [9, 9], [9, 11], [10, 1], [10, 3], [10, 4], [10, 6],
  [10, 10], [11, 1], [11, 2], [11, 5], [11, 6], [11, 9],
];
const CIRCLE_CELLS = CIRCLE_COORDS.map(([row, col]) => makeCellId(row, col));
const MAX_CIRCLE_VALUE = CIRCLE_CELLS.length; // 41

// A circle's true size cannot exceed 41: "how many circles hold that number"
// can be at most the circle count itself, since there are only 41 circles.
const circleBoundKey = Pair.fnToKey((t, o) => 10 * t + o <= MAX_CIRCLE_VALUE, shape);
const circleBounds = CIRCLE_CELLS.map(cell => new Pair(
  circleBoundKey, 'a circle\'s true size is at most the circle count',
  tens.at(cell), cell));

const noneEqualSpecs = new Map();
const noneEqualSpec = (target) => {
  if (!noneEqualSpecs.has(target)) {
    const tensV = Math.floor(target / 10);
    const onesV = target % 10;
    noneEqualSpecs.set(target, NFA.encodeSpec({
      // Reads (tens, ones) pairs; phase 'tens' awaits the next circle's
      // tens digit, phase 'ones' holds it pending and awaits the ones digit.
      startState: { phase: 'tens' },
      transition: (state, value) => {
        if (state.phase === 'tens') return { phase: 'ones', pendingTens: value };
        if (state.pendingTens === tensV && value === onesV) return undefined;
        return { phase: 'tens' };
      },
      accept: state => state.phase === 'tens',
    }, shape));
  }
  return noneEqualSpecs.get(target);
};
const countEqualsSpecs = new Map();
const countEqualsSpec = (target) => {
  if (!countEqualsSpecs.has(target)) {
    const tensV = Math.floor(target / 10);
    const onesV = target % 10;
    countEqualsSpecs.set(target, NFA.encodeSpec({
      startState: { phase: 'tens', count: 0 },
      transition: (state, value) => {
        if (state.phase === 'tens') {
          return { phase: 'ones', pendingTens: value, count: state.count };
        }
        const match = state.pendingTens === tensV && value === onesV;
        const count = Math.min(state.count + (match ? 1 : 0), target + 1);
        return { phase: 'tens', count };
      },
      accept: state => state.phase === 'tens' && state.count === target,
    }, shape));
  }
  return countEqualsSpecs.get(target);
};
const circleArgs = CIRCLE_CELLS.flatMap(cell => [tens.at(cell), cell]);
const countingCircles = range(1, MAX_CIRCLE_VALUE).map(v => new Or([
  new NFA(noneEqualSpec(v), `no circle's true size is ${v}`, ...circleArgs),
  new NFA(countEqualsSpec(v), `${v} circles have true size ${v}`, ...circleArgs),
]));

return [
  shape,
  tens.toVar('tens digit of the region size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...domains,
  ...positives,
  ...givens,
  ...totalGivens,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...circleBounds,
  ...countingCircles,
];
