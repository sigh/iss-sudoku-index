// Title: Meidjuluk Fillomino Permaculture
// Author: Agent
// Video: https://www.youtube.com/watch?v=tyKysf1pfSg
// Source: https://app.crackingthecryptic.com/sudoku/Qtghbj7HtM

// 10x10, no Sudoku layer (Raw grid): rows, columns and boxes carry no rule.
//
// Rules encoded (metadata.rules, quoted in full):
//  * "Divide the grid into two areas of orthogonally connected cells. One of
//    the areas is a Meidjuluk (N=9), the other is a Fillomino." Two zones,
//    each forming exactly one connected area (VZ overlay below). N=9 is
//    given, so the Meidjuluk zone's cell count -- 1+2+...+9 = 45 -- is
//    arithmetic, not asserted; the Fillomino zone is the 55-cell complement.
//  * "Divide the Meidjuluk area into 9 regions, one of each size 1 to 9."
//    Since the 9 sizes are pairwise distinct, size doubles as a region label
//    with no separate identity machinery needed (VL overlay, values 1-9; 0
//    marks a Fillomino-zone cell).
//  * "A Meidjuluk region may not contain repeated numbers, and it may only
//    contain factors of its size (eg a region of size 6 may contain any
//    combination of 1,2,3, and 6, including none of them)." "Including none"
//    means a region need not fill every cell -- the puzzle's answer is the
//    partition, so every Meidjuluk cell without a printed given is pinned
//    blank (board value 0) below, an unstated freedom the rules leave open.
//    No-repeat and divisor rules then only ever need to look at the 28 given
//    cells.
//  * "Divide the Fillomino area into orthogonally connected regions such that
//    no two Fillomino regions of the same size share an edge, and enter a
//    number into each cell equal to the size of its region." Standard
//    Fillomino, via a root/depth construction: each cell names its region's
//    root (its first cell in reading order) and its distance to it as two
//    residues whose lcm exceeds the 55-cell zone, closing connectivity
//    without a region count; a counting scan checks the region's own number,
//    and an edge rule ties equal numbers to a shared root -- which also
//    states "no two same-size regions touch" for free (different roots at an
//    edge forces different numbers). Region sizes run past 9, so a cell's
//    number is split tens (VT overlay) / units (the board).
//  * The 28 given numbers.
//
// Zone-gating: the Fillomino machinery above must fire only between
// Fillomino-zone cells, never across the zone boundary or within the
// Meidjuluk zone -- else an edge rule would wrongly forbid an incidental
// digit match between the two different rule systems (a Meidjuluk digit and
// a neighbouring Fillomino region's size may coincide; the rules never say
// otherwise). Every Meidjuluk cell is pinned to a trivial, self-rooted,
// distance-0 Fillomino "region" of its own (VT's MEID_TENS sentinel marks it
// so nothing reads it as a real size-1 region), and a Fillomino cell's
// descent may only step to a same-zone neighbour, so no Fillomino cell can
// ever borrow a Meidjuluk cell's pinned identity. The region-size counting
// scan and the two Fillomino edge rules read the zone bit(s) first and
// always-accept (consuming the rest of the sequence) when Fillomino does not
// apply, rather than gating per neighbour -- the pin above already keeps a
// Meidjuluk cell's identity from coinciding with any other cell's.

const SIDE = 10;
const MEID_N = 9;                             // Meidjuluk's own N; regions size 1..MEID_N
const MEID_TOTAL = MEID_N * (MEID_N + 1) / 2; // 45: sum 1..9, arithmetic not asserted
const FILL_TOTAL = SIDE * SIDE - MEID_TOTAL;  // 55: the complementary zone
const MAX_TENS = Math.floor(FILL_TOTAL / 10); // 5: tens digit of a size up to 55
const MEID_TENS = MAX_TENS + 1;               // 6: sentinel VT value marking a Meidjuluk cell
const MOD_A = 8;
const MOD_B = 9;                              // lcm 72 > 55, the largest possible Fillomino region

