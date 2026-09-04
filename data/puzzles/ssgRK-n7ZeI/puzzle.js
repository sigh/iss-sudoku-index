// Title: Shiny
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=ssgRK-n7ZeI
// Source: https://sudokupad.app/o52m49iwee

// Shiny, 11x11. Digits are 1-9 only (stated explicitly), never 10 or 11, so
// the grid is Raw: rows, columns and boxes carry no implicit rule and
// numbers repeat freely -- Fillomino digits are expected to repeat across a
// row or column.
//
// Rules encoded:
//  * Cave. Some cells are shaded (a "wall") so that every orthogonally
//    connected group of shaded cells touches the grid edge, and the
//    remaining (unshaded, "cave") cells form one orthogonally connected
//    area.
//  * Suguru. Each orthogonally connected wall of N cells holds the digits
//    1-N (no repeat inside the wall). Digits in shaded cells additionally do
//    not repeat in their row or column (unshaded Fillomino digits are exempt
//    from every one of these -- they repeat freely).
//  * Fillomino. The cave divides into polyominoes; each cave cell holds a
//    digit equal to its own polyomino's cell count. Two same-sized
//    polyominoes may not share an edge.
//  * A cave cell may not border a wall cell holding the same digit.
//  * A circled cell that ends up unshaded holds the count of unshaded cells
//    it sees along its four orthogonal rays, itself included, blocked by any
//    shaded cell; a circled cell that ends up shaded holds its own wall's
//    size. Which reading applies is a solver choice, not fixed by the art.
//  * The 26 given digits.
//
// Nothing omitted. All numbers are 1-9 (stated explicitly), so every
// Fillomino region and every wall runs to at most 9 cells: distances and
// sizes each fit one plain (non-modular) 0-8 / 1-9 overlay value, with no
// split-digit or residue-pair layer needed.
//
// The lone drawn line is just the outer grid border, and one drawn cage is a
// hidden, no-total, non-all-different two-corner artifact -- both
// decoration, carrying no rule.

const SIDE = 11;
// Widened to 0-11 so the root/address overlays below (which range up to 11)
// share the main grid's alphabet; the main grid itself is restricted back to
// 1-9 by `boardDomain`.
const shape = new Shape(`${SIDE}x${SIDE}`, '0-11', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

const boardDomain = graph.makeReplicate(new Given(cells[0], ...range(1, 9)));

// ---- Overlays: 7 whole-grid layers (8 * 121 = 968 of the 1000-cell budget) ----
//   shade     - CAVE (0) for an unshaded cell; 1 + distance to the wall root
//               for a shaded cell (so a wall root holds 1), up to 9.
//   wallRow
//   wallCol   - the wall's root cell: its first EDGE cell in reading order
//               (every wall touches the edge, so it has one); (0, 0) for an
//               unshaded cell.
//   wallSize  - the wall's total cell count, propagated to every member;
//               pinned to 9 (an inert upper bound, since digits never exceed
//               9) for an unshaded cell.
//   fillRow
//   fillCol   - the Fillomino region's root: its first cell in reading order
//               among unshaded cells; (0, 0) for a shaded cell.
//   fillDepth - distance from this cell to its Fillomino root; 0 for a
//               shaded cell. A region holds at most 9 cells (digits are
//               1-9), so a plain (non-modular) value 0-8 already IS the true
//               distance: no wraparound is reachable, so no residue pair of
//               coprime moduli is needed here.
const shade = graph.makeOverlay('VS');
const wallRow = graph.makeOverlay('VW');
const wallCol = graph.makeOverlay('VX');
const wallSize = graph.makeOverlay('VN');
const fillRow = graph.makeOverlay('VR');
const fillCol = graph.makeOverlay('VC');
const fillDepth = graph.makeOverlay('VD');
const CAVE = 0;
const MAX_WALL = 9;

const domains = [
  boardDomain,
  restrict(shade, range(CAVE, MAX_WALL)),
  restrict(wallRow, range(0, SIDE)),
  restrict(wallCol, range(0, SIDE)),
  restrict(wallSize, range(1, MAX_WALL)),
  restrict(fillRow, range(0, SIDE)),
  restrict(fillCol, range(0, SIDE)),
  restrict(fillDepth, range(0, MAX_WALL - 1)),
];

const isEdge = (row, col) => row === 1 || row === SIDE || col === 1 || col === SIDE;

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

// ---- Cave: wall root is its first edge cell in reading order ----
// A wall's root is defined as its own first EDGE cell in reading order
// (every wall touches the edge, so it has one) rather than the padded-ring
// form of "every component reaches the border": this needs no extra ring
// layer, since border-reachability is implied by construction.

const wallRootSpecs = new Map();
const wallRootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!wallRootSpecs.has(key)) {
    const edge = isEdge(row, col);
    wallRootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return { phase: 1, grey: value !== CAVE, self: value === CAVE + 1 };
        }
        if (state.phase === 1) {
          if (!state.grey) return value === 0 ? { phase: 2, grey: false } : undefined;
          if (value < 1) return undefined;
          if (state.self ? value !== row : (edge && value > row)) return undefined;
          return { phase: 2, grey: true, self: state.self, rootRow: value };
        }
        if (state.phase === 2) {
          if (!state.grey) return value === 0 ? { phase: 3 } : undefined;
          if (value < 1 || !isEdge(state.rootRow, value)) return undefined;
          if (state.self) return value === col ? { phase: 3 } : undefined;
          if (edge && state.rootRow === row && value >= col) return undefined;
          return { phase: 3 };
        }
        return undefined;
      },
      accept: state => state.phase === 3,
    }, shape));
  }
  return wallRootSpecs.get(key);
};

