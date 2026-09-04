// Title: Chequered Arromino #1
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ni8B99W6Xsk
// Source: https://app.crackingthecryptic.com/sudoku/NQQHttHLHd

// Rules encoded here:
//  * Standard Fillomino: divide the grid into orthogonally-connected regions
//    (polyominoes); each cell's digit equals the size of its own region; two
//    regions of the same size may never share an edge. No digits are given --
//    the whole grid and its partition are deduced.
//  * Every region is shaded one of two colours; two regions sharing an edge
//    must be shaded differently.
//  * Nine cells each carry one or more short direction arrows, each entirely
//    inside one cell rather than a Sudoku-style path between cells. Such a
//    cell's digit equals the count of cells sharing its own shading colour
//    along its arrow direction(s) combined, from the adjacent cell out to the
//    grid edge -- a plain tally over the whole ray, not a sightline that stops
//    at the first differently-shaded cell (see the arrow-clue comment below
//    for why: with only two shades, that first differently-shaded region is
//    not the end of the story).
//
// Nothing is omitted.

const SIDE = 7;
const MAX_AREA = SIDE * SIDE;                  // 49: a region may span the board
const MAX_TENS = Math.floor(MAX_AREA / 10);    // 4

// No Sudoku layer at all -- region sizes repeat freely, so rows/columns/boxes
// carry no rule: Raw grid. Every layer below (main-grid units 0-9, root
// row/col 1-7, tens 0-4, the two distance residues, the 0/1 shade) tops out
// at 9, so the grid's own 0-9 alphabet already covers all of them; no
// widening past the natural alphabet is needed here.
const shape = new Shape('7x7', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// ---------------------------------------------------- Fillomino identity ---
//
// A region is the set of cells naming the same root, its first cell in
// reading order (a label-free spanning-forest: per-cell identity as a root
// row/col plus a distance, rather than a shared region-id label). Five
// overlays carry it:
//   tens     - tens digit of the cell's region size (the board holds the
//              units digit, so a size above 9 -- up to MAX_AREA=49 -- still
//              fits across the two layers);
//   rootRow
//   rootCol  - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 7 and 8.
// MOD_A*MOD_B (7*8=56) exceeds MAX_AREA-1 (48, the largest possible distance
// within a region), so the residue pair is the true distance rather than any
// two numbers that merely change together step to step.
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const MOD_A = 7;
const MOD_B = 8;

// A cell's own shading colour (0/1). Constant within a region; see the
// shadeEdgeSpec rule below for how it ties to the region identity above.
const shade = graph.makeOverlay('VSH');

const domains = [
  restrict(tens, range(0, MAX_TENS)),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(d11, range(0, MOD_A - 1)),
  restrict(d13, range(0, MOD_B - 1)),
  restrict(shade, range(0, 1)),
];

// A region has at least one cell.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'region size is positive', tens.at(cell), cell));

// Reads [rootRow, rootCol, d11, d13] of one cell. The named root must not come
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
// one step nearer the root. Following such neighbours changes the residue
// pair by one each step, so the walk cannot revisit a cell within 56 steps
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
  return new NFA(sizeSpec(row, col, later.length), 'region area equals its number',
    d11.at(cell), d13.at(cell), tens.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [tens(a), tens(b), units(a), units(b), rootRow(a), rootRow(b),
// rootCol(a), rootCol(b)] for one orthogonal edge: the two numbers are equal
// exactly when the two cells are in the same region. Within a region that
// makes the number uniform; across a boundary it is "regions of equal area do
// not share an edge".
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
    if (state.phase < 4) {
      if (state.phase === 0) return { phase: 1, mine: value };
      if (state.phase === 1) return { phase: 2, same: value === state.mine };
      if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
      return { phase: 4, same: state.same && value === state.mine };
    }
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

// Reads [tens(a), tens(b), units(a), units(b), shade(a), shade(b)]: shading
// agrees exactly when the region-size numbers agree. Adjacent cells with
// equal numbers are the same region (numberEdgeSpec above), so this ties
// shading to the same region identity without a second root comparison:
// same region -> same shade; different (necessarily differently-sized, so
// differently-numbered) regions -> different shade, exactly the rules'
// "regions touching at an edge must have different colouring".
const shadeEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameTens: value === state.mine };
    if (state.phase === 2) return { phase: 3, sameTens: state.sameTens, mine: value };
    if (state.phase === 3) {
      const sameNumber = state.sameTens && value === state.mine;
      return { phase: 4, sameNumber };
    }
    if (state.phase === 4) return { phase: 5, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 5) {
      const sameShade = value === state.mine;
      return sameShade === state.sameNumber ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
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
  new NFA(shadeEdgeSpec, 'shading matches exactly within a region',
    tens.at(a), tens.at(b), a, b, shade.at(a), shade.at(b)),
]);

// ---------------------------------------------------------------- arrows ---
//
// Nine cells carry one or more direction arrows, each drawn as a short stub
// inside a single cell rather than a path spanning several cells: the tail
// sits inside the cell that owns the arrow and the head marks its pointed
// direction. Each direction's contribution is the run of cells sharing the
// clue cell's own shade, read outward from the adjacent cell until a
// differently-shaded cell or the grid edge; the clue cell's number is the sum
// of those runs across every arrow it carries.
const DIR_VECTORS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  'up-left': [-1, -1],
};