const shape = new Shape(SIDE + 'x' + SIDE, '0-10', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// ---- Overlays ----
// VZ    - zone: 0 Fillomino, 1 Meidjuluk.
// VL    - Meidjuluk region label: 0 (not Meidjuluk) or 1..9, doubling as size.
// VT    - Fillomino tens digit of the region size (board holds the units), or
//         the MEID_TENS sentinel on a Meidjuluk cell.
// VR,VC - which cell is the root of this cell's Fillomino region (itself, on
//         a Meidjuluk cell).
// VA,VB - Fillomino distance to root, mod 8 and mod 9 (0 on a Meidjuluk cell).
const Z = graph.makeOverlay('VZ');
const VL = graph.makeOverlay('VL');
const VT = graph.makeOverlay('VT');
const VR = graph.makeOverlay('VR');
const VC = graph.makeOverlay('VC');
const VA = graph.makeOverlay('VA');
const VB = graph.makeOverlay('VB');

const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))), // board: 0-9
  restrict(Z, [0, 1]),
  restrict(VL, range(0, MEID_N)),
  restrict(VT, range(0, MEID_TENS)),
  restrict(VR, range(1, SIDE)),
  restrict(VC, range(1, SIDE)),
  restrict(VA, range(0, MOD_A - 1)),
  restrict(VB, range(0, MOD_B - 1)),
];

// Zone pin, one per cell: ties VL/VT to the zone bit, and pins a Meidjuluk
// cell's Fillomino overlay values to the trivial self-rooted, distance-0
// state described above instead of leaving them free (free values would
// multiply solutions with no puzzle meaning). A Fillomino cell's own VR/VC/
// VA/VB stay unconstrained here -- the root/descent/size machinery below
// governs them.
const zonePins = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Or([
    new And([
      new Given(Z.at(cell), 1),
      new Given(VL.at(cell), ...range(1, MEID_N)),
      new Given(VT.at(cell), MEID_TENS),
      new Given(VR.at(cell), row),
      new Given(VC.at(cell), col),
      new Given(VA.at(cell), 0),
      new Given(VB.at(cell), 0),
    ]),
    new And([
      new Given(Z.at(cell), 0),
      new Given(VL.at(cell), 0),
      new Given(VT.at(cell), ...range(0, MAX_TENS)),
    ]),
  ]);
});

// Both zones are themselves each one connected area, sized by the arithmetic
// above.
const zoneAreas = [
  new ConnectedValues('VZ', 0, FILL_TOTAL),
  new ConnectedValues('VZ', 1, MEID_TOTAL),
];

// The 9 Meidjuluk regions, one per size (label doubles as size, see header).
const meidjulukRegions = range(1, MEID_N).map(L => new ConnectedValues('VL', L, L));

// ---- Fillomino root/depth model (ZrfTSUxm0iE's construction), restricted to
// the Fillomino zone (Z=0) ----

// A cell's number is at least 1 (excludes the (tens=0, units=0) reading).
// Applies everywhere, though a Meidjuluk cell's VT is always the nonzero
// MEID_TENS sentinel, so this never actually binds there.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(cell =>
  new Pair(positive, 'number is positive', VT.at(cell), cell));

// Reads [VR, VC, VA, VB] of one cell: the root named must not come after the
// cell in reading order, and the cell is at distance 0 exactly when it is its
// own root. Unmodified from ZrfTSUxm0iE -- a Meidjuluk cell's pinned
// self-root (VR = own row, VC = own col, VA = VB = 0) already satisfies this,
// no zone check needed.
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
    VR.at(cell), VC.at(cell), VA.at(cell), VB.at(cell));
});

