// Title: For A Few Circles More
// Author: Skeptical Mario
// Video: https://www.youtube.com/watch?v=KcQN_phMtto
// Source: https://sudokupad.app/9mpwvnok73

// For A Few Circles More, 11x11. There is no Sudoku layer, so the grid is
// Raw: rows, columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into regions; the numbers within a region
//    are all the same and equal to the region's size; regions of equal size
//    do not touch orthogonally (diagonal contact is allowed).
//  * The one drawn region border: R10C8 and R10C9 lie in different regions.
//  * The 14 given numbers.
//  * Reverse Counting Circles: a number shown in a circle gives how many
//    times that number appears among the cells that are not in any circle;
//    a number that never appears in a circle is unconstrained by this rule.
//
// Nothing is omitted. Region sizes run to the board's own cap of 121 cells,
// so a size does not fit in one 9-value cell (the puzzle's own printed
// alphabet is the digits 1-9, with no 0): every cell's number is held as
// its tens digit on an overlay and its printed ones digit on the board.

const ROWS = 11;
const COLS = 11;
const MAX_AREA = ROWS * COLS;
const MAX_TENS = Math.floor(MAX_AREA / 10); // 12: the tens digit of 121

const shape = new Shape('11x11', '0-12', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's
// root is its first cell in reading order. Five overlays carry it:
//   tens    - tens digit of the cell's number (the board holds the ones digit);
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
  // The board's own alphabet is 1-9 (no 0), so every cell's ones digit is
  // already at least 1 and no separate "number is positive" check is needed:
  // unlike a puzzle whose printed alphabet includes 0, 10*tens + ones can
  // never be 0 here.
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
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
// different regions must show different numbers, so two touching regions
// can never share a size.
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

// The one drawn region border, read off the payload's single `lines` entry
// (waypoints along cell borders, separating R10C8 from R10C9): those two
// cells must not share a root, i.e. not the same rootRow *and* rootCol.
// Cell ids above 9 use ISS's single-character row/column encoding, so these
// are built with makeCellId rather than hand-written 'R10C8' strings.
const borderPairs = [[[10, 8], [10, 9]]];
const givenBorders = borderPairs.map(([[r1, c1], [r2, c2]]) => {
  const a = makeCellId(r1, c1);
  const b = makeCellId(r2, c2);
  return new Or([
    new AllDifferent(rootRow.at(a), rootRow.at(b)),
    new AllDifferent(rootCol.at(a), rootCol.at(b)),
  ]);
});

// Transcribed from the payload's `cells` array: [row, col, printed digit].
// This is the board's own ones digit only; the region's tens digit (if any)
// is left for the solver, since the payload never prints it directly.
const GIVENS = [
  [1, 1, 6], [1, 4, 6], [1, 5, 3], [3, 9, 9], [4, 1, 6], [4, 4, 6],
  [4, 10, 5], [6, 6, 2], [6, 9, 7], [9, 3, 9], [9, 6, 7], [9, 9, 9],
  [11, 5, 4], [11, 11, 4],
];
const givens = GIVENS.map(([row, col, digit]) => new Given(makeCellId(row, col), digit));

// Reverse Counting Circles. Transcribed from the payload's `underlays`
// array (36 plain circles, each on a grid cell, printing no number of its
// own -- its value is whatever the Fillomino solve puts there). Cell ids
// above 9 use ISS's single-character row/column encoding, so these are
// built with makeCellId from [row, col] pairs rather than hand-written
// 'R10C8'-style strings.
const CIRCLE_COORDS = [
  [1, 6], [1, 8], [1, 11], [2, 1], [2, 3], [2, 6], [2, 8], [2, 10], [3, 3],
  [3, 4], [4, 2], [4, 3], [4, 5], [4, 6], [4, 8], [4, 11], [5, 2], [6, 4],
  [6, 8], [7, 1], [7, 5], [7, 10], [8, 2], [8, 3], [8, 8], [9, 4], [9, 6],
  [9, 11], [10, 1], [10, 7], [10, 8], [10, 9], [10, 10], [11, 1], [11, 4],
  [11, 9],
];
const CIRCLE_CELLS = CIRCLE_COORDS.map(([row, col]) => makeCellId(row, col));
const circleSet = new Set(CIRCLE_CELLS);
const nonCircleCells = cells.filter(cell => !circleSet.has(cell));

// For each candidate value v: either no circle shows v (the rule is then
// silent on v), or exactly v of the non-circle cells hold v. One tiny NFA
// checks each half; an `Or` between them is the rule's "if a circle shows
// v" conditional without ever materialising an indicator Var.
const noneEqualSpecs = new Map();
const noneEqualSpec = (target) => {
  if (!noneEqualSpecs.has(target)) {
    noneEqualSpecs.set(target, NFA.encodeSpec({
      startState: {},
      transition: (state, value) => (value === target ? undefined : state),
      accept: () => true,
    }, shape));
  }
  return noneEqualSpecs.get(target);
};
const countEqualsSpecs = new Map();
const countEqualsSpec = (target) => {
  if (!countEqualsSpecs.has(target)) {
    countEqualsSpecs.set(target, NFA.encodeSpec({
      startState: { count: 0 },
      // Clamp at target + 1: once the count exceeds the target it can only
      // fail, so it collapses to one sink value instead of climbing further.
      transition: (state, value) => ({
        count: Math.min(state.count + (value === target ? 1 : 0), target + 1),
      }),
      accept: state => state.count === target,
    }, shape));
  }
  return countEqualsSpecs.get(target);
};
const reverseCountingCircles = range(1, 9).map(v => new Or([
  new NFA(noneEqualSpec(v), `no circle shows ${v}`, ...CIRCLE_CELLS),
  new NFA(countEqualsSpec(v), `${v} appears ${v} times outside circles`, ...nonCircleCells),
]));

return [
  shape,
  tens.toVar('tens digit of the region size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...domains,
  ...givens,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...givenBorders,
  ...reverseCountingCircles,
];
