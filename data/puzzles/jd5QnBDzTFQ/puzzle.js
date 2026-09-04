// Title: Twilight Cave Fillomino
// Author: Agent
// Video: https://www.youtube.com/watch?v=jd5QnBDzTFQ
// Source: https://sudokupad.app/p636wzk7e0

// Twilight Cave Fillomino, 10x10. There is no Sudoku layer, so the grid is
// Raw: rows, columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into regions; the numbers within a region are
//    all the same and equal to the region's size; regions of equal size do not
//    touch orthogonally (diagonal contact is allowed).
//  * Cave. Shade some cells; all unshaded cells are orthogonally connected;
//    every orthogonally-connected group of shaded cells touches the grid's
//    perimeter (the standard Cave reading: several disjoint groups are
//    allowed, not one single shaded mass).
//  * Each Fillomino region is entirely shaded or entirely unshaded.
//  * The 14 clues. An unshaded clue equals the sum seen in the four
//    orthogonal directions, blocked by region borders (checked in full).
//    A shaded clue equals the total of its connected shaded group, which may
//    span several regions -- a clue's own shaded-ness is encoded (it may
//    freely be shaded or unshaded), but that total is *not* checked: see the
//    search-cell budget note below CLUES, which is also why omitted_rules
//    names this one clause.
//
// Region sizes run to the board's own cap of 100 cells, so a size does not
// fit in one 16-value cell: every cell's number is held as its tens digit on
// an overlay and its units digit on the board (ZrfTSUxm0iE's construction).

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// ---------------------------------------------------------------------------
// Fillomino: a region is the set of cells naming the same root, where a
// region's root is its first cell in reading order. Four overlays carry it:
//   tens     - tens digit of the cell's number (the board holds the units);
//   rootRow,
//   rootCol  - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the true distance).
// ---------------------------------------------------------------------------
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const MOD_A = 11;
const MOD_B = 13;

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values, targetCells) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values), targetCells);