// Every cell is a root, or has an orthogonal neighbour ALSO in the Fillomino
// zone sharing its region and one step nearer the root -- the same-zone
// requirement (Given(Z(other), 0)) blocks a Fillomino cell from borrowing a
// Meidjuluk neighbour's pinned self-root identity (see header). A Meidjuluk
// cell's own pinned VA = VB = 0 already satisfies the root branch, so it
// never needs the neighbour branches.
const stepA = Pair.fnToKey((mine, other) => other === (mine + MOD_A - 1) % MOD_A, shape);
const stepB = Pair.fnToKey((mine, other) => other === (mine + MOD_B - 1) % MOD_B, shape);
const descents = cells.map(cell => new Or([
  new And([new Given(VA.at(cell), 0), new Given(VB.at(cell), 0)]),
  ...graph.neighbours(cell).map(other => new And([
    new Given(Z.at(other), 0),
    new SameValues(2, VR.at(cell), VR.at(other)),
    new SameValues(2, VC.at(cell), VC.at(other)),
    new Pair(stepA, 'one step nearer the root', VA.at(cell), VA.at(other)),
    new Pair(stepB, 'one step nearer the root', VB.at(cell), VB.at(other)),
  ])),
]));

// Region size equals its number, Fillomino zone only. Reads Z(cell) first and
// always accepts (consuming the rest of the sequence) when the cell is
// Meidjuluk -- its pinned self-root would otherwise be checked against a
// manufactured "number" (MEID_TENS*10 + board digit) that means something
// else entirely. When Fillomino, unchanged from ZrfTSUxm0iE: reads [VA, VB,
// VT, board, then VR/VC of every cell from itself on in reading order]; a
// distance-0 cell is named by exactly its own number's worth of cells (only
// itself or later can name it, bounding the counter), a positive-distance
// cell by nobody. No same-zone check is needed on the later cells: a
// Meidjuluk cell's pinned self-root never coincides with any other cell's,
// real Fillomino root or not (the zone-gated descent above already forbids a
// Fillomino cell from ever adopting it), so it can never be miscounted here.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'zone' },
      transition: (state, value) => {
        if (state.phase === 'zone') {
          return value === 1 ? { phase: 'skipAll' } : { phase: 'd11' };
        }
        if (state.phase === 'skipAll') return { phase: 'skipAll' };
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
      accept: state => state.phase === 'skipAll' || (state.phase === 'row' && state.rem === 0),
    }, shape));
  }
  return sizeSpecs.get(key);
};
const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  const maxArea = Math.min(FILL_TOTAL, later.length);
  return new NFA(sizeSpec(row, col, maxArea), 'region size equals its number (Fillomino only)',
    Z.at(cell), VA.at(cell), VB.at(cell), VT.at(cell), cell,
    ...later.flatMap(other => [VR.at(other), VC.at(other)]));
});

// Reads [VR(a), VR(b), VC(a), VC(b)] and ends in a state recording whether a
// and b are in the same Fillomino region.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Fillomino zone only (reads Z(a), Z(b) first, always-accepts otherwise --
// see header). When both Fillomino, reads [VT(a), VT(b), a, b, VR(a), VR(b),
// VC(a), VC(b)] for one orthogonal edge: the two numbers are equal exactly
// when the two cells are in the same region -- which also states "no two
// same-size regions touch" (different regions force different numbers).
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 'zoneA' },
  transition: (state, value) => {
    if (state.phase === 'zoneA') return { phase: 'zoneB', filloA: value === 0 };
    if (state.phase === 'zoneB') {
      return (state.filloA && value === 0) ? { phase: 0 } : { phase: 'skipAll' };
    }
    if (state.phase === 'skipAll') return { phase: 'skipAll' };
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
  accept: state => state.phase === 'skipAll' || state.phase === 8,
}, shape);

// Fillomino zone only, same gate as above. When both Fillomino, reads [VR(a),
// VR(b), VC(a), VC(b), VA(a), VA(b), VB(a), VB(b)]: within a region, one step
// changes the distance to the root by -1, 0 or +1, the same amount in both
// residues -- what makes the residue pair the true distance rather than any
// descending chain.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 'zoneA' },
  transition: (state, value) => {
    if (state.phase === 'zoneA') return { phase: 'zoneB', filloA: value === 0 };
    if (state.phase === 'zoneB') {
      return (state.filloA && value === 0) ? { phase: 0 } : { phase: 'skipAll' };
    }
    if (state.phase === 'skipAll') return { phase: 'skipAll' };
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
  accept: state => state.phase === 'skipAll' || state.phase === 8,
}, shape);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a Fillomino region',
    Z.at(a), Z.at(b), VT.at(a), VT.at(b), a, b,
    VR.at(a), VR.at(b), VC.at(a), VC.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    Z.at(a), Z.at(b), VR.at(a), VR.at(b), VC.at(a), VC.at(b),
    VA.at(a), VA.at(b), VB.at(a), VB.at(b)),
]);

