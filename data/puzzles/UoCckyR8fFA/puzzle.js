// Title: Cave Fillomino
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=UoCckyR8fFA
// Source: https://tinyurl.com/y4uxa62s

// Cave Fillomino, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and numbers repeat freely.
//
// Rules encoded:
//  * Fillomino. Divide the grid into orthogonally connected regions; each cell
//    holds a number equal to the number of cells in its region; no two regions
//    of the same size share an edge (diagonal contact is allowed).
//  * Cave. Some cells are shaded grey so that every orthogonally connected
//    group of grey cells (a wall) is connected to the grid edge, and the
//    remaining cells (the cave) form one orthogonally connected area.
//  * Within one orthogonally connected group of grey cells, no number repeats.
//  * A cell with a large circle is in the cave, and its number is how many
//    cave cells it sees orthogonally, itself included, with grey cells
//    blocking the view.
//  * The top-right cell is grey from the start; it still holds a number.
//  * The 18 given numbers.
//
// Nothing is omitted. A region may run to the board's 100 cells, so a number
// does not fit one 16-value cell: every cell's number is held as its tens
// digit on an overlay and its units digit on the board.

const SIDE = 10;
const MAX_AREA = SIDE * SIDE;
const MAX_TENS = Math.floor(MAX_AREA / 10);   // 10: the tens digit of 100

const shape = new Shape('10x10', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// A region is the set of cells that name the same root, where a region's root
// is its first cell in reading order. Five overlays carry the Fillomino:
//   tens     - tens digit of the cell's number (the board holds the units);
//   rootRow
//   rootCol  - which cell is the root of this cell's region;
//   d11, d13 - the cell's distance from its root, as residues mod 11 and 13
//              (lcm 143 > 100, so the pair is the distance itself).
const tens = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const d11 = graph.makeOverlay('VA');
const d13 = graph.makeOverlay('VB');
const MOD_A = 11;
const MOD_B = 13;

// Three more overlays carry the cave. A wall is the set of grey cells naming
// the same wall root, where a wall's root is its first EDGE cell in reading
// order (every wall has one, since every wall touches the edge):
//   shade    - CAVE for a white cell; for a grey cell, 1 + its distance from
//              its wall root, so a wall root holds 1;
//   wallRow
//   wallCol  - which cell is the wall root of this grey cell, 0 for a white
//              cell.
// A wall of k cells holds k different numbers, so it touches k regions of k
// different sizes, at least 1 + 2 + ... + k cells in all: k(k+1)/2 <= 100
// gives k <= 13, so a grey cell's distance from its root is at most 12.
const shade = graph.makeOverlay('VS');
const wallRow = graph.makeOverlay('VW');
const wallCol = graph.makeOverlay('VX');
const CAVE = 0;
const MAX_WALL = 13;

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
  restrict(shade, range(CAVE, MAX_WALL)),
  restrict(wallRow, range(0, SIDE)),
  restrict(wallCol, range(0, SIDE)),
];

// A cell's number is at least 1.
const positive = Pair.fnToKey((t, u) => t > 0 || u > 0, shape);
const positives = cells.map(
  cell => new Pair(positive, 'number is positive', tens.at(cell), cell));

// ---- Fillomino ----

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

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const regionEdgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    tens.at(a), tens.at(b), a, b,
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    d11.at(a), d11.at(b), d13.at(a), d13.at(b)),
]);

// ---- Cave ----

const isEdge = (row, col) => row === 1 || row === SIDE || col === 1 || col === SIDE;

// Reads [shade, wallRow, wallCol] of one cell. A white cell names no wall
// root. A grey cell names an edge cell; it is at distance 0 exactly when it
// names itself; and a grey EDGE cell names a root at or before itself in
// reading order, so a wall's root is its first edge cell.
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
  return new NFA(wallRootSpec(row, col), 'wall root is its first edge cell',
    shade.at(cell), wallRow.at(cell), wallCol.at(cell));
});

// Every grey cell other than a wall root has an orthogonal neighbour in its
// own wall one step nearer the root, so a wall is connected and contains the
// edge cell it names.
const wallStep = Pair.fnToKey((mine, other) => mine > CAVE + 1 && other === mine - 1, shape);
const wallDescents = cells.map(cell => new Or([
  new Given(shade.at(cell), CAVE, CAVE + 1),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, wallRow.at(cell), wallRow.at(other)),
    new SameValues(2, wallCol.at(cell), wallCol.at(other)),
    new Pair(wallStep, 'one step nearer the wall root', shade.at(cell), shade.at(other)),
  ])),
]));

