// Title: Star Fillomino
// Author: au voleur
// Video: https://www.youtube.com/watch?v=guTXBSiStkw
// Source: https://app.crackingthecryptic.com/sudoku/HJfhP4DRpF

// Star Fillomino, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into polyomino regions; the numbers within a
//    region are all the same and equal to the region's own area; two regions
//    of equal area never share an edge (diagonal contact is allowed). A
//    region may contain zero, one or more of the printed numbers.
//  * The 11 given numbers: 8 printed as an ordinary cell value, 3 (the
//    two-digit 10, 10, 14) drawn as overlay text at R3C10, R10C8, R8C10
//    instead.
//  * Shading: every row, every column and every polyomino holds exactly two
//    shaded cells; shaded cells never touch, including diagonally.
//
// Nothing is omitted. Region area runs to the board's own cap of 100 cells,
// past the 16-value alphabet a single cell can hold, so each cell's number is
// split: a tens digit on overlay VT and a units digit on the board. Regions
// are identified by a rooted-forest overlay stack (root row/column plus
// BFS-distance residues) rather than by a bounded label set. The star layer
// rides the same identity stack: a second per-cell counting NFA, structurally
// the twin of the region-size one, sums shaded cells among those naming a
// candidate root instead of counting cells outright.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's root
// is its first cell in reading order. Overlays:
//   tens    - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself);
//   shaded  - this cell's own star, 0 or 1 (a per-cell mark, unlike the
//             per-region checkered shade in ZrfTSUxm0iE).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const shaded = graph.makeOverlay('VD');
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
  restrict(shaded, [0, 1]),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

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

// Reads [d11(cell), d13(cell), then for every cell at or after `cell` in
// reading order: rootRow(other), rootCol(other), shaded(other)]. This is the
// star-count twin of `sizeSpec` above: a root (distance 0) requires exactly
// two of the cells naming it -- itself included -- to be shaded; a non-root
// cell asserts nothing of the tail (the size NFA above already forbids anyone
// naming it), so it just passes the remaining symbols through unconstrained.
const shadeCountSpecs = new Map();
const shadeCountSpec = (row, col) => {
  const key = row + '_' + col;
  if (!shadeCountSpecs.has(key)) {
    shadeCountSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'd11' },
      transition: (state, value) => {
        if (state.phase === 'd11') return { phase: 'd13', zero: value === 0 };
        if (state.phase === 'd13') {
          return state.zero && value === 0
            ? { phase: 'row', count: 0 } : { phase: 'pass' };
        }
        if (state.phase === 'pass') return { phase: 'pass' };
        if (state.phase === 'row') {
          return { phase: 'col', count: state.count, rowEq: value === row };
        }
        if (state.phase === 'col') {
          return { phase: 'shade', count: state.count, match: state.rowEq && value === col };
        }
        // phase 'shade'
        if (state.match && value === 1) {
          // A third shaded cell naming this root is already too many.
          return state.count >= 2 ? undefined : { phase: 'row', count: state.count + 1 };
        }
        return { phase: 'row', count: state.count };
      },
      accept: state => state.phase === 'pass' || (state.phase === 'row' && state.count === 2),
    }, shape));
  }
  return shadeCountSpecs.get(key);
};

const shadeCounts = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(shadeCountSpec(row, col), 'region holds exactly two shaded cells',
    d11.at(cell), d13.at(cell),
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other), shaded.at(other)]));
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
// exactly when the two cells are in the same region -- "no two polyominoes
// with the same area share an edge" plus internal uniformity, together.
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

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// Shading: exactly two per row and per column (native, no region needed).
const rowShadeCounts = graph.rows().map(row => new Sum(2, ...shaded.at(row)));
const colShadeCounts = graph.columns().map(col => new Sum(2, ...shaded.at(col)));

// Shaded cells never touch, including diagonally: one Pair template per
// king-move direction (down, right, down-right, down-left from each cell
// covers every 8-neighbour pair exactly once), stamped over every in-grid
// starting cell with one Replicate per direction rather than repeating the
// same Pair by hand.
const noTouch = Pair.fnToKey((a, b) => !(a === 1 && b === 1), shape);
const touchDirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
const noTouchRules = touchDirs.map(([dRow, dCol]) => {
  const starts = cells.filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = starts[0];
  const originOther = graph.step(origin, dRow, dCol);
  return new Replicate(
    [new Pair(noTouch, 'shaded cells do not touch', shaded.at(origin), shaded.at(originOther))],
    Replicate.encodeTargetCells(shaded.at(starts), shaded.at(origin), shaded),
    shaded.at(origin),
  );
});

// The 11 printed numbers -- 8 given directly, 3 (the two-digit 10, 10, 14)
// drawn as overlay text at R3C10, R10C8, R8C10 -- [row, col, number].
const GIVENS = [
  [1, 3, 4], [1, 4, 6], [2, 7, 3], [3, 1, 7], [3, 10, 10],
  [4, 6, 6], [5, 4, 4], [8, 1, 5], [8, 10, 14], [10, 1, 8], [10, 8, 10],
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(tens.at(cell), Math.floor(number / 10)),
    new Given(cell, number % 10),
  ];
});

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  shaded.toVar('shaded (star) cell'),
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...shadeCounts,
  ...edgeRules,
  ...rowShadeCounts,
  ...colShadeCounts,
  ...noTouchRules,
];
