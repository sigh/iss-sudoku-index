// Title: Pac-Man Sudoku
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=gQYrXnEvPlE
// Source: https://app.crackingthecryptic.com/sudoku/dLTrH6DM6F

// Rules encoded here:
//  * Normal sudoku rules. Givens R1C9 = 3, R4C5 = 8.
//  * The leftmost and rightmost cells of a row are orthogonally adjacent for
//    every rule below: the grid is a cylinder, R_C9 next to R_C1.
//  * Cells joined by a white dot hold consecutive digits (not all dots are
//    given, so no negative constraint).
//  * Shade some cells: all shaded cells orthogonally connected; no 2x2 region
//    (seam-straddling 2x2s included) entirely shaded. Pac-Man, ghost and
//    white-dot cells are shaded; killer-clue cells are unshaded.
//  * A "cave" is an orthogonally connected area of unshaded cells. Digits do
//    not repeat within a cave; a cave holding a killer clue sums to it. Caves
//    without a clue are allowed.
//  * Pac-Man's path: starts in R5C2, steps orthogonally (seam included), never
//    revisits a cell, no two non-consecutive path cells are orthogonally
//    adjacent (diagonal touching allowed), goes straight through every dot
//    edge and ends in the cell it enters through the last dot edge, is never
//    orthogonally adjacent to a ghost cell, and never enters an unshaded cell.
// Nothing is omitted. "Unshaded regions may not touch each other orthogonally"
// is definitional (adjacent unshaded cells are one cave) and needs no
// constraint. A path entering a ghost cell is excluded by the adjacency rule:
// the step before it would stand next to the ghost.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const NV = graph.gridGeometry().numValues;   // 9
const N = 9;                                  // rows and columns

// Killer clues, from the small corner-number text overlays.
const CLUES = [
  ['R1C3', 16], ['R1C6', 15], ['R2C5', 14], ['R4C7', 8], ['R6C5', 8],
  ['R8C7', 24], ['R9C5', 23], ['R7C2', 34], ['R5C1', 38],
];
// White dots, from the edge-centred circle overlays. The last one is drawn as
// two half circles on the outer borders of R3C1 and R3C9: one dot on the seam.
const DOTS = [
  ['R2C2', 'R3C2'], ['R5C9', 'R6C9'], ['R8C3', 'R8C4'], ['R9C1', 'R9C2'],
  ['R3C1', 'R3C9'],
];
const PACMAN = 'R5C2';                           // yellow disc overlay
const GHOSTS = ['R1C5', 'R5C4', 'R7C1', 'R9C6'];  // red, pink, orange, blue

const clueCells = CLUES.map(([cell]) => cell);
const clueSet = new Set(clueCells);
const dotCells = DOTS.flat();
const dotSet = new Set(dotCells);

// Orthogonal neighbours on the cylinder: grid neighbours plus the seam pair.
const cylNeighbours = (cell) => {
  const { row, col } = parseCellId(cell);
  const seam = col === 1 ? [makeCellId(row, N)] : col === N ? [makeCellId(row, 1)] : [];
  return [...graph.neighbours(cell), ...seam];
};

// --- Overlays -----------------------------------------------------------------
// VS  shading: 1 shaded, 2 unshaded.
// VR, VC  unshaded: the cave's root cell (row, column). A cave holding a clue is
//         rooted at the clue cell; any other cave at its first cell in reading
//         order. Shaded: the cell's own coordinates, so no shaded cell can be
//         mistaken for a cave root.
// VD  unshaded: distance from the cave root plus one (1 at the root, at most 9
//         since a cave holds at most nine distinct digits).
//     shaded: Pac-Man path code, 1 off, 2 start, 3 body, 4 end.
// VH, VL  shaded: distance from R5C2 through shaded cells, as two base-9
//         digits (value v stands for v-1; 0..80 covers the whole grid).
//         Unshaded: both 1.
// VP, VQ  path cells: position along the path from R5C2 (start = 0), same
//         two-digit form. Other cells: both 1.
const VS = graph.makeOverlay('VS');
const VR = graph.makeOverlay('VR');
const VC = graph.makeOverlay('VC');
const VD = graph.makeOverlay('VD');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const VP = graph.makeOverlay('VP');
const VQ = graph.makeOverlay('VQ');

