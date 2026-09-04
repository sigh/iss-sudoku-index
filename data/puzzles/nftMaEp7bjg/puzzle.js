// Title: Spectrum [Four Colour Theorem Fillomino]
// Author: MicroStudy
// Video: https://www.youtube.com/watch?v=nftMaEp7bjg
// Source: https://app.crackingthecryptic.com/sudoku/GLjgtD4QDJ

// Spectrum, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into regions of orthogonally-connected
//    cells; the numbers within a region are all the same and equal to the
//    region's size; no two regions of the same size share an edge.
//  * Four Colour Theorem. Each region is shaded in one of four colours;
//    regions of the same colour never touch orthogonally; regions of the
//    same colour have distinct sizes; all four colours are used somewhere.
//  * Arrows (18 short arrow marks, each anchored on one cell with a
//    direction and no separate digit -- the rules read "digits on arrows",
//    and the only digit layer in this puzzle is each cell's own Fillomino
//    number, so an arrow's target is the number already printed in its own
//    cell): the cell's own number equals the distance, counted in the
//    arrow's direction, to the nearest cell sharing its colour (an adjacent
//    matching cell is distance 1). "Not all arrows are necessarily given"
//    is read as: the relation is only asserted at the 18 marked
//    (cell, direction) pairs, not at every cell/direction that might also
//    satisfy it.
//  * The 3 given numbers.
//
// Region sizes run to the board's own cap of 100 cells, so a size does not
// fit in one 16-value cell: every cell's number is held as its tens digit
// on an overlay and its units digit on the board. A region is the set of
// cells naming the same root cell (its first cell in reading order), with
// membership certified by a residue-pair distance from that root -- this
// rooted-forest identity is reused, unchanged, for both the Fillomino size
// layer and the Four Colour Theorem colour layer below.
//
// Colour is a fifth label, broadcast per region the same way region size
// is: the region-identity edge rule that ties equal numbers to shared
// membership is reused verbatim (renamed) to tie equal colours to shared
// membership, which simultaneously states "one colour per region" and
// "regions of the same colour do not touch" (the two cells of an
// orthogonal edge are in different regions exactly when their colours
// differ). Swapping which of the four numeric labels 1-4 means which
// physical colour is a symmetry the rules never name (only the shading
// pattern and the four colours' distinct sizes matter) -- pinned by a
// canonical-labelling scan: colour value k cannot appear before colour
// value k-1 has already appeared earlier in reading order. The same scan's
// final state (all of 1..4 seen) also states "four colours are used".
//
// "Regions of the same colour have distinct sizes" has no per-region label
// to carry it (the partition is unanchored and unbounded -- neither colour
// nor size alone identifies a region), so it is stated directly over the
// board: for every colour value and every candidate size, at most one
// root cell (a cell naming itself as its own region's first cell in
// reading order) may hold that (colour, size) pair. One small counting NFA
// per (colour, size) pair scans the whole grid for this, independent of
// cell position -- 4 colours x 100 candidate sizes.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10); // 10: the tens digit of 100
const NUM_COLOURS = 4;

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's
// root is its first cell in reading order. Seven overlays carry it:
//   tens    - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself);
//   colour  - the region's Four Colour Theorem colour, 1-4.
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const colour = graph.makeOverlay('VS');
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
  restrict(colour, range(1, NUM_COLOURS)),
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

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), colour(a),
// colour(b)]: two cells share a colour exactly when they are in the same
// region, so a region is coloured as a whole (Four Colour Theorem: "each
// region must be shaded entirely in one colour") and two regions that touch
// (an orthogonal edge with different roots) always differ ("regions of the
// same colour cannot touch orthogonally"). The same-iff-same-region check
// never depends on how many distinct colour values there are, so it is the
// same construction as the number-broadcast edge rule above, just applied
// to the colour layer instead of the size layer.
const colourEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRegion(state, value);
    if (state.phase === 4) return { phase: 5, same: state.same, mine: value };
    if (state.phase === 5) {
      return (value === state.mine) === state.same ? { phase: 6 } : undefined;
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
  new NFA(colourEdgeSpec, 'one colour per region, touching regions differ',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    colour.at(a), colour.at(b)),
]);