// [row, col, [directions]], transcribed from the drawn arrow stubs.
const ARROW_CELLS = [
  [1, 4, ['right']],
  [1, 5, ['left']],
  [1, 6, ['left']],
  [3, 4, ['down']],
  [4, 2, ['right']],
  [5, 3, ['left', 'down', 'right']],
  [5, 4, ['up-left']],
  [5, 7, ['left']],
  [7, 7, ['up-left']],
];

// Reads [shade(cell), units(cell), then every cell of every ray (concatenated
// in direction order), from the adjacent cell out to the grid edge]. Only two
// shades exist and a proper 2-colouring of touching regions must alternate
// (with just two colours, "differs from its neighbour" forces "same as the
// neighbour before that" all the way along any chain of adjacent regions), so
// a ray leaving the clue cell's own region does not simply stop mattering: it
// keeps meeting the clue's own shade again every other region out. So this is
// a plain tally -- how many of the ray cells (over every direction the clue
// carries, combined) share the clue cell's own shade -- not a sightline count
// that stops at the first differently-shaded cell.
const arrowCountSpecs = new Map();
const arrowCountSpec = (totalRayCells) => {
  const key = String(totalRayCells);
  if (!arrowCountSpecs.has(key)) {
    arrowCountSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'origin' },
      transition: (state, value) => {
        if (state.phase === 'origin') {
          // A shading colour is 0 or 1; rejecting anything else up front
          // keeps the state graph from also exploring the six digit values
          // shade never takes.
          return (value === 0 || value === 1)
            ? { phase: 'target', origin: value } : undefined;
        }
        if (state.phase === 'target') {
          return { phase: 'ray', origin: state.origin, target: value, idx: 0, count: 0 };
        }
        // No further ray symbols are expected once every cell has been read.
        if (state.idx >= totalRayCells) return undefined;
        if (value !== 0 && value !== 1) return undefined;
        const count = state.count + (value === state.origin ? 1 : 0);
        // Prune once the tally has already exceeded the target: it only ever
        // grows from here, so no continuation can still accept.
        if (count > state.target) return undefined;
        return { ...state, idx: state.idx + 1, count };
      },
      accept: state => state.phase === 'ray' && state.idx === totalRayCells && state.count === state.target,
    }, shape));
  }
  return arrowCountSpecs.get(key);
};

const arrowClues = ARROW_CELLS.flatMap(([row, col, dirs]) => {
  const cell = makeCellId(row, col);
  const rays = dirs.map(dir => graph.ray(cell, ...DIR_VECTORS[dir]).slice(1));
  const rayCells = rays.flat();
  // Every one of these nine cells' arrow-implied maximum (a tally can never
  // exceed how many ray cells there are to tally) is well under 10 -- e.g.
  // R5C3's three rays total at most 2 (left) + 2 (down) + 4 (right) = 8, and
  // no single ray on this 7-wide board exceeds 6 -- so the true region size
  // here is always a single-digit number: its tens digit is 0.
  return [
    new Given(tens.at(cell), 0),
    new NFA(arrowCountSpec(rayCells.length), 'arrow direction count',
      shade.at(cell), cell, ...shade.at(rayCells)),
  ];
});

return [
  shape,
  tens.toVar('tens digit of the region size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 7'),
  d13.toVar('distance to root mod 8'),
  shade.toVar('region shading colour'),
  ...domains,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...arrowClues,
];
