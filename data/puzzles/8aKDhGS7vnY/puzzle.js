// Title: Chillomino
// Author: zzw
// Video: https://www.youtube.com/watch?v=8aKDhGS7vnY
// Source: https://sudokupad.app/MfhQqpqPHt

// 7x7, no givens. Not a Sudoku: nothing constrains rows, columns or boxes, so
// the grid is Raw.
//
// Rules encoded:
//  * Fillomino. Divide the grid into orthogonally-connected regions; every
//    cell holds a number equal to the size of its own region; two regions of
//    equal size never share an edge.
//  * Eight drawn (dashed, no printed total) cages: the numbers inside one
//    cage never repeat.
//  * If two cages share an edge, the sum of one cage's numbers differs from
//    the sum of the other's by exactly 1.
//
// Nothing is omitted. A region can run up to all 49 cells, past the 16-value
// alphabet a single cell can hold, so every cell's number is split: its tens
// digit lives on an overlay and its units digit is the board value itself
// (0 tens for any single-digit size).

const SIDE = 7;
const MAX_AREA = SIDE * SIDE;               // 49
const MAX_TENS = Math.floor(MAX_AREA / 10); // 4: the tens digit of 49

const shape = new Shape('7x7', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells naming the same root, where a region's root is
// its own first cell in reading order. Five overlays carry it:
//   tens           - tens digit of the cell's number (the board holds units);
//   rootRow,rootCol - which cell is the root of this cell's region;
//   dA, dB         - distance from the root, as residues mod 11 and mod 13
//                    (lcm 143 exceeds the 49-cell board, so the pair is the
//                    true distance, not just some descending count).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const dA = graph.makeOverlay('VA');
const dB = graph.makeOverlay('VB');
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
  restrict(dA, range(0, MOD_A - 1)),
  restrict(dB, range(0, MOD_B - 1)),
];

// A cell's number is at least 1 (tens and units are not both 0).
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

// Reads [rootRow, rootCol, dA, dB] of one cell. The named root must not come
// after the cell in reading order, and the cell sits at distance 0 in both
// residues exactly when it names itself.
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
// exactly one step nearer the root. Following such neighbours changes the
// residue pair by one each step, so the walk cannot revisit a cell within 143
// steps and must reach a root: the region is connected and contains the cell
// it names.
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

// Reads [dA(cell), dB(cell), tens(cell), units(cell), then rootRow and
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

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), tens(a), tens(b),
// units(a), units(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells are in the same region.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameRegion: state.same && value === state.mine };
    }
    if (state.phase === 4) return { phase: 5, sameRegion: state.sameRegion, mine: value };
    if (state.phase === 5) {
      return { phase: 6, sameRegion: state.sameRegion, same: value === state.mine };
    }
    if (state.phase === 6) {
      return { phase: 7, sameRegion: state.sameRegion, same: state.same, mine: value };
    }
    if (state.phase === 7) {
      const sameNumber = state.same && value === state.mine;
      return sameNumber === state.sameRegion ? { phase: 8 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), dA(a), dA(b), dB(a),
// dB(b)]: within a region, one step changes the distance to the root by -1, 0
// or +1, the same amount in both residues. This is what makes the residue
// pair the true distance rather than any descending chain.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRegion(state, value);
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
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    tens.at(a), tens.at(b), a, b),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    dA.at(a), dA.at(b), dB.at(a), dB.at(b)),
]);

// The eight drawn (dashed, no printed total) cages, cell lists in reading
// order, transcribed from the drawn cage outlines.
const CAGES = [
  ['R1C1', 'R1C2'],
  ['R3C2', 'R3C3', 'R4C2'],
  ['R4C3'],
  ['R4C4', 'R4C5'],
  ['R5C3', 'R6C2', 'R6C3'],
  ['R5C1', 'R5C2', 'R6C1', 'R7C1', 'R7C2'],
  ['R5C4', 'R6C4'],
  ['R6C5', 'R7C5'],
];

// "Numbers within cages cannot repeat": for every pair of cells sharing a
// cage, the pair's (tens, units) is not identical -- tens differs, or units
// (the board value) differs.
const notEqual = Pair.fnToKey((a, b) => a !== b, shape);
const cageDistinct = CAGES.flatMap(cage => {
  const pairs = [];
  for (let i = 0; i < cage.length; i++) {
    for (let j = i + 1; j < cage.length; j++) pairs.push([cage[i], cage[j]]);
  }
  return pairs.map(([a, b]) => new Or([
    new Pair(notEqual, 'different tens digit', tens.at(a), tens.at(b)),
    new Pair(notEqual, 'different units digit', a, b),
  ]));
});

// Cage-adjacency pairs: every pair of the eight cages above whose cells share
// an orthogonal edge (computed from the cage cell lists). Cage 0 (R1C1,R1C2)
// touches none of the others.
const ADJACENT_CAGE_PAIRS = [[1, 2], [1, 5], [2, 3], [2, 4], [3, 6], [4, 5], [4, 6], [6, 7]];

// A cage's sum is Sigma(10 * tens + units) over its cells. "Adjacent cages'
// sums differ by exactly 1" is one Sum equation per sign, the two cages'
// weighted terms cancelling to +-1, inside an Or.
const cageTerms = (cage, sign) =>
  cage.flatMap(cell => [[tens.at(cell), sign * 10], [cell, sign]]);
const cageSumAdjacency = ADJACENT_CAGE_PAIRS.map(([i, j]) => new Or([
  new Sum(1, ...cageTerms(CAGES[i], 1), ...cageTerms(CAGES[j], -1)),
  new Sum(-1, ...cageTerms(CAGES[i], 1), ...cageTerms(CAGES[j], -1)),
]));

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  dA.toVar('distance to root mod 11'),
  dB.toVar('distance to root mod 13'),
  ...domains,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...cageDistinct,
  ...cageSumAdjacency,
];