// Canonical colour labelling, read over every cell's colour value in reading
// order: label k may not appear before label k-1 has already appeared (a
// restricted-growth-string scan, runningMax = highest label seen so far).
// This pins the otherwise free symmetry of which of the four numeric labels
// 1-4 names which physical colour -- the rules distinguish colours only by
// the shading pattern and by the distinct-sizes rule below, never by label
// number, so an unpinned encoding would multiply every real solution by the
// 4! = 24 ways to permute the labels. Ending with runningMax === 4 also
// states "there are a total of four different colours in the grid": every
// label up to 4 must have appeared by the last cell.
const canonicalLabelSpec = NFA.encodeSpec({
  startState: { runningMax: 0 },
  transition: (state, value) => {
    if (value > state.runningMax + 1) return undefined;
    return { runningMax: Math.max(state.runningMax, value) };
  },
  accept: state => state.runningMax === NUM_COLOURS,
}, shape);
const canonicalLabel = new NFA(canonicalLabelSpec, 'canonical colour labelling',
  ...colour.at(cells));

// "Regions of the same colour must be of different sizes." No compact label
// carries a region here (the partition is unanchored and unbounded, and
// neither colour nor size alone identifies one), so this is stated
// directly: for every colour c and every candidate size s, at most one
// root cell (d11 = d13 = 0) may hold colour c and number s. Each is a small
// counting NFA -- reject on a second match -- reading every cell's
// [d11, d13, colour, tens, units] in turn; the check is per-cell only (root,
// colour and size are all local facts), so no cell position is carried and
// the state stays tiny regardless of scan length.
const bucketSpecs = new Map();
const bucketSpec = (c, s) => {
  const key = c + '_' + s;
  if (!bucketSpecs.has(key)) {
    const wantTens = Math.floor(s / 10);
    const wantUnits = s % 10;
    bucketSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0, count: 0 },
      transition: (state, value) => {
        if (state.phase === 0) return { phase: 1, count: state.count, rootA: value === 0 };
        if (state.phase === 1) {
          return { phase: 2, count: state.count, root: state.rootA && value === 0 };
        }
        if (state.phase === 2) {
          return { phase: 3, count: state.count, root: state.root, colourMatch: value === c };
        }
        if (state.phase === 3) {
          return {
            phase: 4, count: state.count, root: state.root,
            colourMatch: state.colourMatch, tensMatch: value === wantTens,
          };
        }
        // phase 4: units. Close out this cell and cycle back to phase 0.
        const isMatch = state.root && state.colourMatch && state.tensMatch && value === wantUnits;
        const count = state.count + (isMatch ? 1 : 0);
        if (count > 1) return undefined;
        return { phase: 0, count };
      },
      accept: () => true,
    }, shape));
  }
  return bucketSpecs.get(key);
};

const distinctSizePerColour = range(1, NUM_COLOURS).flatMap(c => range(1, MAX_AREA).map(s => {
  const spec = bucketSpec(c, s);
  return new NFA(spec, `at most one region of colour ${c} has size ${s}`,
    ...cells.flatMap(cell => [d11.at(cell), d13.at(cell), colour.at(cell), tens.at(cell), cell]));
}));