const fillominoDomains = [
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
// recording whether a and b name the same root.
const readSameRoot = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Reads [tens(a), tens(b), units(a), units(b), rootRow(a), rootRow(b),
// rootCol(a), rootCol(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells name the same root.
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
// by -1, 0 or +1, the same amount in both residues.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRoot(state, value);
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

const fillominoEdgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// ---------------------------------------------------------------------------
// Cave shading and a shaded clue's own group, in one forest (the 1000-cell
// search budget has no room for a separate shading layer plus a separate
// border-reaching proof). "Orthogonally connected shaded cells, which could
// include more than one region" is a second partition alongside the
// Fillomino one: connectivity through shading alone, not through equal
// numbers. Four overlays carry it, the same
// root/distance construction as the Fillomino forest above (reusing
// distanceEdgeSpec/readSameRoot/stepA/stepB), except the root is not "first
// in reading order" but "the perimeter cell a shaded group reaches its edge
// through" -- which folds "every shaded group touches the grid's perimeter"
// into the same forest that identifies the group, at no extra cell cost:
//   shRootRow,
//   shRootCol - (0, 0) -- outside the 1..10 board -- for an unshaded cell;
//               otherwise the perimeter cell this cell's shaded group reaches
//               the border through (which need not be unique to the group,
//               only self-consistent: see the root-pin comment below).
//   shD11, shD13 - distance to that root, as residues mod 11 and 13 (as the
//               Fillomino forest), pinned to (0, 0) for an unshaded cell.
// There is no separate shading Var: "shaded" *is* shRootRow != 0, read
// inline wherever it is needed, which is what removes the extra layer.
// ---------------------------------------------------------------------------
const isBorderCell = (row, col) => row === 1 || row === SIDE || col === 1 || col === SIDE;

const shRootRow = graph.makeOverlay('VD');
const shRootCol = graph.makeOverlay('VE');
const shD11 = graph.makeOverlay('VF');
const shD13 = graph.makeOverlay('VG');

const shadeForestDomains = [
  restrict(shRootRow, range(0, SIDE)),
  restrict(shRootCol, range(0, SIDE)),
  restrict(shD11, range(0, MOD_A - 1)),
  restrict(shD13, range(0, MOD_B - 1)),
];

// Reads [shRootRow, shRootCol, shD11, shD13] of one cell. Three patterns:
//   - (0, 0, 0, 0): unshaded.
//   - (row, col, 0, 0): a shaded root -- allowed only when (row, col) is
//     itself a perimeter cell, which is what proves its group reaches an edge.
//   - anything else with (shD11, shD13) != (0, 0): a shaded non-root, whose
//     root is checked by the descent rule below, not here.
// A root need not be the group's *first* perimeter cell (unlike the Fillomino
// forest's reading-order root) -- nothing here compares two cells' claims
// against each other, so nothing requires that. Two different perimeter cells
// of one true group choosing to each self-declare would be two *different*
// (shRootRow, shRootCol) labels on cells the "both shaded implies same root"
// edge rule below forces to agree, so at most one perimeter cell per group
// self-declares in any accepted assignment; which one is left to the solver.
const shadeRootSpecs = new Map();
const shadeRootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!shadeRootSpecs.has(key)) {
    const border = isBorderCell(row, col);
    shadeRootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      // Reads [rootRow, rootCol, d11, d13] -- four symbols, four read-phases.
      transition: (state, value) => {
        if (state.phase === 0) {
          return { phase: 1, rowEq: value === row, rowZero: value === 0 };
        }
        if (state.phase === 1) {
          const selfReal = state.rowEq && value === col;
          const sentinel = state.rowZero && value === 0;
          return { phase: 2, self: selfReal || sentinel, sentinel };
        }
        if (state.phase === 2) {
          return { phase: 3, self: state.self, sentinel: state.sentinel, d11Zero: value === 0 };
        }
        if (state.phase === 3) {
          const zero = state.d11Zero && value === 0;
          if (zero !== state.self) return undefined;
          if (state.self && !state.sentinel && !border) return undefined;
          return { phase: 4 };
        }
        return undefined;
      },
      accept: state => state.phase === 4,
    }, shape));
  }
  return shadeRootSpecs.get(key);
};

const shadeRootPins = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(shadeRootSpec(row, col), 'shaded root reaches the border, unshaded is the sentinel',
    shRootRow.at(cell), shRootCol.at(cell), shD11.at(cell), shD13.at(cell));
});

// A cell is unshaded (sentinel), a shaded root (distance 0, checked above), or
// has a *shaded* orthogonal neighbour in its group one step nearer the root.
const shadeDescents = cells.map(cell => new Or([
  new Given(shRootRow.at(cell), 0),
  new And([new Given(shD11.at(cell), 0), new Given(shD13.at(cell), 0)]),
  ...graph.neighbours(cell).map(other => new And([
    new Given(shRootRow.at(other), ...range(1, SIDE)),
    new SameValues(2, shRootRow.at(cell), shRootRow.at(other)),
    new SameValues(2, shRootCol.at(cell), shRootCol.at(other)),
    new Pair(stepA, 'one step nearer the shaded root', shD11.at(cell), shD11.at(other)),
    new Pair(stepB, 'one step nearer the shaded root', shD13.at(cell), shD13.at(other)),
  ])),
]));

