// Title: Fully Booked [Numbered Rooms Fillomino]
// Author: MicroStudy
// Video: https://www.youtube.com/watch?v=4Tu-ZcWH8to
// Source: https://sudokupad.app/10mumnjiuu

// 11x11 canvas, Raw grid (no Sudoku rows/columns/boxes -- Fillomino numbers
// repeat freely). 8 cells are blacked out and excluded from the grid; the
// remaining 113 cells (81 inner 9x9 + 32 outer-ring) are one Fillomino.
//
// Rules encoded:
//  * Fillomino over the 113 playable cells: regions of orthogonally-connected
//    cells, each cell's number equal to its region's size, no two same-size
//    regions orthogonally adjacent. A region may span inner and outer cells.
//  * The 8 given numbers.
//  * Numbered Rooms, applied to *every* playable outer-ring cell (not just the
//    given ones): the outer cell's own Fillomino number must equal the number
//    in the Nth interior cell counting from the first interior cell reached
//    from that side, where N is the number in that first interior cell.
//
// Nothing is omitted. Region sizes could in principle run to all 113 playable
// cells, so (as in ZrfTSUxm0iE, "Checkered Fillomino") a size does not fit one
// 16-value cell: every cell's number is held as its tens digit on an overlay
// and its units digit on the main grid.

const SIDE = 11;
const AREA = SIDE * SIDE;

// The 8 blacked-out cells (drawn as filled-in squares): not part of the grid.
const BLACK = [
  [1, 1], [1, 10], [1, 11], [7, 11], [11, 1], [11, 9], [11, 10], [11, 11],
].map(([r, c]) => makeCellId(r, c));
const BLACK_SET = new Set(BLACK);

const MAX_AREA = AREA - BLACK.length; // 113: the true cap on a region's size.
const MAX_TENS = Math.floor(MAX_AREA / 10); // 11: tens digit of 113.

const shape = new Shape(`${SIDE}x${SIDE}`, '0-15', 'Raw');
const graph = cellGraph(shape);
const allCells = graph.cells(); // full 121-cell rectangle, in reading order.
const cells = allCells.filter(c => !BLACK_SET.has(c)); // 113 playable cells.

// Real (in-grid) neighbours only: a black cell is a wall, not a connector.
const realNeighbours = cell =>
  graph.neighbours(cell).filter(n => !BLACK_SET.has(n));

// A region is the set of cells that name the same root, where a region's root
// is its first cell in reading order. Five whole-grid overlays carry it:
//   tens             - tens digit of the cell's number (main grid: units);
//   rootRow, rootCol - which cell is the root of this cell's region;
//   d11, d13         - the cell's distance from its root, as residues mod 11
//                      and 13 (lcm 143 > 113, so the pair is the distance
//                      itself).
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
  graph.makeReplicate(new Given(allCells[0], ...range(0, 9))),
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
];

// The 8 blacked-out cells are excluded from every Fillomino rule below; pin
// each of their layers to a fixed value (within its restricted domain above)
// so they contribute no free choices to the search.
const blackPins = BLACK.flatMap(cell => [
  new Given(cell, 0),
  new Given(tens.at(cell), 0),
  new Given(rootRow.at(cell), 1),
  new Given(rootCol.at(cell), 1),
  new Given(d11.at(cell), 0),
  new Given(d13.at(cell), 0),
]);

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

// Every cell other than a root has a REAL (non-black) orthogonal neighbour in
// its own region one step nearer the root. Following such neighbours changes
// the residue pair by one each step, so the walk cannot revisit a cell within
// 143 steps and must reach a root: the region is connected (through playable
// cells only) and contains the cell it names.
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = cells.map(cell => new Or([
  new And([new Given(d11.at(cell), 0), new Given(d13.at(cell), 0)]),
  ...realNeighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepA, 'one step nearer the root', d11.at(cell), d11.at(other)),
    new Pair(stepB, 'one step nearer the root', d13.at(cell), d13.at(other)),
  ])),
]));

// Reads [d11(cell), d13(cell), tens(cell), units(cell), then rootRow and
// rootCol of this cell and of every playable cell after it in reading order].
// A cell at distance 0 is a root, and exactly its number's worth of playable
// cells name it; only cells at or after it in reading order can, so `maxArea`
// (how many there are) bounds the count. A cell at positive distance is named
// by nobody.
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
// rootCol(a), rootCol(b)] for one orthogonal edge between two playable cells:
// the two numbers are equal exactly when the two cells are in the same
// region.
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

