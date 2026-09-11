// Title: Delray Beach Sunrise
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=KQNG67vHJ58
// Source: https://sudokupad.app/ypf71xbp99

// 11x11 with no givens and no Sudoku layer, so the grid is Raw: rows, columns
// and boxes carry no rule and numbers repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into polyominoes and fill each cell with a
//    number equal to the size of its polyomino. Polyominoes of the same size
//    may not share an edge.
//  * Yin-Yang. Shade some cells such that all shaded cells are orthogonally
//    connected and all unshaded cells are orthogonally connected. No 2x2 area
//    may be fully shaded or unshaded.
//  * Parity. All odd polyominoes are shaded, while all even polyominoes are
//    unshaded.
//  * "Yang" arrows. Numbers on cells with an arrow indicate the number of
//    polyominoes of the same shading/parity seen in the direction of the
//    arrow. Arrows do not count their own cell, but may count their polyomino
//    if a cell within its polyomino is visible in the direction of the arrow.
//
// Nothing is omitted.
//
// Parity makes the shading a function of the numbers -- a cell is shaded
// exactly when its polyomino, and so its own number, is odd -- so the shading
// is read off the grid instead of carried on a layer of its own.
//
// No rule bounds a polyomino below the board's own 121 cells, so a number does
// not fit in one 16-value cell: every cell's number is its tens digit on an
// overlay plus its units digit on the board. Ten is even, so the number's
// parity is the parity of the units digit the board holds.

const ROWS = 11;
const COLS = 11;
const MAX_AREA = ROWS * COLS;                 // 121
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 12: the tens digit of 121
const MOD_A = 11;
const MOD_B = 13;                             // lcm 143 > 121 cells

const shape = new Shape(`${ROWS}x${COLS}`, '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's root
// is its first cell in reading order. Five overlays carry it:
//   tens     - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol  - which cell is the root of this cell's region;
//   dA, dB   - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 121, so the pair is the distance itself).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const dA = graph.makeOverlay('VA');
const dB = graph.makeOverlay('VB');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// The 23 arrow glyphs drawn in the grid: [row, col, dRow, dCol], the step being
// the direction the glyph's tip points (four of them are diagonal).
const ARROWS = [
  [1, 4, 1, 0], [1, 7, 1, 0], [1, 11, 1, 0], [2, 9, 1, -1], [3, 2, 1, 0],
  [4, 1, 0, 1], [4, 3, 1, 0], [5, 7, 0, 1], [6, 7, 1, -1], [6, 10, 0, -1],
  [7, 2, 0, 1], [8, 2, 1, 1], [8, 3, 0, 1], [8, 5, 0, -1], [9, 1, -1, 1],
  [9, 5, 1, 0], [9, 6, 1, 0], [9, 7, 1, 0], [9, 10, 0, -1], [10, 3, 0, 1],
  [11, 1, -1, 0], [11, 6, 0, 1], [11, 11, 0, -1],
];

// Each arrow's ray: every cell from the next one along its direction to the
// board edge. Nothing in the rules blocks the view, so a ray runs the whole way.
const rays = ARROWS.map(([row, col, dRow, dCol]) => ({
  clue: makeCellId(row, col),
  cells: graph.ray(makeCellId(row, col), dRow, dCol).slice(1),
}));

// One 0/1 flag per ray cell, marking it as the first cell of its ray that
// belongs to a given polyomino of the clue's own shade; the flags of one ray
// then add up to the number of such polyominoes.
const flagCount = rays.reduce((sum, ray) => sum + ray.cells.length, 0);
const flags = new Var('F', 'first sighting of a polyomino along a ray', flagCount);
const flagCells = flags.cells();
let flagBase = 0;
for (const ray of rays) {
  ray.flags = flagCells.slice(flagBase, flagBase + ray.cells.length);
  flagBase += ray.cells.length;
}

const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(dA, range(0, MOD_A - 1)),
  restrict(dB, range(0, MOD_B - 1)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

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
// one step nearer the root. Following such neighbours changes the residue pair
// by one each step, so the walk cannot revisit a cell within 143 steps and must
// reach a root: the region is connected and contains the cell it names.
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

// Reads [dA(cell), dB(cell), tens(cell), units(cell), then rootRow and rootCol
// of this cell and of every cell after it in reading order]. A cell at distance
// 0 is a root, and exactly its number's worth of cells name it; only cells at or
// after it in reading order can, so `maxArea` (how many there are) bounds the
// count. A cell at positive distance is named by nobody.
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
    dA.at(cell), dB.at(cell), tens.at(cell), cell,
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
// exactly when the two cells are in the same region. Left to right this is
// "a region's cells all hold its size"; right to left it is "polyominoes of the
// same size may not share an edge".
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
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    dA.at(a), dA.at(b), dB.at(a), dB.at(b)),
]);