// ---- Givens, and the Meidjuluk-only conditional rules over them ----

// Transcribed from the 28 numbers printed in the grid (metadata.cells, decode
// summary): [row, col, digit].
const GIVENS = [
  [1, 1, 2], [1, 3, 9], [1, 5, 8], [1, 10, 2],
  [2, 2, 2], [2, 9, 2],
  [3, 3, 6], [3, 6, 4], [3, 8, 3],
  [4, 7, 6], [4, 9, 9],
  [5, 5, 1], [5, 6, 6], [5, 8, 5],
  [6, 5, 6], [6, 6, 1],
  [7, 9, 4],
  [8, 1, 9], [8, 4, 1], [8, 5, 1], [8, 6, 8], [8, 10, 3],
  [9, 2, 2], [9, 6, 1], [9, 9, 2],
  [10, 1, 2], [10, 8, 9], [10, 10, 2],
];
const givenCells = GIVENS.map(([row, col]) => makeCellId(row, col));
const givens = GIVENS.map(([row, col, d]) => new Given(makeCellId(row, col), d));

// If a given cell turns out Meidjuluk, its digit must be a divisor of its
// region's size -- restrict the label to sizes divisible by it; skipped
// entirely when the cell turns out Fillomino instead.
const divisorRestrictions = GIVENS.map(([row, col, d]) => {
  const cell = makeCellId(row, col);
  return new Or([
    new Given(Z.at(cell), 0),
    new Given(VL.at(cell), ...range(1, MEID_N).filter(L => L % d === 0)),
  ]);
});

// If two given cells share a digit AND are both Meidjuluk, "no repeated
// numbers" means they cannot be the same region -- i.e. different labels
// (label doubles as size, so this is a conditional AllDifferent, one Pair per
// pair since either cell might turn out Fillomino instead).
const byDigit = new Map();
for (const [row, col, d] of GIVENS) {
  if (!byDigit.has(d)) byDigit.set(d, []);
  byDigit.get(d).push(makeCellId(row, col));
}
const pairs = arr => arr.flatMap((a, i) => arr.slice(i + 1).map(b => [a, b]));
const notEqual = Pair.fnToKey((a, b) => a !== b, shape);
const noRepeats = [...byDigit.values()]
  .filter(sameDigitCells => sameDigitCells.length > 1)
  .flatMap(sameDigitCells => pairs(sameDigitCells).map(([p, q]) => new Or([
    new Given(Z.at(p), 0),
    new Given(Z.at(q), 0),
    new Pair(notEqual, 'no repeat within a Meidjuluk region', VL.at(p), VL.at(q)),
  ])));

// Every non-given cell: pinned blank (0) on the board if Meidjuluk (the
// representative pin described in the header); left alone if Fillomino,
// where the root/depth model above governs its number.
const givenSet = new Set(givenCells);
const blankPins = cells.filter(cell => !givenSet.has(cell)).map(cell => new Or([
  new And([new Given(Z.at(cell), 1), new Given(cell, 0)]),
  new Given(Z.at(cell), 0),
]));

return [
  shape,
  Z.toVar('zone'),
  VL.toVar('Meidjuluk region label'),
  VT.toVar('Fillomino tens digit / Meidjuluk sentinel'),
  VR.toVar('Fillomino root row'),
  VC.toVar('Fillomino root column'),
  VA.toVar('Fillomino distance to root mod 8'),
  VB.toVar('Fillomino distance to root mod 9'),
  ...domains,
  ...zonePins,
  ...zoneAreas,
  ...meidjulukRegions,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...givens,
  ...divisorRestrictions,
  ...noRepeats,
  ...blankPins,
];
