// Title: Area 81
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=mnnBocnCwsY
// Source: https://app.crackingthecryptic.com/sudoku/7TLdN2MJRh

// Normal sudoku rules apply. Draw a non-intersecting loop along some edges of
// the grid; a cell is either inside the loop (alien) or outside it (cactus).
// The digit a solver writes in a white-square cell is not a separate clue
// value -- it IS the count of that cell's own four edges lying on the loop.
// The digit in a white-circle cell is likewise self-referential: the cell is
// inside the loop, and its digit is the number of cells "seen" horizontally
// and vertically within the loop (including itself), where a cell outside the
// loop blocks vision beyond it. The loop passes straight through a white dot,
// then turns within one more step in each direction; it turns at a black dot,
// then goes straight for at least one more step in each direction. Diagonally
// adjacent cells sharing a dot's corner are consecutive at a white dot, in a
// 1:2 ratio at a black dot -- applied to both diagonal pairs that meet at the
// corner, since the rule names "diagonally adjacent cells joined by" the dot
// without singling out one of the two pairs sharing it.
//
// Every clause above is encoded; no rule is omitted.

const IN = 1;   // VG codes: the two sides of the loop.
const OUT = 2;  // The area beyond the grid border counts as OUT.

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues; // 9

const side = graph.makeOverlay('VG');
const sideVar = side.toVar('loop side');

// --- Compile-time boolean algebra over the loop side ------------------------
// A lattice corner near the border has an off-grid neighbour, fixed OUT. T/F
// let a formula fold that constant away at generation time instead of needing
// a Var for it; AND/OR simplify (dropping true terms, short-circuiting false
// ones) so every dot ends up as an ordinary And/Or/Pair/Given tree.
const T = Symbol('true');
const F = Symbol('false');

// The side of the cell at (row, col), or the constant OUT beyond the border.
function cellAt(row, col) {
  if (row < 1 || row > 9 || col < 1 || col > 9) return OUT;
  return sideVar.cell(row, col);
}

function eq(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a === b ? T : F;
  if (typeof a === 'number') [a, b] = [b, a];
  if (typeof b === 'number') return new Given(a, b);
  return new SameValues(2, a, b);
}

function neq(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a !== b ? T : F;
  if (typeof a === 'number') [a, b] = [b, a];
  // Two-valued domain: "differs from a constant" pins the other value.
  if (typeof b === 'number') return new Given(a, b === IN ? OUT : IN);
  return new AllDifferent(a, b);
}

function AND(...items) {
  const kept = [];
  // Two eq()/neq() terms can each pin the same off-grid-adjacent cell to a
  // constant (e.g. both "ne == sw(=OUT)" and "ne != nw(=OUT)" reduce to a
  // Given on ne alone); collapse a same-cell conflict to F instead of
  // leaving two contradictory Givens for the solver to merge.
  const givenValues = new Map();
  for (const it of items) {
    if (it === F) return F;
    if (it === T) continue;
    if (it instanceof Given) {
      const prev = givenValues.get(it.cell);
      const values = prev ? prev.filter(v => it.values.includes(v)) : it.values;
      if (values.length === 0) return F;
      givenValues.set(it.cell, values);
      continue;
    }
    kept.push(it);
  }
  for (const [cell, values] of givenValues) kept.push(new Given(cell, ...values));
  if (kept.length === 0) return T;
  return kept.length === 1 ? kept[0] : new And(kept);
}

function OR(...items) {
  const kept = [];
  for (const it of items) {
    if (it === T) return T;
    if (it !== F) kept.push(it);
  }
  if (kept.length === 0) return F;
  return kept.length === 1 ? kept[0] : new Or(kept);
}

// A boolean formula (T, F, or a constraint) used as a top-level clause: T
// needs nothing, F would mean the geometry can never satisfy the dot at all.
function toClauses(formula) {
  if (formula === T) return [];
  if (formula === F) throw new Error('Unsatisfiable dot geometry -- check coordinates.');
  return [formula];
}

// The four cells around lattice corner (r, c) -- the point below-right of
// cell (r, c) -- for r, c ranging 0..9 over the whole grid including border.
function corners(r, c) {
  return {
    nw: cellAt(r, c), ne: cellAt(r, c + 1),
    sw: cellAt(r + 1, c), se: cellAt(r + 1, c + 1),
  };
}

// The loop runs straight through corner (r, c): the two cells on one side
// agree, the two on the other side agree, and the two sides differ.
function straightAt(r, c) {
  const { nw, ne, sw, se } = corners(r, c);
  const horiz = AND(eq(nw, ne), eq(sw, se), neq(nw, sw)); // W & E edges used
  const vert = AND(eq(nw, sw), eq(ne, se), neq(nw, ne));  // N & S edges used
  return OR(horiz, vert);
}