// Yin-Yang. A cell is shaded exactly when its number is odd, which is exactly
// when the units digit the board holds is odd, so both shades are classes of
// board values and need no layer of their own. Each class is asserted to be a
// single orthogonally-connected region; ConnectedValues also requires it to be
// non-empty, which the no-monochrome-2x2 rule below already forces on a board
// this size.
const shading = [
  new ConnectedValues('', range(0, 7).map(i => 2 * i + 1)),
  new ConnectedValues('', range(0, 7).map(i => 2 * i)),
];

// Reads the four cells of a 2x2 block: their numbers may not all be odd (all
// shaded) nor all even (all unshaded).
const blockSpec = NFA.encodeSpec({
  startState: { seen: 0, odd: 0 },
  transition: (state, value) =>
    state.seen === 4 ? undefined
      : { seen: state.seen + 1, odd: state.odd + (value % 2) },
  accept: state => state.seen === 4 && state.odd > 0 && state.odd < 4,
}, shape);

const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const blocks = graph.makeReplicate(
  new NFA(blockSpec, 'no 2x2 area is one shade', ...graph.block(cells[0], 2, 2)),
  blockOrigins);

// "Yang" arrows. Reads [flag, units(clue), units(rayCell), rootRow(rayCell),
// rootCol(rayCell), then rootRow and rootCol of every earlier cell of the same
// ray]. The flag is 1 exactly when the ray cell shares the clue's parity and no
// earlier ray cell named the same root -- i.e. when the ray cell is where its
// polyomino is first sighted. Summing a ray's flags therefore counts the
// distinct same-shade polyominoes it sees, counting the clue's own polyomino if
// it appears and never counting one twice.
//
// `settled` is the sink for a flag of 0 whose reason is already established;
// `earlierRow` is where a scan that found no earlier sighting ends, whether or
// not the ray had any earlier cells to read. The machine also holds the flag
// cell to 0 or 1, which is its whole domain.
const flagSpec = NFA.encodeSpec({
  startState: { phase: 'flag' },
  transition: (state, value) => {
    if (state.phase === 'flag') {
      return value > 1 ? undefined : { phase: 'clue', on: value === 1 };
    }
    if (state.phase === 'clue') return { phase: 'ray', on: state.on, parity: value % 2 };
    if (state.phase === 'ray') {
      // A ray cell of the other shade is never counted.
      if (value % 2 !== state.parity) {
        return state.on ? undefined : { phase: 'settled' };
      }
      return { phase: 'myRow', on: state.on };
    }
    if (state.phase === 'myRow') return { phase: 'myCol', on: state.on, row: value };
    if (state.phase === 'myCol') {
      return { phase: 'earlierRow', on: state.on, row: state.row, col: value };
    }
    if (state.phase === 'earlierRow') {
      return {
        phase: 'earlierCol', on: state.on, row: state.row, col: state.col,
        rowEq: value === state.row,
      };
    }
    if (state.phase === 'earlierCol') {
      if (state.rowEq && value === state.col) {
        // An earlier cell of this ray already sighted this polyomino.
        return state.on ? undefined : { phase: 'settled' };
      }
      return { phase: 'earlierRow', on: state.on, row: state.row, col: state.col };
    }
    return { phase: 'settled' };
  },
  accept: state => state.phase === 'settled'
    || (state.on && state.phase === 'earlierRow'),
}, shape);

const arrowRules = rays.flatMap(ray => [
  ...ray.cells.map((rayCell, i) => new NFA(
    flagSpec, 'first sighting of a polyomino along a ray',
    ray.flags[i], ray.clue, rayCell, rootRow.at(rayCell), rootCol.at(rayCell),
    ...ray.cells.slice(0, i).flatMap(
      earlier => [rootRow.at(earlier), rootCol.at(earlier)]))),
  // The clue's own number, tens digit and units digit, is that count.
  new Sum(0, [tens.at(ray.clue), -10], [ray.clue, -1], ...ray.flags),
]);

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  dA.toVar(`distance to root mod ${MOD_A}`),
  dB.toVar(`distance to root mod ${MOD_B}`),
  flags,
  ...domains,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...shading,
  blocks,
  ...arrowRules,
];