const SHADED = 1, UNSHADED = 2;
const OFF = 1, START = 2, BODY = 3, END = 4;
const num = (hi, lo) => (hi - 1) * N + (lo - 1);   // two-digit overlay value
const hiOf = (n) => Math.floor(n / N) + 1;
const loOf = (n) => (n % N) + 1;

// --- Fixed cells ----------------------------------------------------------------
const fixed = [
  new Given('R1C9', 3),
  new Given('R4C5', 8),
  VS.makeReplicate(new Given(VS.at(cells[0]), SHADED, UNSHADED)),
  ...[PACMAN, ...GHOSTS, ...dotCells].map(c => new Given(VS.at(c), SHADED)),
  ...clueCells.map(c => new Given(VS.at(c), UNSHADED)),
  // A clue cell is the root of its own cave.
  ...clueCells.flatMap(c => [
    new Given(VR.at(c), parseCellId(c).row),
    new Given(VC.at(c), parseCellId(c).col),
    new Given(VD.at(c), 1),
  ]),
  // Pac-Man: path start, distance 0, position 0.
  new Given(VD.at(PACMAN), START),
  new Given(VH.at(PACMAN), 1), new Given(VL.at(PACMAN), 1),
  new Given(VP.at(PACMAN), 1), new Given(VQ.at(PACMAN), 1),
];

// --- White dots -------------------------------------------------------------------
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, NV);
const whiteDots = DOTS.map(([a, b]) => graph.neighbours(a).includes(b)
  ? new WhiteDot(a, b)
  : new Pair(consecutiveKey, 'seam dot', a, b));   // the R3C1-R3C9 seam dot

// --- No 2x2 entirely shaded, seam blocks included ----------------------------------
const blocks = [];
for (let r = 1; r < N; r++) {
  for (let c = 1; c <= N; c++) {
    const c2 = (c % N) + 1;
    blocks.push([makeCellId(r, c), makeCellId(r, c2), makeCellId(r + 1, c), makeCellId(r + 1, c2)]);
  }
}
const noShaded2x2 = blocks.map(b => new ContainAtLeast(String(UNSHADED), ...VS.at(b)));

// --- Shaded cells connected: distance from R5C2 --------------------------------------
// Reads [VS, VH, VL] of the cell, then of each cylinder neighbour. A shaded cell
// other than R5C2 has a shaded neighbour exactly one closer and none more than
// one closer, so the layer is the true shaded-graph distance and every shaded
// cell reaches R5C2.
const shadedDistanceMachine = (isRoot) => NFA.encodeSpec({
  startState: { p: 'shade' },
  transition: (s, v) => {
    switch (s.p) {
      case 'shade': return v === SHADED ? { p: 'hi' } : { p: 'u1' };
      case 'u1': return v === 1 ? { p: 'u2' } : undefined;   // unshaded: pinned 0
      case 'u2': return v === 1 ? { p: 'done' } : undefined;
      case 'done': return { p: 'done' };
      case 'hi': return { p: 'lo', h: v };
      case 'lo': {
        const d = num(s.h, v);
        if (isRoot) return d === 0 ? { p: 'done' } : undefined;
        return d >= 1 ? { p: 'nShade', d, found: false } : undefined;
      }
      case 'nShade': return v === SHADED
        ? { p: 'nHi', d: s.d, found: s.found }
        : { p: 'nSkip2', d: s.d, found: s.found };
      case 'nSkip2': return { p: 'nSkip1', d: s.d, found: s.found };
      case 'nSkip1': return { p: 'nShade', d: s.d, found: s.found };
      case 'nHi': return { p: 'nLo', d: s.d, found: s.found, h: v };
      case 'nLo': {
        const dn = num(s.h, v);
        if (dn < s.d - 1) return undefined;
        return { p: 'nShade', d: s.d, found: s.found || dn === s.d - 1 };
      }
    }
  },
  accept: (s) => s.p === 'done' || (s.p === 'nShade' && s.found),
}, NV);
const shadedDistanceRoot = shadedDistanceMachine(true);
const shadedDistanceOther = shadedDistanceMachine(false);
const shadedConnected = cells.map(c => new NFA(
  c === PACMAN ? shadedDistanceRoot : shadedDistanceOther, 'shaded dist',
  ...[c, ...cylNeighbours(c)].flatMap(x => [VS.at(x), VH.at(x), VL.at(x)])));

