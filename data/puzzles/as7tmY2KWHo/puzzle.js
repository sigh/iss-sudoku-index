// Title: Bridges and Fillings
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=as7tmY2KWHo
// Source: https://app.crackingthecryptic.com/sudoku/PB7BG3N9Jr

// Bridges and Fillings, 10x10. No Sudoku layer at all: the grid is Raw, so
// rows, columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into polyominoes; every cell holds a number
//    equal to its own polyomino's size; two polyominoes of equal size never
//    share an edge (diagonal contact is fine). A polyomino may be any shape.
//  * Parity lines. Each drawn line runs between exactly two circled cells
//    (every other cell on it is uncircled). One circle holds an odd number
//    and the other an even number; the odd one equals how many of the
//    line's other cells (i.e. every cell on the line except itself) hold an
//    odd number, and the even one equals how many hold an even number.
//  * Parity arrows. A cell bearing a small arrow reads the ray of cells the
//    arrow points along, from the board edge back to (but excluding) itself:
//    if the arrow cell's own number is odd it equals the count of odd
//    numbers on that ray, if even it equals the count of even numbers.
//
// Nothing is omitted. As in ZrfTSUxm0iE (blockers #1618/#2041), a region's
// size is not capped by the rules and can run to the board's own 100-cell
// area, past what one board cell can hold: every cell's number is its tens
// digit on an overlay (VT) plus the board's own units digit (Raw 0-15).

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's
// root is its first cell in reading order. Six overlays carry it:
//   tens    - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself);
//   par     - 1 iff the cell's number is odd (the parity clues' own layer).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const par = graph.makeOverlay('VP');
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
  restrict(par, [0, 1]),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

// A cell's number is odd exactly when its units digit is odd (a multiple of
// ten never changes parity), so par is a function of the board alone.
const parityKey = Pair.fnToKey((u, p) => (u % 2) === p, shape);
const parities = cells.map(
  cell => new Pair(parityKey, 'parity of the number', cell, par.at(cell)));

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
// exactly when the two cells are in the same region. This is both halves of
// the Fillomino adjacency rule at once: same region -> same number, and
// (since two different regions can never carry equal numbers) equal-size
// regions never touch orthogonally.
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

// ---- Parity lines and arrows ----
//
// A cell whose number reads a parity tally off some fixed list of other
// cells: if its own number is odd, that number equals how many cells in the
// list hold an odd number; if even, how many hold an even number (a count of
// evens is the list length minus the count of odds). One Or of two branches,
// each pinning the cell's own parity and tying the tally to its split number
// with a coefficient Sum.
function parityTallyClue(counter, others) {
  const n = others.length;
  return new Or([
    new And([
      new Given(par.at(counter), 1),
      new Sum(0, ...par.at(others), [tens.at(counter), -10], [counter, -1]),
    ]),
    new And([
      new Given(par.at(counter), 0),
      new Sum(n, ...par.at(others), [tens.at(counter), 10], [counter, 1]),
    ]),
  ]);
}

// Each drawn red line's full cell path, transcribed from its plotted route
// (turn corners expanded to every intermediate cell). A blank circle sits at
// each line's own two endpoints and nowhere else, so each path below is
// exactly one "line" of the rules text.
//
// The one drawn stroke connecting R1C10 to R8C8 passes through four more
// circled cells along its own interior (R2C9, R1C8, R3C8, R4C7): a mark
// partway along a drawn stroke can split it into separate clues, and here
// the rules' own "one circle contains an odd number, and the other an even"
// -- exactly two circles per line -- forces that single stroke to be five
// separate abutting lines, each sharing its boundary circle with its
// neighbour. It is split into LINES entries accordingly.
// [row, col] pairs, not R#C# strings: row/col 10 is not the two-character
// substring "10" in this solver's own cell ids (it is the single base-36
// digit "a", e.g. "RaC8"), so every path is built through makeCellId below
// rather than hand-written as text.
const LINE_PATHS = [
  [[1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [2, 2], [2, 3], [2, 4]],
  [[1, 10], [2, 10], [3, 10], [3, 9], [2, 9]],
  [[2, 9], [1, 9], [2, 8], [2, 7], [1, 8]],
  [[1, 8], [1, 7], [1, 6], [2, 6], [3, 6], [3, 7], [3, 8]],
  [[3, 8], [4, 8], [4, 9], [5, 9], [5, 8], [5, 7], [4, 7]],
  [[4, 7], [4, 6], [4, 5], [5, 5], [5, 6], [6, 6], [7, 6], [6, 7], [7, 7], [8, 7], [8, 8]],
  [[6, 3], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 4], [5, 4], [6, 4]],
  [[7, 1], [6, 1], [5, 1], [4, 1], [4, 2], [5, 2], [6, 2]],
  [[6, 10], [7, 10], [8, 10], [8, 9], [7, 9], [6, 8], [6, 9]],
  [[8, 2], [8, 1], [9, 1], [10, 1], [9, 2], [10, 3], [10, 2]],
  [[8, 4], [9, 4], [10, 4], [9, 3], [8, 3], [7, 3], [7, 4], [7, 5], [6, 5]],
  [[9, 5], [8, 5], [9, 6], [10, 6], [10, 7], [9, 7], [9, 8], [10, 8], [9, 9]],
];
const LINES = LINE_PATHS.map(path => path.map(([r, c]) => makeCellId(r, c)));

const lineRules = LINES.flatMap(path => {
  const a = path[0];
  const b = path[path.length - 1];
  return [
    parityTallyClue(a, path.filter(c => c !== a)),
    parityTallyClue(b, path.filter(c => c !== b)),
    // "One circle contains an odd number, and the other an even": with par
    // restricted to {0, 1}, forcing the two endpoints' par cells apart is
    // exactly forcing them to opposite parities, not merely leaving that to
    // happen on its own.
    new AllDifferent(par.at(a), par.at(b)),
  ];
});

// Each drawn arrow's host cell and direction: a short stub from just inside
// the host cell to a point on its border (an orthogonal direction) or a
// corner it shares with three other cells (a diagonal direction).
const ARROWS = [
  ['R1C3', 1, 1],   // down-right
  ['R4C1', 1, 1],   // down-right
  ['R5C4', -1, 1],  // up-right
  ['R7C6', 1, 1],   // down-right
  ['R9C7', -1, 0],  // up
  ['R6C7', 0, 1],   // right
  ['R5C7', -1, 1],  // up-right
  ['R5C9', 0, 1],   // right
  ['R7C9', -1, 0],  // up
];

function ray(cellId, dRow, dCol) {
  const out = [];
  let { row, col } = parseCellId(cellId);
  for (;;) {
    row += dRow;
    col += dCol;
    if (row < 1 || row > SIDE || col < 1 || col > SIDE) return out;
    out.push(makeCellId(row, col));
  }
}

const arrowRules = ARROWS.map(([at, dRow, dCol]) => parityTallyClue(at, ray(at, dRow, dCol)));

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  par.toVar('parity of the number'),
  ...domains,
  ...positives,
  ...parities,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...lineRules,
  ...arrowRules,
];