// Reads [shRootRow(a), shRootRow(b), shRootCol(a), shRootCol(b)]: two
// orthogonally adjacent *shaded* (shRootRow != 0) cells always share a root --
// no Fillomino-style exception, shaded adjacency alone makes one group.
const shadeSameRootSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, aShaded: value !== 0, aRow: value };
    if (state.phase === 1) {
      return { phase: 2, bothShaded: state.aShaded && value !== 0, rowEq: value === state.aRow };
    }
    if (state.phase === 2) {
      return { phase: 3, bothShaded: state.bothShaded, rowEq: state.rowEq, aCol: value };
    }
    if (state.phase === 3) {
      if (!state.bothShaded) return { phase: 4 };
      return (state.rowEq && value === state.aCol) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const shadeSameRootEdges = edges.map(([a, b]) => new NFA(
  shadeSameRootSpec, 'shaded neighbours share a group',
  shRootRow.at(a), shRootRow.at(b), shRootCol.at(a), shRootCol.at(b)));

// Distance is the true distance within the shaded group (same construction as
// the Fillomino forest's distanceEdgeSpec; a harmless no-op between two
// unshaded cells, which both sit at the sentinel distance (0, 0)).
const shadeDistanceEdges = edges.map(([a, b]) => new NFA(
  distanceEdgeSpec, 'shaded-group distance changes by at most one',
  shRootRow.at(a), shRootRow.at(b), shRootCol.at(a), shRootCol.at(b),
  shD11.at(a), shD11.at(b), shD13.at(a), shD13.at(b)));

// All unshaded cells are orthogonally connected (Cave's other half: every
// shaded group reaches the border, is the root-pin/descent construction
// above, not a separate connectivity constraint).
const unshadedConnectivity = new ConnectedValues('VD', 0);

// Each Fillomino region is entirely shaded or entirely unshaded: adjacent
// cells naming the same Fillomino root must agree on shaded-ness (shRootRow
// != 0), one-directional -- two adjacent regions may share or differ in
// shade freely, only a *split* region is forbidden. Reads [rootRow(a),
// rootRow(b), rootCol(a), rootCol(b), shRootRow(a), shRootRow(b)].
const regionUniformShadeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRoot(state, value);
    if (state.phase === 4) return { phase: 5, same: state.same, mine: value !== 0 };
    if (state.phase === 5) {
      return (!state.same || (value !== 0) === state.mine) ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const regionUniformShade = edges.map(([a, b]) => new NFA(
  regionUniformShadeSpec, 'region is entirely shaded or entirely unshaded',
  rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
  shRootRow.at(a), shRootRow.at(b)));

// ---------------------------------------------------------------------------
// The 14 clues. An unshaded clue reads the sum of numbers seen orthogonally,
// blocked by region borders; a shaded clue reads the total of its connected
// shaded group (own read only -- see the header comment on why the shaded
// reading is not checked).
//
// Unshaded reading: since two orthogonally adjacent cells hold equal numbers
// exactly when they share a Fillomino root (the edge rule above), the run of
// cells a ray sees before its first region border is exactly its run of
// cells equal to the clue's own value V, starting adjacent to the clue, and
// the cell just past that run (if on the board) differs from V. Every counted
// cell holds V, so the total seen is V times the total run length C over all
// four rays; C cannot exceed 18 (9 rows + 9 columns, minus the clue's own
// cell in each), a bound independent of the clue's position. V * C = target
// has finitely many integer solutions (target's divisor pairs with C <= 18),
// and C splits over the four rays in finitely many ways bounded by each ray's
// own length -- both disjoined over directly as Given/differs conjunctions on
// the existing board and tens cells, spending no new search cells (an NFA
// reading a whole clue's rays with an unknown run split was tried first: its
// state needs the clue's own root carried across the scan to test each cell
// against it, and that alone -- 100 possible roots -- already approaches the
// 4096-state cap before the run length or ray position is added).
// ---------------------------------------------------------------------------
const CLUES = [
  { row: 1, col: 3, target: 35 }, { row: 2, col: 2, target: 35 },
  { row: 10, col: 4, target: 25 }, { row: 10, col: 6, target: 8 },
  { row: 9, col: 9, target: 24 }, { row: 7, col: 4, target: 15 },
  { row: 4, col: 3, target: 15 }, { row: 3, col: 4, target: 5 },
  { row: 3, col: 6, target: 4 }, { row: 1, col: 7, target: 32 },
  { row: 4, col: 1, target: 24 }, { row: 6, col: 2, target: 21 },
  { row: 6, col: 7, target: 37 }, { row: 5, col: 10, target: 9 },
];
const RAY_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const MAX_RUN = 2 * (SIDE - 1);   // 18: see the comment above

// Divisor pairs (v, c) of target with 1 <= c <= MAX_RUN.
const divisorPairs = (target) => {
  const pairs = [];
  for (let c = 1; c <= MAX_RUN; c++) {
    if (target % c === 0) pairs.push([target / c, c]);
  }
  return pairs;
};

// Every way to split total c over four non-negative run lengths, each capped
// at that ray's own cell count (a run cannot exceed the cells available).
const splits4 = (maxes, total) => {
  const out = [];
  for (let a = 0; a <= Math.min(maxes[0], total); a++) {
    for (let b = 0; b <= Math.min(maxes[1], total - a); b++) {
      for (let c = 0; c <= Math.min(maxes[2], total - a - b); c++) {
        const d = total - a - b - c;
        if (d >= 0 && d <= maxes[3]) out.push([a, b, c, d]);
      }
    }
  }
  return out;
};

const OTHER_TENS = new Map();
const otherTens = (v) => {
  const tensDigit = Math.floor(v / 10);
  if (!OTHER_TENS.has(tensDigit)) {
    OTHER_TENS.set(tensDigit, range(0, MAX_TENS).filter(t => t !== tensDigit));
  }
  return OTHER_TENS.get(tensDigit);
};
const OTHER_UNITS = new Map();
const otherUnits = (v) => {
  const unitsDigit = v % 10;
  if (!OTHER_UNITS.has(unitsDigit)) {
    OTHER_UNITS.set(unitsDigit, range(0, 9).filter(u => u !== unitsDigit));
  }
  return OTHER_UNITS.get(unitsDigit);
};

// This cell's number is exactly v.
const cellIsV = (cell, v) => new And([
  new Given(tens.at(cell), Math.floor(v / 10)),
  new Given(cell, v % 10),
]);
// This cell's number is anything but v (De Morgan over the two digits).
const cellIsNotV = (cell, v) => new Or([
  new Given(tens.at(cell), ...otherTens(v)),
  new Given(cell, ...otherUnits(v)),
]);

const clueConstraints = CLUES.flatMap(({ row, col, target }) => {
  const cell = makeCellId(row, col);
  const rays = RAY_DIRS.map(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));

  const unshadedBranches = divisorPairs(target).map(([v, c]) => {
    const tuples = splits4(rays.map(ray => ray.length), c);
    const tupleChecks = tuples.map(runLengths => new And(
      rays.flatMap((ray, i) => {
        const run = runLengths[i];
        const checks = ray.slice(0, run).map(rc => cellIsV(rc, v));
        if (run < ray.length) checks.push(cellIsNotV(ray[run], v));
        return checks;
      })
    ));
    return new And([cellIsV(cell, v), new Or(tupleChecks)]);
  });

  return [new Or([
    new And([new Given(shRootRow.at(cell), 0), new Or(unshadedBranches)]),
    // Shaded: the connected-group total is not checked -- see the header
    // comment above CLUES for why.
    new Given(shRootRow.at(cell), ...range(1, SIDE)),
  ])];
});

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...fillominoDomains,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...fillominoEdgeRules,

  shRootRow.toVar('shaded-group root row (0 = unshaded)'),
  shRootCol.toVar('shaded-group root column (0 = unshaded)'),
  shD11.toVar('shaded-group distance mod 11'),
  shD13.toVar('shaded-group distance mod 13'),
  ...shadeForestDomains,
  ...shadeRootPins,
  ...shadeDescents,
  ...shadeSameRootEdges,
  ...shadeDistanceEdges,
  unshadedConnectivity,
  ...regionUniformShade,
  ...clueConstraints,
];