// --- Caves: root identity --------------------------------------------------------------
// Reads [VS, VR, VC, VD] of the cell, then [VS, VR, VC] of each cylinder
// neighbour. Shaded: root fields are the cell's own coordinates and VD is a
// path code (start only in R5C2, end only in a dot cell). Unshaded: the named
// root is at or before the cell in reading order or is a clue cell; VD is 1
// exactly when the cell is its own root; unshaded neighbours name the same root.
const caveRootMachine = (cell) => {
  const { row, col } = parseCellId(cell);
  const codes = cell === PACMAN ? [START] : dotSet.has(cell) ? [OFF, BODY, END] : [OFF, BODY];
  return NFA.encodeSpec({
    startState: { p: 'shade' },
    transition: (s, v) => {
      switch (s.p) {
        case 'shade': return v === SHADED ? { p: 'sRow' } : { p: 'uRow' };
        case 'sRow': return v === row ? { p: 'sCol' } : undefined;
        case 'sCol': return v === col ? { p: 'sCode' } : undefined;
        case 'sCode': return codes.includes(v) ? { p: 'done' } : undefined;
        case 'done': return { p: 'done' };
        case 'uRow': return { p: 'uCol', rr: v };
        case 'uCol': {
          const legal = s.rr < row || (s.rr === row && v <= col)
            || clueSet.has(makeCellId(s.rr, v));
          return legal ? { p: 'uDepth', rr: s.rr, rc: v } : undefined;
        }
        case 'uDepth': {
          const isRoot = s.rr === row && s.rc === col;
          return (v === 1) === isRoot ? { p: 'nShade', rr: s.rr, rc: s.rc } : undefined;
        }
        case 'nShade': return { p: v === SHADED ? 'nSkip2' : 'nRow', rr: s.rr, rc: s.rc };
        case 'nSkip2': return { p: 'nSkip1', rr: s.rr, rc: s.rc };
        case 'nSkip1': return { p: 'nShade', rr: s.rr, rc: s.rc };
        case 'nRow': return v === s.rr ? { p: 'nCol', rr: s.rr, rc: s.rc } : undefined;
        case 'nCol': return v === s.rc ? { p: 'nShade', rr: s.rr, rc: s.rc } : undefined;
      }
    },
    accept: (s) => s.p === 'done' || s.p === 'nShade',
  }, NV);
};
const caveRoots = cells.map(c => new NFA(caveRootMachine(c), 'cave root',
  VS.at(c), VR.at(c), VC.at(c), VD.at(c),
  ...cylNeighbours(c).flatMap(x => [VS.at(x), VR.at(x), VC.at(x)])));

// --- Caves: depth descent --------------------------------------------------------------
// Reads [VS, VD] of the cell, then of each cylinder neighbour. An unshaded
// cell at depth k >= 2 has an unshaded neighbour at depth k-1 and none
// shallower than that, so VD is the true distance from the root and the root
// lies inside the cave (which is what makes the named root a cave member).
const caveDepthMachine = NFA.encodeSpec({
  startState: { p: 'shade' },
  transition: (s, v) => {
    switch (s.p) {
      case 'shade': return v === SHADED ? { p: 'done' } : { p: 'depth' };
      case 'done': return { p: 'done' };
      case 'depth': return { p: 'nShade', k: v, found: false };
      case 'nShade': return { p: v === SHADED ? 'nSkip' : 'nDepth', k: s.k, found: s.found };
      case 'nSkip': return { p: 'nShade', k: s.k, found: s.found };
      case 'nDepth': {
        if (v < s.k - 1) return undefined;
        return { p: 'nShade', k: s.k, found: s.found || v === s.k - 1 };
      }
    }
  },
  accept: (s) => s.p === 'done' || (s.p === 'nShade' && (s.k === 1 || s.found)),
}, NV);
const caveDepths = cells.map(c => new NFA(caveDepthMachine, 'cave depth',
  ...[c, ...cylNeighbours(c)].flatMap(x => [VS.at(x), VD.at(x)])));

// --- Caves: killer sums -------------------------------------------------------------------
// Reads [VR, VC, digit] over every cell; the cells naming the clue cell as
// root are exactly its cave. The running sum is rejected past the clue.
const caveSumMachine = (clueCell, total) => {
  const { row, col } = parseCellId(clueCell);
  return NFA.encodeSpec({
    startState: { p: 'r', sum: 0 },
    transition: (s, v) => {
      switch (s.p) {
        case 'r': return { p: 'c', sum: s.sum, m: v === row };
        case 'c': return { p: 'd', sum: s.sum, m: s.m && v === col };
        case 'd': {
          const sum = s.sum + (s.m ? v : 0);
          return sum > total ? undefined : { p: 'r', sum };
        }
      }
    },
    accept: (s) => s.p === 'r' && s.sum === total,
  }, NV);
};
const caveSums = CLUES.map(([clueCell, total]) => new NFA(
  caveSumMachine(clueCell, total), 'cave sum',
  ...cells.flatMap(x => [VR.at(x), VC.at(x), x])));