const wallRoots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(wallRootSpec(row, col), "a wall's root is its first edge cell in reading order",
    shade.at(cell), wallRow.at(cell), wallCol.at(cell));
});

// Every shaded cell other than its own wall root has an orthogonal neighbour
// in its own wall one step nearer the root, so a wall is connected and
// contains the edge cell it names.
const wallStep = Pair.fnToKey((mine, other) => mine > CAVE + 1 && other === mine - 1, shape);
const wallDescents = cells.map(cell => new Or([
  new Given(shade.at(cell), CAVE, CAVE + 1),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, wallRow.at(cell), wallRow.at(other)),
    new SameValues(2, wallCol.at(cell), wallCol.at(other)),
    new Pair(wallStep, 'one step nearer the wall root', shade.at(cell), shade.at(other)),
  ])),
]));

// Any orthogonal group of shaded cells IS one wall (unlike a Fillomino
// polyomino, wall membership is pure adjacency, not a digit match), so every
// adjacent shaded pair must share one wall root and size -- the descent
// chain above only proves ONE such neighbour exists per cell, not that every
// other shaded neighbour agrees.
const wallSameRules = edges.map(([a, b]) => new Or([
  new Given(shade.at(a), CAVE),
  new Given(shade.at(b), CAVE),
  new And([
    new SameValues(2, wallRow.at(a), wallRow.at(b)),
    new SameValues(2, wallCol.at(a), wallCol.at(b)),
    new SameValues(2, wallSize.at(a), wallSize.at(b)),
  ]),
]));

// The cave is one connected area.
const caveConnected = new ConnectedValues('VS', CAVE);

// ---- Suguru: wall size, digit bound, and no-repeat within a wall ----

// Reads [wallRow(own), wallCol(own), wallSize(own), then wallRow/wallCol of
// every cell in the grid]. A wall root (self-named) asserts its size
// overlay equals the count of cells naming it; every other cell -- a
// non-root shaded cell, or an unshaded cell reading its own inert sentinel
// coordinates -- is read past unchecked (sentinel `rem = -1`). A wall root
// can be preceded in reading order by a non-edge member, so (unlike the
// Fillomino root below) this must scan every cell, not just later ones.
const wallSizeSpecs = new Map();
const wallSizeSpec = (row, col) => {
  const key = row + '_' + col;
  if (!wallSizeSpecs.has(key)) {
    wallSizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'wallRow' },
      transition: (state, value) => {
        if (state.phase === 'wallRow') return { phase: 'wallCol', rowEq: value === row };
        if (state.phase === 'wallCol') {
          const self = state.rowEq && value === col;
          return { phase: 'size', self };
        }
        if (state.phase === 'size') {
          if (!state.self) return { phase: 'row', rem: -1 };
          return value >= 1 && value <= MAX_WALL ? { phase: 'row', rem: value } : undefined;
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        // phase 'col'
        if (state.rem < 0) return { phase: 'row', rem: state.rem };
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && (state.rem === 0 || state.rem === -1),
    }, shape));
  }
  return wallSizeSpecs.get(key);
};