// Arrows. Each of the 18 short arrow marks is a direction anchored on one
// cell with no drawn digit; the rules read "digits on arrows", and the only
// digit layer here is each cell's own Fillomino number, so the arrow's
// target is that number. Transcribed as [row, col, direction] from the tiny
// arrow marks (waypoints read by tail position and direction of travel; the
// tail always sits strictly inside one cell, off any lattice boundary, so
// which cell owns each arrow is unambiguous even though the short head
// touches the shared border with the next cell over).
const ARROWS = [
  [6, 5, 'up'], [4, 6, 'down'], [6, 8, 'down'], [6, 9, 'left'], [5, 7, 'right'],
  [3, 7, 'left'], [2, 7, 'down'], [2, 7, 'left'], [1, 10, 'left'], [1, 3, 'left'],
  [2, 5, 'left'], [2, 1, 'right'], [3, 2, 'up'], [4, 3, 'up'], [5, 1, 'right'],
  [7, 2, 'right'], [8, 2, 'up'], [7, 5, 'down'],
];
const DIRECTION_STEPS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

// Reads [tens(anchor), units(anchor), colour(anchor), colour(1st cell out),
// colour(2nd cell out), ..., colour(Kth cell out = the grid edge)]. Distance
// is counted from 1 at the first cell out; the arrow's own number must equal
// the distance to the first cell sharing its colour, and every cell in
// between must NOT share it (the true nearest-match distance, not merely *a*
// matching distance). If the number is out of [1, K] it is dropped as soon as
// it is read, since no scan of length K can ever equal it (locked to a
// verdict of 'fail'), which keeps the state small regardless of the size
// alphabet's own width.
const arrowSpecs = new Map();
const arrowSpec = K => {
  if (!arrowSpecs.has(K)) {
    arrowSpecs.set(K, NFA.encodeSpec({
      startState: { phase: 'tens' },
      transition: (state, value) => {
        if (state.phase === 'tens') return { phase: 'units', tens: value };
        if (state.phase === 'units') {
          const size = state.tens * 10 + value;
          return (size >= 1 && size <= K)
            ? { phase: 'colour', size }
            : { phase: 'colour', size: 0 }; // 0 is not a reachable distance
        }
        if (state.phase === 'colour') {
          return { phase: 'scan', size: state.size, target: value, count: 0, verdict: null };
        }
        // phase 'scan': one colour read per step. Once a verdict is set,
        // drop every other field (size, target, count) -- nothing later can
        // change it -- so the state stays a single sink regardless of how
        // many reads remain. Before that, count is clamped at K + 1 (a value
        // it can only reach by never having matched, i.e. a dead end), never
        // left to climb with the scan position.
        if (state.verdict !== null) return { phase: 'scan', verdict: state.verdict };
        const count = Math.min(state.count + 1, K + 1);
        if (value === state.target) {
          return { phase: 'scan', verdict: count === state.size ? 'ok' : 'fail' };
        }
        return { ...state, count };
      },
      accept: state => state.phase === 'scan' && state.verdict === 'ok',
      // maxDepth is exactly how many symbols one arrow reads (tens, units,
      // colour, then K scan cells), so the count field above cannot climb
      // forever even before its own clamp kicks in. Collapsing the state to
      // {phase, verdict} the moment a verdict is set (above) is what keeps
      // this under the 4096-state cap despite the full 16-value alphabet:
      // only the pre-verdict states carry size/target/count together.
      maxDepth: K + 3,
    }, shape));
  }
  return arrowSpecs.get(K);
};

const arrows = ARROWS.map(([row, col, dir]) => {
  const cell = makeCellId(row, col);
  const [dRow, dCol] = DIRECTION_STEPS[dir];
  const line = [];
  let cur = cell;
  for (;;) {
    const next = graph.step(cur, dRow, dCol);
    if (!next) break;
    line.push(next);
    cur = next;
  }
  return new NFA(arrowSpec(line.length),
    `${cell} arrow ${dir}: own number is the distance to the nearest same-colour cell`,
    tens.at(cell), cell, colour.at(cell), ...colour.at(line));
});

// Transcribed from the 3 numbers printed in the grid: [row, col, number].
const GIVENS = [
  [7, 8, 7], [10, 3, 6], [10, 5, 6],
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
  colour.toVar('four colour theorem colour'),
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  canonicalLabel,
  ...distinctSizePerColour,
  ...arrows,
];