// --- Caves: no repeated digit ----------------------------------------------------------------
// One machine per digit and pair of rows, reading [digit, VR, VC] along both
// rows: the two cells holding that digit must not name the same root. A
// shaded cell names itself, which no unshaded cell can name.
const caveDistinctMachine = (digit) => NFA.encodeSpec({
  startState: { p: 'seek' },
  transition: (s, v) => {
    switch (s.p) {
      case 'seek': return { p: v === digit ? 'fRow' : 'skip2' };
      case 'skip2': return { p: 'skip1' };
      case 'skip1': return { p: 'seek' };
      case 'fRow': return { p: 'fCol', rr: v };
      case 'fCol': return { p: 'hold', rr: s.rr, rc: v };
      case 'hold': return { p: v === digit ? 'cRow' : 'hSkip2', rr: s.rr, rc: s.rc };
      case 'hSkip2': return { p: 'hSkip1', rr: s.rr, rc: s.rc };
      case 'hSkip1': return { p: 'hold', rr: s.rr, rc: s.rc };
      case 'cRow': return { p: 'cCol', same: v === s.rr, rc: s.rc };
      case 'cCol': return s.same && v === s.rc ? undefined : { p: 'done' };
      case 'done': return { p: 'done' };
    }
  },
  accept: (s) => s.p === 'seek' || s.p === 'hold' || s.p === 'done',
}, NV);
const caveDistinct = [];
for (let digit = 1; digit <= NV; digit++) {
  const machine = caveDistinctMachine(digit);
  for (let r1 = 1; r1 <= N; r1++) {
    for (let r2 = r1 + 1; r2 <= N; r2++) {
      caveDistinct.push(new NFA(machine, `distinct ${digit}`,
        ...[...graph.row(r1), ...graph.row(r2)].flatMap(x => [x, VR.at(x), VC.at(x)])));
    }
  }
}

// --- Path: degree ----------------------------------------------------------------------
// Reads [VS, VD] of the cell, then of each cylinder neighbour. Path cells
// count their path neighbours: one at the start and the end, two elsewhere.
// This is the no-orthogonal-touch rule; with the positions below it makes the
// path cells one simple path from R5C2.
const pathDegreeMachine = NFA.encodeSpec({
  startState: { p: 'shade' },
  transition: (s, v) => {
    switch (s.p) {
      case 'shade': return v === SHADED ? { p: 'code' } : { p: 'done' };
      case 'done': return { p: 'done' };
      case 'code': return v === OFF ? { p: 'done' } : { p: 'nShade', need: v === BODY ? 2 : 1, cnt: 0 };
      case 'nShade': return { p: v === SHADED ? 'nCode' : 'nSkip', need: s.need, cnt: s.cnt };
      case 'nSkip': return { p: 'nShade', need: s.need, cnt: s.cnt };
      case 'nCode': {
        const cnt = s.cnt + (v === OFF ? 0 : 1);
        return cnt > s.need ? undefined : { p: 'nShade', need: s.need, cnt };
      }
    }
  },
  accept: (s) => s.p === 'done' || (s.p === 'nShade' && s.cnt === s.need),
}, NV);
const pathDegrees = cells.map(c => new NFA(pathDegreeMachine, 'path degree',
  ...[c, ...cylNeighbours(c)].flatMap(x => [VS.at(x), VD.at(x)])));