const wallSizes = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(wallSizeSpec(row, col), "a wall root's size overlay equals its wall's cell count",
    wallRow.at(cell), wallCol.at(cell), wallSize.at(cell),
    ...cells.flatMap(other => [wallRow.at(other), wallCol.at(other)]));
});

// An unshaded cell's wallSize sentinel is fixed at 9 (the max digit), so the
// bound below is inert for it.
const caveWallSizeNine = Pair.fnToKey((s, ws) => s !== CAVE || ws === MAX_WALL, shape);
const caveSizeSentinel = cells.map(cell => new Pair(caveWallSizeNine,
  "an unshaded cell's wallSize sentinel is the inert value 9",
  shade.at(cell), wallSize.at(cell)));

// A shaded cell's digit is at most its wall's size (with the sentinel above,
// this is a no-op for an unshaded cell). Combined with "no repeat within a
// wall" below, N pairwise-distinct digits in 1..N are exactly the digits
// 1-N.
const leWallSize = Pair.fnToKey((d, ws) => d <= ws, shape);
const boundedBySuguru = cells.map(cell => new Pair(leWallSize,
  "a shaded cell's digit is at most its wall's size",
  cell, wallSize.at(cell)));

// Reads [wallRow(a), wallRow(b), wallCol(a), wallCol(b), digit(a), digit(b)]
// for one pair of cells: two cells in the same wall (both shaded, matching
// root) hold different digits. Free whenever either cell is unshaded (wall
// root address (0, 0)) or the two walls differ.
const wallDistinctSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, rowA: value };
      case 1: return { phase: 2, sameRow: state.rowA !== CAVE && value === state.rowA };
      case 2: return { phase: 3, sameRow: state.sameRow, colA: value };
      case 3: return { phase: 4, same: state.sameRow && value === state.colA };
      case 4: return { phase: 5, same: state.same, digitA: value };
      case 5:
        if (!state.same) return { phase: 6 };
        return value !== state.digitA ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const wallDistinctRules = cells.flatMap((a, i) => cells.slice(i + 1).map(b =>
  new NFA(wallDistinctSpec, 'no repeated digit within one wall',
    wallRow.at(a), wallRow.at(b), wallCol.at(a), wallCol.at(b), a, b)));

// Suguru (shaded) digits do not repeat in their row or column; Fillomino
// (unshaded) digits are exempt and repeat freely, so this is a bitmask scan
// gated on shade, not a plain AllDifferent.
const seenSpecs = new Map();
const seenSpec = (length) => {
  if (!seenSpecs.has(length)) {
    seenSpecs.set(length, NFA.encodeSpec({
      startState: { phase: 'shade', mask: 0 },
      transition: (state, value) => {
        if (state.phase === 'shade') {
          return value === CAVE
            ? { phase: 'digit', mask: state.mask, skip: true }
            : { phase: 'digit', mask: state.mask, skip: false };
        }
        if (state.skip) return { phase: 'shade', mask: state.mask };
        // Board digits are restricted to 1-9 elsewhere, but the shape's
        // widened 0-11 alphabet still requires every symbol to transition
        // somewhere; reject the ones a real digit cell never takes so the
        // bitmask stays 9 bits (512 states) instead of blowing past the
        // 4096-state cap.
        if (value < 1 || value > 9) return undefined;
        const bit = 1 << (value - 1);
        if (state.mask & bit) return undefined;
        return { phase: 'shade', mask: state.mask | bit };
      },
      accept: () => true,
    }, shape));
  }
  return seenSpecs.get(length);
};

const lineDistinctRules = [...graph.rows(), ...graph.columns()].map(line =>
  new NFA(seenSpec(line.length), 'shaded digits do not repeat in this row/column',
    ...line.flatMap(cell => [shade.at(cell), cell])));

// ---- Fillomino: root is the region's first cell in reading order ----
// (Restricted to unshaded cells; a shaded cell carries the inert (0, 0)
// sentinel address and depth 0.)

const fillRootSpecs = new Map();
const fillRootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!fillRootSpecs.has(key)) {
    fillRootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return { phase: 1, cave: value === CAVE };
        }
        if (state.phase === 1) {
          if (!state.cave) return value === 0 ? { phase: 2, cave: false } : undefined;
          if (value < 1 || value > row) return undefined;
          return { phase: 2, cave: true, rowEq: value === row };
        }
        if (state.phase === 2) {
          if (!state.cave) return value === 0 ? { phase: 3, cave: false } : undefined;
          if (state.rowEq && value > col) return undefined;
          return { phase: 3, cave: true, self: state.rowEq && value === col };
        }
        if (state.phase === 3) {
          if (!state.cave) return value === 0 ? { phase: 4 } : undefined;
          const zero = value === 0;
          return zero === state.self ? { phase: 4 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 4,
    }, shape));
  }
  return fillRootSpecs.get(key);
};