// The loop turns at corner (r, c): exactly one of its four cells differs from
// the other three. (The remaining case, a diagonal 2-2 split, is the loop
// crossing itself and is forbidden globally below -- it matches neither this
// nor straightAt.)
function turnAt(r, c) {
  const { nw, ne, sw, se } = corners(r, c);
  return OR(
    AND(eq(ne, sw), eq(ne, se), neq(nw, ne)),
    AND(eq(nw, sw), eq(nw, se), neq(ne, nw)),
    AND(eq(nw, ne), eq(nw, se), neq(sw, nw)),
    AND(eq(nw, ne), eq(nw, sw), neq(se, nw)),
  );
}

// White dot at (r, c): straight through, then a turn within one more corner
// in at least one of the two directions the straight run continues in.
function whiteDotClause(r, c) {
  const { nw, ne, sw, se } = corners(r, c);
  const horiz = AND(eq(nw, ne), eq(sw, se), neq(nw, sw));
  const vert = AND(eq(nw, sw), eq(ne, se), neq(nw, ne));
  return OR(
    AND(horiz, OR(turnAt(r, c - 1), turnAt(r, c + 1))),
    AND(vert, OR(turnAt(r - 1, c), turnAt(r + 1, c))),
  );
}

// Black dot at (r, c): a turn, identified by which single cell differs from
// the other three, which also fixes the two directions the loop continues
// in; the corner one step further in each of those directions must then be
// straight (the loop "does not turn at the next opportunity in either
// direction").
function blackDotClause(r, c) {
  const { nw, ne, sw, se } = corners(r, c);
  const nwDiffers = AND(eq(ne, sw), eq(ne, se), neq(nw, ne));
  const neDiffers = AND(eq(nw, sw), eq(nw, se), neq(ne, nw));
  const swDiffers = AND(eq(nw, ne), eq(nw, se), neq(sw, nw));
  const seDiffers = AND(eq(nw, ne), eq(nw, sw), neq(se, nw));
  return OR(
    AND(nwDiffers, straightAt(r - 1, c), straightAt(r, c - 1)),
    AND(neDiffers, straightAt(r - 1, c), straightAt(r, c + 1)),
    AND(swDiffers, straightAt(r + 1, c), straightAt(r, c - 1)),
    AND(seDiffers, straightAt(r + 1, c), straightAt(r, c + 1)),
  );
}

// --- Single loop: connected IN region, no hole, no self-touch --------------
// Standard corner-classification trick (see e.g. XfBbFSZNCys): a lattice
// corner is convex/plain/concave by how many of its 4 cells are IN, and
// forbidding the diagonal 2-2 split rules out the loop crossing itself. With
// the IN region connected, (convex - concave) = 4 forces exactly one
// hole-free loop.
const CONVEX = 1, PLAIN = 2, CONCAVE = 3;
const corner = cellGraph('10x10').makeOverlay('VC');
const cornerAt = (row, col) => corner.cells()[row * 10 + col];

const cornerClass = inCount => (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

const cornerMachine = (arity, checkDiagonal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === -1) return undefined;
    if (state.i === 0) return { i: 1, code: value, seen: [] };
    const seen = [...state.seen, value === IN];
    if (seen.length < arity) return { i: state.i + 1, code: state.code, seen };
    if (checkDiagonal) {
      const [topLeft, topRight, bottomLeft, bottomRight] = seen;
      if ((topLeft && bottomRight && !topRight && !bottomLeft)
        || (topRight && bottomLeft && !topLeft && !bottomRight)) return undefined;
    }
    return state.code === cornerClass(seen.filter(Boolean).length)
      ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, numValues);
const cornerMachines = new Map([2, 4].map(
  arity => [arity, cornerMachine(arity, arity === 4)]));
const gridCornerKey = Pair.fnToKey(
  (code, sv) => code === cornerClass(sv === IN ? 1 : 0), numValues);

const cornerCells = [];
const cornerCodes = [];
for (let row = 0; row <= 9; row++) {
  for (let col = 0; col <= 9; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
      .map(([r, c]) => sideVar.cell(r, c));
    cornerCells.push(cornerAt(row, col));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner',
        cornerAt(row, col), ...around));
  }
}

const singleLoop = [
  new ConnectedValues('VG', IN),
  new Sum(2 * cornerCells.length - 4, ...cornerCells),
];

// --- White squares: digit = count of the cell's own loop edges -------------
// Drawn as plain white-bordered squares over these cells (source underlays).
const whiteSquareCells = ['R1C3', 'R1C7', 'R2C2', 'R2C9', 'R9C3', 'R9C9'];