// Edges between two REAL (non-black) orthogonally-adjacent cells only -- a
// black cell never carries a "same number iff same region" or distance rule.
const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return (other && !BLACK_SET.has(other)) ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// Transcribed from the drawn givens: [row, col, number].
const GIVENS = [
  [2, 3, 3], [3, 2, 2], [7, 8, 6], [10, 7, 4], // inner-grid givens
  [2, 11, 4], [4, 1, 3], [8, 1, 4], [11, 5, 6], // outer-ring givens
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(tens.at(cell), Math.floor(number / 10)),
    new Given(cell, number % 10),
  ];
});
const GIVEN_VALUE = new Map(GIVENS.map(([row, col, number]) => [makeCellId(row, col), number]));

// Numbered Rooms: every playable outer-ring cell sits opposite exactly one
// interior line (an outer cell aligned with an interior row/column, one step
// outside it -- corners are all blacked out, so no cell is aligned with two
// lines). Build the one-per-side clue list by direction: (dRow, dCol) points
// from the outer cell into the interior.
const outerClues = [
  ...range(2, 10).map(c => ({ cell: makeCellId(1, c), dRow: 1, dCol: 0 })), // top
  ...range(2, 10).map(c => ({ cell: makeCellId(11, c), dRow: -1, dCol: 0 })), // bottom
  ...range(2, 10).map(r => ({ cell: makeCellId(r, 1), dRow: 0, dCol: 1 })), // left
  ...range(2, 10).map(r => ({ cell: makeCellId(r, 11), dRow: 0, dCol: -1 })), // right
].filter(({ cell }) => !BLACK_SET.has(cell)); // 32 playable outer clue cells.

// For a clue cell, its interior line (first-to-last from the clue's side) is
// exactly the 9 interior cells: the ray from the clue drops its own cell (the
// clue itself) and runs one step further than the interior on the far side,
// which this puzzle's geometry never reaches (every clue is immediately
// outside the interior, and every corner beyond it is blacked out), so
// slicing to 9 cells after the clue is exactly the interior line.
const interiorLine = ({ cell, dRow, dCol }) => graph.ray(cell, dRow, dCol).slice(1, 10);

// Or over which position N (1..9) the clue's own number occupies: the first
// interior cell must read N, and the Nth interior cell must hold the clue's
// own number (a literal for a given outer cell, otherwise the outer cell's
// own -- unknown -- two-layer number). When N=1 the "first" and "Nth" cell
// are the same cell: for a literal clue that only holds together when the
// literal equals 1 (one assertion, not two conflicting Givens on one cell),
// so every other N=1 branch is dropped as unsatisfiable instead of built.
const numberedRoomRules = outerClues.map(clue => {
  const line = interiorLine(clue);
  const first = line[0];
  const literal = GIVEN_VALUE.get(clue.cell);
  const branches = line.flatMap((target, idx) => {
    const n = idx + 1;
    if (target === first) {
      // n === 1: first and Nth are the same cell.
      if (literal === undefined) {
        // Position and value agree automatically (SameValues ties this
        // cell, which is also the clue's own line-1 read, to itself).
        return [new And([
          new Given(tens.at(first), 0), new Given(first, n),
          new SameValues(2, tens.at(target), tens.at(clue.cell)),
          new SameValues(2, target, clue.cell),
        ])];
      }
      return literal === n
        ? [new And([new Given(tens.at(first), 0), new Given(first, n)])]
        : [];
    }
    const positionFixed = [new Given(tens.at(first), 0), new Given(first, n)];
    const valueFixed = literal !== undefined
      ? [
        new Given(tens.at(target), Math.floor(literal / 10)),
        new Given(target, literal % 10),
      ]
      : [
        new SameValues(2, tens.at(target), tens.at(clue.cell)),
        new SameValues(2, target, clue.cell),
      ];
    return [new And([...positionFixed, ...valueFixed])];
  });
  return new Or(branches);
});

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  ...domains,
  ...blackPins,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...numberedRoomRules,
];
