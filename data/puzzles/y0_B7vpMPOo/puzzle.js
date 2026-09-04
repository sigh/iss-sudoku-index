// Title: Distant Relatives
// Author: Agent
// Video: https://www.youtube.com/watch?v=y0_B7vpMPOo
// Source: https://app.crackingthecryptic.com/sudoku/HrhMg7tphm

// Distant Relatives, 10x10. There is no Sudoku layer, so the grid is Raw:
// rows, columns and boxes carry no rule and values repeat freely. No digit
// is given anywhere.
//
// Rules encoded:
//  * Fillomino. Divide the grid into regions; the numbers within a region are
//    all the same and equal to the region's size; regions of equal size do
//    not touch orthogonally (diagonal contact is allowed). This is the same
//    rule as "two orthogonally adjacent cells with equal numbers always
//    belong to the same region".
//  * Arrow cells. A cell carrying one or more short strokes toward an edge
//    (up/down/left/right) claims: the nearest cell in that direction holding
//    the SAME number as this cell is exactly this cell's own number of steps
//    away, and no closer cell that way repeats it. Unlike a typical arrow
//    clue there is no separate printed target digit -- the arrow cell's own
//    (to-be-solved) region-size value is both the claimed distance and the
//    value being matched. "Not all arrows are necessarily given" (rules
//    text) means an unmarked direction is left unconstrained -- it is not
//    read as "no such nearest occurrence", so only the drawn strokes get an
//    NFA; no complementary claim is encoded for a direction with no stroke.
//
// Region-identity construction (per-cell root/distance-residue overlay, no
// anchors): region sizes run to the board's own cap of 100 cells, so a size
// does not fit in one 16-value cell. Every cell's number is held as a tens
// digit on an overlay and a units digit on the board; each cell names its
// region's root -- the region's own first cell in reading order -- as a
// (row, column) pair, plus its distance from that root carried as residues
// mod 11 and mod 13 (lcm 143 > 100, so the residue pair is the true
// distance, not just some locally-decreasing labelling). Six whole-grid
// layers (board + tens + rootRow + rootCol + d11 + d13) spend 700 of the
// 1000 MAX_SEARCH_CELLS cells.
//
// Arrow construction: one small NFA per (arrow cell, direction), reading the
// cell's own (tens, units) pair as the target number D, then scanning the
// ray outward two symbols (tens, units) at a time. Position D must hold that
// same D; every closer position must not. A direction whose ray is shorter
// than D simply cannot accept -- consistent with "the arrow's own claim must
// be satisfiable", not a separate rule.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10); // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

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

// Reads [d11(cell), d13(cell), tens(cell), units(cell), then rootRow and
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
// exactly when the two cells are in the same region.
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

// --- Arrow cells ---------------------------------------------------------
// Transcribed from each drawn stroke's start/end waypoint (a short mark from
// the cell centre toward one edge): an anchor cell plus one direction it
// points. Two or three strokes sharing an anchor cell are separate entries
// here. ARROWS: [row, col, direction].
const ARROWS = [
  [1, 2, 'down'],
  [3, 1, 'down'],
  [7, 3, 'down'],
  [5, 4, 'down'],
  [3, 9, 'down'],
  [1, 3, 'right'],
  [2, 5, 'right'],
  [4, 5, 'right'],
  [6, 5, 'right'],
  [6, 1, 'right'],
  [2, 8, 'left'],
  [4, 5, 'left'],
  [5, 4, 'left'],
  [5, 6, 'left'],
  [8, 9, 'left'],
  [10, 8, 'up'],
  [5, 4, 'up'],
  [4, 5, 'up'],
  [4, 3, 'up'],
];
const DIRECTIONS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

// Reads [tens(cell), units(cell), then (tens, units) of each ray cell
// outward, nearest first]. The cell's own two-digit number D is both the
// target value and the claimed distance. Position D must hold D; every
// position before D must not. D > rayLength (or D === 0) cannot accept --
// there is no cell at that distance to satisfy the claim.
const raySpecs = new Map();
const raySpec = rayLength => {
  if (!raySpecs.has(rayLength)) {
    raySpecs.set(rayLength, NFA.encodeSpec({
      startState: { phase: 'tens' },
      transition: (state, value) => {
        if (state.phase === 'tens') return { phase: 'units', t: value };
        if (state.phase === 'units') {
          const target = 10 * state.t + value;
          return (target >= 1 && target <= rayLength)
            ? { phase: 'scanTens', target, pos: 1 } : undefined;
        }
        if (state.phase === 'scanTens') {
          return { phase: 'scanUnits', target: state.target, pos: state.pos, rt: value };
        }
        if (state.phase === 'scanUnits') {
          const rayVal = 10 * state.rt + value;
          if (state.pos < state.target) {
            if (rayVal === state.target) return undefined;
            return { phase: 'scanTens', target: state.target, pos: state.pos + 1 };
          }
          return rayVal === state.target ? { phase: 'free' } : undefined;
        }
        return { phase: 'free' };
      },
      accept: state => state.phase === 'free',
    }, shape));
  }
  return raySpecs.get(rayLength);
};

const arrowRules = ARROWS.map(([row, col, dir]) => {
  const cell = makeCellId(row, col);
  const [dRow, dCol] = DIRECTIONS[dir];
  const ray = graph.ray(cell, dRow, dCol).slice(1);
  return new NFA(raySpec(ray.length), 'nearest same number is exactly this many cells away',
    tens.at(cell), cell, ...ray.flatMap(rc => [tens.at(rc), rc]));
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
  ...edgeRules,
  ...arrowRules,
];