const fillRoots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(fillRootSpec(row, col), "a Fillomino region's root is its first cell in reading order (or the inert sentinel, when shaded)",
    shade.at(cell), fillRow.at(cell), fillCol.at(cell), fillDepth.at(cell));
});

// Every non-root cave cell has a cave neighbour one step nearer its
// Fillomino root; a shaded cell is already pinned to depth 0 by the sentinel
// branch above.
const fillStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);
const fillDescents = cells.map(cell => new Or([
  new Given(fillDepth.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, fillRow.at(cell), fillRow.at(other)),
    new SameValues(2, fillCol.at(cell), fillCol.at(other)),
    new Pair(fillStep, 'one step nearer the Fillomino root', fillDepth.at(cell), fillDepth.at(other)),
  ])),
]));

// Reads [fillRow(own), fillCol(own), digit(own), then fillRow/fillCol of
// every LATER cell in reading order]. A cave region's root is the first cave
// cell of the region in reading order, so only cells at or after it can name
// it; a root's digit must equal that count. A non-root cell (including
// every shaded cell, whose sentinel address never equals its own
// coordinates) is read past unchecked -- its digit is pinned instead by the
// cross-edge rule below, which propagates the root's digit along the region.
const sizeSpecs = new Map();
const sizeSpec = (row, col, maxArea) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'fillRow' },
      transition: (state, value) => {
        if (state.phase === 'fillRow') return { phase: 'fillCol', rowEq: value === row };
        if (state.phase === 'fillCol') return { phase: 'digit', self: state.rowEq && value === col };
        if (state.phase === 'digit') {
          if (!state.self) return { phase: 'row', rem: 0 };
          return value >= 1 && value <= maxArea ? { phase: 'row', rem: value } : undefined;
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

const fillSizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col, later.length), "a cave cell's digit equals its Fillomino region's size",
    fillRow.at(cell), fillCol.at(cell), cell,
    ...later.flatMap(other => [fillRow.at(other), fillCol.at(other)]));
});

// ---- Cross-rule edge constraint ----
// Reads [shade(a), shade(b), fillRow(a), fillRow(b), fillCol(a), fillCol(b),
// digit(a), digit(b)] for one orthogonal edge:
//  * both unshaded  -- equal digits iff same Fillomino region (propagates
//    the root's digit along the region, and is exactly "same-size
//    Fillomino regions may not share an edge");
//  * one unshaded, one shaded -- digits must differ (Fillomino/Suguru
//    border rule);
//  * both shaded -- no rule from this constraint (row/column/wall
//    distinctness are asserted separately, above).
// `kind` collapses the two shade reads into one 3-valued tag right away, and
// each later pair (row, then col) collapses to a boolean the moment its
// second half is read, so no phase ever has to carry a raw row/col/digit
// value alongside more than one other small field (state count stays in the
// low hundreds instead of multiplying rowA x rowB x colA x ... past the
// 4096-state cap).
const KIND_BOTH_CAVE = 0, KIND_MIXED = 1, KIND_BOTH_WALL = 2;
const edgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, shadeA: value };
      case 1: {
        const caveA = state.shadeA === CAVE;
        const caveB = value === CAVE;
        const kind = caveA && caveB ? KIND_BOTH_CAVE
          : caveA !== caveB ? KIND_MIXED : KIND_BOTH_WALL;
        return { phase: 2, kind };
      }
      case 2: return { phase: 3, kind: state.kind, rowA: value };
      case 3: return { phase: 4, kind: state.kind, rowsEq: value === state.rowA };
      case 4: return { phase: 5, kind: state.kind, rowsEq: state.rowsEq, colA: value };
      case 5: {
        const sameRegion = state.kind === KIND_BOTH_CAVE && state.rowsEq && value === state.colA;
        return { phase: 6, kind: state.kind, sameRegion };
      }
      case 6: return { phase: 7, kind: state.kind, sameRegion: state.sameRegion, digitA: value };
      case 7: {
        const sameDigit = value === state.digitA;
        if (state.kind === KIND_BOTH_CAVE) {
          return sameDigit === state.sameRegion ? { phase: 8 } : undefined;
        }
        if (state.kind === KIND_MIXED) {
          return !sameDigit ? { phase: 8 } : undefined;
        }
        return { phase: 8 };
      }
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