// digit == (# of the cell's 4 sides that are on the loop), where a grid-
// border side always counts when the cell is IN and never when it is OUT.
// Splitting on the cell's own side turns each branch into a linear equation
// in the (2-valued) neighbour codes.
function edgeCountConstraint(cellId) {
  const { row, col } = parseCellId(cellId);
  const real = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
    .map(([r, c]) => sideVar.cell(r, c));
  const m = real.length;
  const border = 4 - m;
  // digit - (sum of real neighbours) = border - m; when that offset is 0
  // (a grid-corner cell, m == border == 2) it is exactly "digit's set sums
  // the same as the neighbours' set", i.e. EqualSum with no target needed.
  const inTerm = border === m
    ? new EqualSum([cellId], real)
    : new Sum(border - m, [cellId, 1], ...real.map(n => [n, -1]));
  return new Or([
    // IN: digit = (# OUT among real neighbours) + border.
    new And([
      new Given(side.at(cellId), IN),
      inTerm,
    ]),
    // OUT: digit = (# IN among real neighbours); border sides never count.
    new And([
      new Given(side.at(cellId), OUT),
      new Sum(2 * m, cellId, ...real),
    ]),
  ]);
}

// --- White circles: digit = visibility count, and forced inside the loop ---
// Drawn as plain white-bordered circles over these cells (source underlays).
const whiteCircleCells = [
  'R1C7', 'R2C2', 'R2C8', 'R3C5', 'R3C8', 'R4C6',
  'R6C1', 'R7C5', 'R8C6', 'R9C6', 'R9C9',
];

// "digit = 1 (self) + the run of IN cells reached before the first OUT cell
// (or the border) in each of the 4 directions." One NFA, reused per circle:
// the origin segment reads the digit as the target and starts the count at
// 1; each ray segment adds 1 per IN cell until an OUT cell blocks it (state
// carries across SEGMENT_BREAK so the count accumulates over all 4 rays, but
// "blocked" resets per ray, since blocking is local to one direction).
const sightMachine = NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: (state, value) => {
    if (state.target === null) return { target: value, count: 1, blocked: false };
    if (value === SEGMENT_BREAK) return { target: state.target, count: state.count, blocked: false };
    if (state.blocked) return state;
    if (value === OUT) return { target: state.target, count: state.count, blocked: true };
    return {
      target: state.target,
      count: Math.min(state.count + 1, state.target + 1),
      blocked: false,
    };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, numValues, { multiSegment: true });

function visibilityConstraint(cellId) {
  const { row, col } = parseCellId(cellId);
  const ray = (dr, dc) => {
    const cells = [];
    for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
      cells.push(sideVar.cell(r, c));
    }
    return cells;
  };
  const rays = [ray(-1, 0), ray(1, 0), ray(0, -1), ray(0, 1)].filter(r => r.length > 0);
  return [
    new Given(side.at(cellId), IN),
    new NFA(sightMachine, 'sight', [cellId], ...rays),
  ];
}

// --- Corner dots -------------------------------------------------------------
// Each named by the (row, col) of its top-left cell (source overlays: small
// rounded corner marks, white fill for white dots, black fill for black
// dots).
const whiteDots = [[2, 1], [2, 2], [3, 2], [2, 4], [4, 4], [2, 7], [7, 1]];
const blackDots = [[3, 5], [4, 7]];

const CONSEC_KEY = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, numValues);
const RATIO_KEY = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, numValues);

// Both diagonal pairs sharing the corner -- see the header note.
function diagonalPairs(r, c) {
  return [
    [makeCellId(r, c), makeCellId(r + 1, c + 1)],
    [makeCellId(r, c + 1), makeCellId(r + 1, c)],
  ];
}

return [
  new Shape('9x9'),
  sideVar,
  corner.toVar('loop corner type'),
  side.makeReplicate(new Given(side.cells()[0], IN, OUT)),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),

  // Alien/cactus givens (source overlays: emoji at these cells).
  new Given(side.at('R5C9'), IN),   // alien
  new Given(side.at('R9C1'), OUT),  // cactus
  new Given(side.at('R8C3'), OUT),  // cactus

  ...cornerCodes,
  ...singleLoop,

  ...whiteSquareCells.map(edgeCountConstraint),
  ...whiteCircleCells.flatMap(visibilityConstraint),

  ...whiteDots.flatMap(([r, c]) => [
    ...toClauses(whiteDotClause(r, c)),
    ...diagonalPairs(r, c).map(([a, b]) => new Pair(CONSEC_KEY, 'diagonal white dot', a, b)),
  ]),
  ...blackDots.flatMap(([r, c]) => [
    ...toClauses(blackDotClause(r, c)),
    ...diagonalPairs(r, c).map(([a, b]) => new Pair(RATIO_KEY, 'diagonal black dot', a, b)),
  ]),
];