// --- Path: position along the path -------------------------------------------------------
// Reads [VS, VD, VP, VQ] of the cell, then of each cylinder neighbour. A body
// or end cell has a path neighbour at the position just before it; the start
// is at 0 and every other cell is pinned to 0. A closed loop of body cells has
// no cell with a predecessor, so this excludes detached cycles.
const pathPositionMachine = NFA.encodeSpec({
  startState: { p: 'shade' },
  transition: (s, v) => {
    switch (s.p) {
      case 'shade': return v === SHADED ? { p: 'code' } : { p: 'uDepth' };
      case 'uDepth': return { p: 'z1' };            // unshaded: VD is a cave depth
      case 'z1': return v === 1 ? { p: 'z2' } : undefined;
      case 'z2': return v === 1 ? { p: 'done' } : undefined;
      case 'done': return { p: 'done' };
      case 'code': return v === OFF || v === START ? { p: 'z1' } : { p: 'hi' };
      case 'hi': return { p: 'lo', h: v };
      case 'lo': {
        const pos = num(s.h, v);
        return pos >= 1 ? { p: 'nShade', pos, found: false } : undefined;
      }
      case 'nShade': return { p: v === SHADED ? 'nCode' : 'nSkip3', pos: s.pos, found: s.found };
      case 'nSkip3': return { p: 'nSkip2', pos: s.pos, found: s.found };
      case 'nSkip2': return { p: 'nSkip1', pos: s.pos, found: s.found };
      case 'nSkip1': return { p: 'nShade', pos: s.pos, found: s.found };
      case 'nCode': return { p: v === OFF ? 'nSkip2' : 'nHi', pos: s.pos, found: s.found };
      case 'nHi': return { p: 'nLo', pos: s.pos, found: s.found, h: v };
      case 'nLo': return { p: 'nShade', pos: s.pos, found: s.found || num(s.h, v) === s.pos - 1 };
    }
  },
  accept: (s) => s.p === 'done' || (s.p === 'nShade' && s.found),
}, NV);
const pathPositions = cells.map(c => new NFA(pathPositionMachine, 'path position',
  ...[c, ...cylNeighbours(c)].flatMap(x => [VS.at(x), VD.at(x), VP.at(x), VQ.at(x)])));

// --- Path: through every dot, ending after the last one --------------------------------------
// Reads [VD, VP, VQ] of both dot cells (both shaded, so VD is a path code).
// Both are on the path at consecutive positions, and the end cell, if either
// is it, is the later of the two: the path enters it through the dot edge.
const dotEdgeMachine = NFA.encodeSpec({
  startState: { p: 'ca' },
  transition: (s, v) => {
    switch (s.p) {
      case 'ca': return v === OFF ? undefined : { p: 'ha', ea: v === END };
      case 'ha': return { p: 'la', ea: s.ea, h: v };
      case 'la': return { p: 'cb', ea: s.ea, pa: num(s.h, v) };
      case 'cb': {
        if (v === OFF) return undefined;
        const eb = v === END;
        if (s.ea && eb) return undefined;
        const cands = s.ea ? [s.pa - 1] : eb ? [s.pa + 1] : [s.pa - 1, s.pa + 1];
        return { p: 'hb', cands: cands.filter(q => q >= 0 && q < N * N) };
      }
      case 'hb': {
        const lows = s.cands.filter(q => hiOf(q) === v).map(loOf);
        return lows.length ? { p: 'lb', lows } : undefined;
      }
      case 'lb': return s.lows.includes(v) ? { p: 'done' } : undefined;
    }
  },
  accept: (s) => s.p === 'done',
}, NV);
const dotEdges = DOTS.map(([a, b]) => new NFA(dotEdgeMachine, 'dot edge',
  ...[a, b].flatMap(x => [VD.at(x), VP.at(x), VQ.at(x)])));
// Exactly one end cell; it is always a dot cell (cave root machine).
const oneEnd = new ContainExact(String(END), ...VD.at(dotCells));

// --- Path: never orthogonally adjacent to a ghost -----------------------------------------------
const offKey = Pair.fnToKey((s, code) => s !== SHADED || code === OFF, NV);
const ghostClearance = GHOSTS.flatMap(g => cylNeighbours(g).map(
  n => new Pair(offKey, 'ghost clearance', VS.at(n), VD.at(n))));

return [
  shape,
  VS.toVar('shading'),
  VR.toVar('cave root row'),
  VC.toVar('cave root column'),
  VD.toVar('cave depth / path code'),
  VH.toVar('shaded distance hi'),
  VL.toVar('shaded distance lo'),
  VP.toVar('path position hi'),
  VQ.toVar('path position lo'),
  ...fixed,
  ...whiteDots,
  ...noShaded2x2,
  ...shadedConnected,
  ...caveRoots,
  ...caveDepths,
  ...caveSums,
  ...caveDistinct,
  ...pathDegrees,
  ...pathPositions,
  ...dotEdges,
  oneEnd,
  ...ghostClearance,
];