const crossEdgeRules = edges.map(([a, b]) => new NFA(edgeSpec,
  'same-size Fillomino regions may not touch; a Fillomino cell may not border a Suguru digit of its own value',
  shade.at(a), shade.at(b), fillRow.at(a), fillRow.at(b), fillCol.at(a), fillCol.at(b), a, b));

// ---- Circle clues ----
// Reads [digit(own), then the shade of every cell along its four rays,
// outward from the cell]. The digit less one (the cell sees itself) is the
// count of unshaded cells met before the first shaded cell of each ray;
// `blocked` resets where a new ray starts, and `rem` is the count still
// needed, rejected once it exceeds the cells left.
const sightSpecs = new Map();
const sightSpec = (rayLengths) => {
  const key = rayLengths.join('_');
  if (!sightSpecs.has(key)) {
    const total = rayLengths.reduce((sum, n) => sum + n, 0);
    const starts = new Set();
    rayLengths.reduce((pos, n) => (starts.add(pos), pos + n), 0);
    sightSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'digit' },
      transition: (state, value) => {
        if (state.phase === 'digit') {
          const rem = value - 1;
          return rem >= 0 && rem <= total ? { pos: 0, rem, blocked: false } : undefined;
        }
        const blocked = starts.has(state.pos) ? false : state.blocked;
        const white = value === CAVE;
        const rem = state.rem - (white && !blocked ? 1 : 0);
        if (rem < 0 || rem > total - state.pos - 1) return undefined;
        return { pos: state.pos + 1, rem, blocked: blocked || !white };
      },
      accept: state => state.pos === total && state.rem === 0,
    }, shape));
  }
  return sightSpecs.get(key);
};

// Transcribed from the 17 circle underlays: [row, col].
const CIRCLES = [
  [1, 10], [2, 2], [2, 4], [3, 3], [4, 1], [5, 6], [5, 9], [6, 2], [6, 4],
  [7, 6], [7, 10], [9, 1], [9, 4], [10, 6], [10, 9], [11, 8], [11, 11],
];
const circleRules = CIRCLES.map(([row, col]) => {
  const cell = makeCellId(row, col);
  const rays = [[-1, 0], [0, 1], [1, 0], [0, -1]].map(
    ([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));
  return new Or([
    new And([
      new Given(shade.at(cell), CAVE),
      new NFA(sightSpec(rays.map(ray => ray.length)), 'an unshaded circle sees its digit worth of cave cells',
        cell, ...shade.at(rays.flat())),
    ]),
    new And([
      new Given(shade.at(cell), ...range(1, MAX_WALL)),
      new SameValues(2, cell, wallSize.at(cell)),
    ]),
  ]);
});

// Transcribed from the 26 given digits: [row, col, digit].
const GIVENS = [
  [1, 8, 3], [1, 10, 3], [2, 2, 5], [2, 4, 7], [2, 5, 1], [2, 7, 5],
  [3, 3, 2], [3, 7, 4], [4, 1, 4], [4, 6, 1], [4, 9, 4], [5, 5, 5],
  [5, 6, 7], [6, 4, 4], [6, 11, 2], [7, 7, 6], [8, 4, 4], [8, 6, 3],
  [9, 1, 8], [9, 4, 3], [10, 1, 2], [10, 7, 6], [10, 9, 3], [10, 10, 5],
  [11, 3, 4], [11, 8, 2],
];
const givens = GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value));

return [
  shape,
  shade.toVar('cave, or 1 + distance to the wall root'),
  wallRow.toVar('wall root row'),
  wallCol.toVar('wall root column'),
  wallSize.toVar("this cell's wall size (9, inert, when unshaded)"),
  fillRow.toVar('Fillomino root row (0 when shaded)'),
  fillCol.toVar('Fillomino root column (0 when shaded)'),
  fillDepth.toVar('distance to the Fillomino root (0 when shaded)'),
  ...domains,
  ...givens,
  ...wallRoots,
  ...wallDescents,
  ...wallSameRules,
  caveConnected,
  ...wallSizes,
  ...caveSizeSentinel,
  ...boundedBySuguru,
  ...wallDistinctRules,
  ...lineDistinctRules,
  ...fillRoots,
  ...fillDescents,
  ...fillSizes,
  ...crossEdgeRules,
  ...circleRules,
];