// Reads [shade(a), shade(b), wallRow(a), wallRow(b), wallCol(a), wallCol(b)]
// for one orthogonal edge: two grey neighbours are in one wall, so they name
// the same root and their distances differ by at most one, which makes the
// distance the true one.
const wallEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) {
      if (state.mine === CAVE || value === CAVE) return { phase: 2, free: true };
      return Math.abs(value - state.mine) <= 1 ? { phase: 2, free: false } : undefined;
    }
    if (state.free) return state.phase < 6 ? { phase: state.phase + 1, free: true } : undefined;
    if (state.phase === 2 || state.phase === 4) {
      return { phase: state.phase + 1, free: false, mine: value };
    }
    if (state.phase === 3 || state.phase === 5) {
      return value === state.mine ? { phase: state.phase + 1, free: false } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const wallEdgeRules = edges.map(([a, b]) =>
  new NFA(wallEdgeSpec, 'grey neighbours share a wall',
    shade.at(a), shade.at(b), wallRow.at(a), wallRow.at(b), wallCol.at(a), wallCol.at(b)));

// Reads [shade(a), shade(b), wallRow(a), wallRow(b), wallCol(a), wallCol(b),
// tens(a), tens(b), units(a), units(b)] for one pair of cells: two grey cells
// naming the same wall root hold different numbers. The pair is free as soon
// as either cell is white, the roots differ or the tens digits differ.
const wallDistinctSpec = NFA.encodeSpec({
  startState: { phase: 0, free: false },
  transition: (state, value) => {
    const next = state.phase + 1;
    if (state.free) return next <= 10 ? { phase: next, free: true } : undefined;
    switch (state.phase) {
      case 0: case 1: return { phase: next, free: value === CAVE };
      case 2: case 4: case 6: case 8: return { phase: next, free: false, mine: value };
      case 3: case 5: case 7: return { phase: next, free: value !== state.mine };
      case 9: return value !== state.mine ? { phase: next, free: false } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 10,
}, shape);

const wallDistinctRules = cells.flatMap((a, i) => cells.slice(i + 1).map(b =>
  new NFA(wallDistinctSpec, 'no repeated number within a wall',
    shade.at(a), shade.at(b), wallRow.at(a), wallRow.at(b), wallCol.at(a), wallCol.at(b),
    tens.at(a), tens.at(b), a, b)));

// Reads [tens, units of the circle cell, then the shade of every cell along
// its rays up, right, down and left, each ray from the cell outwards]. The
// number less one (the cell sees itself) is the count of white cells met
// before the first grey cell of each ray; `blocked` resets where a new ray
// starts, and `rem` is the count still needed, rejected once it exceeds the
// cells left.
const sightSpecs = new Map();
const sightSpec = (rayLengths) => {
  const key = rayLengths.join('_');
  if (!sightSpecs.has(key)) {
    const total = rayLengths.reduce((sum, n) => sum + n, 0);
    const starts = new Set();
    rayLengths.reduce((pos, n) => (starts.add(pos), pos + n), 0);
    sightSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'tens' },
      transition: (state, value) => {
        if (state.phase === 'tens') return { phase: 'units', tens: value };
        if (state.phase === 'units') {
          const rem = 10 * state.tens + value - 1;
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

// Transcribed from the 12 large circles drawn in the grid: [row, col].
const CIRCLES = [
  [1, 4], [2, 5], [3, 4], [4, 1], [4, 2], [4, 5],
  [5, 5], [5, 6], [6, 3], [6, 8], [7, 1], [10, 10],
];
const circleRules = CIRCLES.flatMap(([row, col]) => {
  const cell = makeCellId(row, col);
  const rays = [[-1, 0], [0, 1], [1, 0], [0, -1]].map(
    ([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));
  return [
    new Given(shade.at(cell), CAVE),
    new NFA(sightSpec(rays.map(ray => ray.length)), 'circle sees its number of cave cells',
      tens.at(cell), cell, ...shade.at(rays.flat())),
  ];
});

// Transcribed from the 18 numbers printed in the grid: [row, col, number].
const GIVENS = [
  [1, 4, 6], [1, 6, 1], [1, 8, 10], [2, 1, 3], [2, 2, 1], [2, 5, 2],
  [4, 4, 1], [4, 6, 2], [5, 5, 3], [5, 6, 3], [6, 4, 2], [6, 6, 1],
  [6, 9, 6], [7, 1, 2], [9, 1, 3], [10, 2, 11], [10, 4, 8], [10, 10, 12],
];
const givens = GIVENS.flatMap(([row, col, number]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(tens.at(cell), Math.floor(number / 10)),
    new Given(cell, number % 10),
  ];
});

const topRight = makeCellId(1, SIDE);

return [
  shape,
  tens.toVar('tens digit of the number'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  d11.toVar('distance to root mod 11'),
  d13.toVar('distance to root mod 13'),
  shade.toVar('cave, or 1 + distance to the wall root'),
  wallRow.toVar('wall root row'),
  wallCol.toVar('wall root column'),
  ...domains,
  ...givens,
  ...positives,
  ...roots,
  ...descents,
  ...sizes,
  ...regionEdgeRules,
  // The cave is one connected area.
  new ConnectedValues('VS', CAVE),
  // The top-right cell is grey.
  new Given(shade.at(topRight), ...range(CAVE + 1, MAX_WALL)),
  ...wallRoots,
  ...wallDescents,
  ...wallEdgeRules,
  ...wallDistinctRules,
  ...circleRules,
];
