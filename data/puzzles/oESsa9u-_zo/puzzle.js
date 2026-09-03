// Title: Viper in the Fog
// Author: Jolly Rogers
// Video: https://www.youtube.com/watch?v=oESsa9u-_zo
// Source: https://sudokupad.app/23fMD676d3

// Normal sudoku. Four circles sit on grid vertices; the two digits printed in a
// circle must both appear among the four cells around that vertex. A single
// one-cell-wide snake of orthogonally connected cells is drawn; it begins and
// ends in Box 4, may touch itself orthogonally and diagonally, and must not
// branch or overlap. Box N contains exactly N snake cells, and the digit N
// appears on the snake inside Box N. Box borders cut the snake into segments,
// each of which sums to 1, 5, 10, 15 or 20. Every cell that is not on the snake
// must be able to reach the grid boundary through non-snake cells orthogonally.
// The fog is solving UI (it hides digits until they are placed) and is not a
// rule about the finished grid, so nothing here encodes it.
//
// "One-cell-wide ... must not branch or overlap" is read as the snake being a
// simple path of cells, which is what the degree rules below say. It is not read
// as an extra no-2x2 rule: the same sentence explicitly permits the snake to
// "touch itself orthogonally", and a 2x2 block of snake cells is exactly a
// U-turn touching itself orthogonally.

// --- Model ---------------------------------------------------------------
// The snake is a directed path over grid cells. One Var per orthogonal cell
// pair records whether the snake uses that edge and in which direction (VH for
// each cell's edge to its right neighbour, VV for its edge downwards).
//
// Every box count is stated, so the snake is exactly 1+2+...+9 = 45 cells long.
// Two overlays hold the snake position of a cell modulo 7 (VP) and modulo 8
// (VQ); lcm(7, 8) = 56 > 45, so those two residues pin an absolute position in
// 1..45. A used edge advances the position by one. That is what makes the
// drawing a single snake rather than several: a closed cycle of steps would
// need a length divisible by 56, which will not fit in 45 cells, so the used
// edges form disjoint simple paths; every path start is pinned to position 1
// and every path end to position 45, so each path is 45 cells long, and 45
// cells are all there are.
//
// Two more overlays hold the running total of the current segment modulo 8 (VS)
// and modulo 7 (VT); lcm = 56 exceeds the largest total a segment could reach
// (nine distinct digits in one box, 45), so those two residues pin the total.
// The total restarts at each box border and is checked against the allowed
// segment sums there and at the snake's two ends.
//
// VC is an 11x11 layer: the 9x9 grid plus a ring of cells outside it. Snake
// cells take ON, everything else -- the ring included -- takes OFF, so
// requiring the OFF cells to form one orthogonally-connected region is exactly
// "every non-snake cell can reach the grid boundary".

const OFF_P = 8;                 // VP: snake position mod 7 stored as 1..7
const OFF_Q = 9;                 // VQ: snake position mod 8 stored as 1..8
const OFF_S = 9;                 // VS: segment total mod 8 stored as 1..8
const OFF_T = 8;                 // VT: segment total mod 7 stored as 1..7
const UNUSED = 1, FWD = 2, BWD = 3;   // edge Vars; FWD is a->b, BWD is b->a
const OFF_C = 1, ON_C = 2;       // VC boundary-reachability layer

const SNAKE_LEN = 45;            // 1+2+...+9, from the per-box snake counts
const SEG_SUMS = [1, 5, 10, 15, 20];

const NV = 9;
const modStore = (n, m) => (n % m) + 1;      // residue n mod m stored as 1..m
const modAdd = (v, d, m) => ((v - 1 + d) % m) + 1;
const START_P = modStore(1, 7), START_Q = modStore(1, 8);
const END_P = modStore(SNAKE_LEN, 7), END_Q = modStore(SNAKE_LEN, 8);
// A segment total is pinned by its pair of residues; the mod-8 residues of the
// five allowed sums are distinct, so the mod-8 value alone names the sum.
const SEG_END = new Map(SEG_SUMS.map(t => [modStore(t, 8), modStore(t, 7)]));

// Circles, keyed by the top-left cell of the 2x2 they sit on; the values are
// the two digits printed inside the circle.
const CIRCLES = [
  ['R2C4', 3, 9],
  ['R2C7', 4, 6],
  ['R5C2', 3, 8],
  ['R8C2', 7, 9],
];
const START_BOX = 4;             // the snake begins and ends in Box 4

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const pos7 = graph.makeOverlay('VP');
const pos8 = graph.makeOverlay('VQ');
const tot8 = graph.makeOverlay('VS');
const tot7 = graph.makeOverlay('VT');
const hEdge = graph.makeOverlay('VH');   // cell -> its right neighbour
const vEdge = graph.makeOverlay('VV');   // cell -> the cell below it

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Edges ---------------------------------------------------------------
const edges = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [{ id: hEdge.at(cell), a: cell, b: right }] : []),
    ...(down ? [{ id: vEdge.at(cell), a: cell, b: down }] : []),
  ];
});
// The edges a cell is an endpoint of, with the value meaning "into this cell"
// and the value meaning "out of this cell".
const incidentEdges = cell => {
  const { row, col } = parseCellId(cell);
  const list = [];
  if (col < 9) list.push({ id: hEdge.at(cell), into: BWD, outOf: FWD });
  if (col > 1) list.push({ id: hEdge.at(graph.step(cell, 0, -1)), into: FWD, outOf: BWD });
  if (row < 9) list.push({ id: vEdge.at(cell), into: BWD, outOf: FWD });
  if (row > 1) list.push({ id: vEdge.at(graph.step(cell, -1, 0)), into: FWD, outOf: BWD });
  return list;
};

// --- Per-cell snake shape ------------------------------------------------
// Reads the cell's two position residues, then every edge it touches. An
// off-snake cell uses no edge; a snake cell is entered once and left once,
// except in Box 4 where it may instead be the snake's start (left, never
// entered, position 1) or its end (entered, never left, position 45).
const cellSpec = (incident, endpointsAllowed) => cached(
  'cell|' + (endpointsAllowed ? 'E' : '-') + '|' +
    incident.map(e => e.into + '/' + e.outOf).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value === OFF_P) return { k: 1, on: false };
        if (value > OFF_P) return undefined;       // 9 is not a mod-7 residue
        return endpointsAllowed
          ? { k: 1, on: true, p: value } : { k: 1, on: true };
      }
      if (s.k === 1) {
        if (!s.on) return value === OFF_Q ? { k: 2, on: false } : undefined;
        if (value === OFF_Q) return undefined;
        if (!endpointsAllowed) return { k: 2, on: true, in: 0, out: 0 };
        return {
          k: 2, on: true, in: 0, out: 0,
          start: s.p === START_P && value === START_Q,
          end: s.p === END_P && value === END_Q,
        };
      }
      const idx = s.k - 2;
      if (idx >= incident.length) return undefined;
      const edge = incident[idx];
      if (!s.on) return value === UNUSED ? { k: s.k + 1, on: false } : undefined;
      let { in: nIn, out: nOut } = s;
      if (value === edge.into) nIn++;
      else if (value === edge.outOf) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { ...s, k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (!s.on) return true;
      if (s.in === 1 && s.out === 1) return true;
      if (!endpointsAllowed) return false;
      if (s.in === 0 && s.out === 1) return s.start === true;
      if (s.in === 1 && s.out === 0) return s.end === true;
      return false;
    },
  }, NV));

const startBoxCells = new Set(graph.box(START_BOX));
const cellShape = gridCells.map(cell => {
  const incident = incidentEdges(cell);
  return new NFA(cellSpec(incident, startBoxCells.has(cell)), 'snake-cell',
    pos7.at(cell), pos8.at(cell), ...incident.map(e => e.id));
});

// --- Position along the snake -------------------------------------------
// A used edge advances the position residue by one in the direction of travel.
const stepSpec = (mod, offValue) => cached('step' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.skip) return { skip: true };            // an unused edge says nothing
    if (s.k === 0) return value === UNUSED ? { skip: true } : { k: 1, dir: value };
    if (value === offValue) return undefined;
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    const ok = s.dir === FWD
      ? value === modAdd(s.a, 1, mod)
      : s.a === modAdd(value, 1, mod);
    return ok ? { k: 3 } : undefined;
  },
  accept: s => s.skip === true || s.k === 3,
}, NV));

const positions = edges.flatMap(e => [
  new NFA(stepSpec(7, OFF_P), 'snake-order', e.id, pos7.at(e.a), pos7.at(e.b)),
  new NFA(stepSpec(8, OFF_Q), 'snake-order', e.id, pos8.at(e.a), pos8.at(e.b)),
]);

// --- Segment totals ------------------------------------------------------
// Reads [edge, digit a, digit b, tot8 a, tot8 b, tot7 a, tot7 b]. Inside a box
// the running total gains the digit of the cell being entered. Across a box
// border the segment being left must have reached an allowed sum, and the
// segment being entered restarts at the digit of its first cell.
const totalSpec = sameBox => cached('total|' + sameBox, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.skip) return { skip: true };            // an unused edge says nothing
    if (s.k === 0) return value === UNUSED ? { skip: true } : { k: 1, dir: value };
    // Digits: the forward direction only needs b's, the backward one only a's.
    if (s.k === 1) return s.dir === BWD ? { k: 2, dir: BWD, d: value } : { k: 2, dir: FWD };
    if (s.k === 2) return s.dir === FWD ? { k: 3, dir: FWD, d: value } : { ...s, k: 3 };
    if (value === (s.k <= 4 ? OFF_S : OFF_T)) return undefined;   // k 3,4 read VS
    if (s.k === 3) {                                   // tot8 of a
      if (sameBox) {
        return s.dir === FWD
          ? { k: 4, dir: FWD, d: s.d, want: modAdd(value, s.d, 8) }
          : { k: 4, dir: BWD, d: s.d, seen: value };
      }
      if (s.dir === FWD) {
        if (!SEG_END.has(value)) return undefined;
        return { k: 4, dir: FWD, d: s.d, needT: SEG_END.get(value) };
      }
      return value === modStore(s.d, 8) ? { k: 4, dir: BWD, d: s.d } : undefined;
    }
    if (s.k === 4) {                                   // tot8 of b
      if (sameBox) {
        return s.dir === FWD
          ? (value === s.want ? { k: 5, dir: FWD, d: s.d } : undefined)
          : (s.seen === modAdd(value, s.d, 8) ? { k: 5, dir: BWD, d: s.d } : undefined);
      }
      if (s.dir === FWD) {
        return value === modStore(s.d, 8)
          ? { k: 5, dir: FWD, d: s.d, needT: s.needT } : undefined;
      }
      if (!SEG_END.has(value)) return undefined;
      return { k: 5, dir: BWD, d: s.d, needT: SEG_END.get(value) };
    }
    if (s.k === 5) {                                   // tot7 of a
      if (sameBox) {
        return s.dir === FWD
          ? { k: 6, want: modAdd(value, s.d, 7) }
          : { k: 6, dir: BWD, d: s.d, seen: value };
      }
      if (s.dir === FWD) {
        return value === s.needT ? { k: 6, want: modStore(s.d, 7) } : undefined;
      }
      return value === modStore(s.d, 7) ? { k: 6, want: s.needT } : undefined;
    }
    if (s.k !== 6) return undefined;                   // tot7 of b
    if (sameBox && s.dir === BWD) {
      return s.seen === modAdd(value, s.d, 7) ? { k: 7 } : undefined;
    }
    return value === s.want ? { k: 7 } : undefined;
  },
  accept: s => s.skip === true || s.k === 7,
}, NV));

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return (Math.ceil(row / 3) - 1) * 3 + Math.ceil(col / 3);
};
const totals = edges.map(e => new NFA(
  totalSpec(boxOf(e.a) === boxOf(e.b)), 'segment-total',
  e.id, e.a, e.b, tot8.at(e.a), tot8.at(e.b), tot7.at(e.a), tot7.at(e.b)));

// The snake's own two ends are segment ends the edge scan never sees: the start
// cell opens a segment at its own digit, the finishing cell closes one. Reads
// the cell's edges (to spot which it is), then its digit and both totals.
const endSpec = incident => cached(
  'end|' + incident.map(e => e.into + '/' + e.outOf).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0, in: 0, out: 0 },
    transition: (s, value) => {
      if (s.k < incident.length) {
        const edge = incident[s.k];
        return {
          k: s.k + 1,
          in: Math.min(s.in + (value === edge.into ? 1 : 0), 2),
          out: Math.min(s.out + (value === edge.outOf ? 1 : 0), 2),
        };
      }
      const role = s.in === 0 && s.out === 1 ? 'first'
        : s.in === 1 && s.out === 0 ? 'last' : 'mid';
      if (s.k === incident.length) return { k: s.k + 1, role, d: value };
      if (s.k === incident.length + 1) {               // tot8
        if (s.role === 'mid') return { k: s.k + 1, role: 'mid' };
        if (s.role === 'first') {
          return value === modStore(s.d, 8)
            ? { k: s.k + 1, role: 'first', want: modStore(s.d, 7) } : undefined;
        }
        return SEG_END.has(value)
          ? { k: s.k + 1, role: 'last', want: SEG_END.get(value) } : undefined;
      }
      if (s.k !== incident.length + 2) return undefined;   // tot7
      return s.role === 'mid' || value === s.want ? { k: s.k + 1 } : undefined;
    },
    accept: s => s.k === incident.length + 3,
  }, NV));

const snakeEnds = graph.box(START_BOX).map(cell => {
  const incident = incidentEdges(cell);
  return new NFA(endSpec(incident), 'snake-end',
    ...incident.map(e => e.id), cell, tot8.at(cell), tot7.at(cell));
});

// --- Per-box snake rules -------------------------------------------------
const boxCountSpec = n => cached('count' + n, () => NFA.encodeSpec({
  startState: { c: 0 },
  transition: ({ c }, value) => {
    const next = c + (value === OFF_P ? 0 : 1);
    return next > n ? undefined : { c: next };
  },
  accept: ({ c }) => c === n,
}, NV));
const boxCounts = Array.from({ length: 9 }, (_, i) => new NFA(
  boxCountSpec(i + 1), 'box-snake-count', ...pos7.at(graph.box(i + 1))));

// Digit N sits in exactly one cell of Box N, and that cell must be on the snake.
const digitOnSnakeKey = n => cached('digit' + n,
  () => Pair.fnToKey((d, p) => d !== n || p !== OFF_P, NV));
const boxDigits = Array.from({ length: 9 }, (_, i) => i + 1).flatMap(n =>
  graph.box(n).map(cell =>
    new Pair(digitOnSnakeKey(n), 'box-snake-digit', cell, pos7.at(cell))));

// The drawn snake has no direction, so every rule above is satisfied equally by
// a traversal and its reverse -- a symmetry of this model, not of the puzzle.
// Pin the representative whose first cell comes before its last cell in reading
// order, by scanning Box 4's position residues and rejecting a finishing cell
// seen before the starting one.
const directionSpec = NFA.encodeSpec({
  startState: { half: 0, started: false },
  transition: (s, value) => {
    if (s.half === 0) {
      return { half: 1, started: s.started,
        maybeStart: value === START_P, maybeEnd: value === END_P };
    }
    if (s.maybeEnd && value === END_Q && !s.started) return undefined;
    return { half: 0, started: s.started || (s.maybeStart && value === START_Q) };
  },
  accept: s => s.half === 0 && s.started === true,
}, NV);
const snakeDirection = new NFA(directionSpec, 'snake-direction',
  ...graph.box(START_BOX).flatMap(cell => [pos7.at(cell), pos8.at(cell)]));

// --- Layer agreement -----------------------------------------------------
// Every overlay must agree with VP about which cells the snake occupies.
const agreeKey = (off, other) => cached('agree' + off + '_' + other,
  () => Pair.fnToKey((p, v) => v <= off && (p === OFF_P) === (v === off), NV));
const membership = gridCells.flatMap(cell => [
  new Pair(agreeKey(OFF_Q, 0), 'snake-membership', pos7.at(cell), pos8.at(cell)),
  new Pair(agreeKey(OFF_S, 1), 'snake-membership', pos7.at(cell), tot8.at(cell)),
  new Pair(agreeKey(OFF_T, 2), 'snake-membership', pos7.at(cell), tot7.at(cell)),
]);

// --- Non-snake cells reach the grid boundary -----------------------------
const reach = new Var('C', 'boundary reachability', '11x11');
const reachAt = cell => {
  const { row, col } = parseCellId(cell);
  return reach.cell(row + 1, col + 1);
};
const reachRing = [];
for (let i = 1; i <= 11; i++) {
  for (let j = 1; j <= 11; j++) {
    if (i === 1 || i === 11 || j === 1 || j === 11) {
      reachRing.push(new Given(reach.cell(i, j), OFF_C));
    }
  }
}
const reachKey = Pair.fnToKey((p, v) => v === (p === OFF_P ? OFF_C : ON_C), NV);
const reachLink = gridCells.map(cell =>
  new Pair(reachKey, 'snake-shading', pos7.at(cell), reachAt(cell)));

return [
  new Shape('9x9'),
  pos7.toVar('snake position mod 7'),
  pos8.toVar('snake position mod 8'),
  tot8.toVar('segment total mod 8'),
  tot7.toVar('segment total mod 7'),
  hEdge.toVar('snake edge to the right'),
  vEdge.toVar('snake edge downwards'),
  reach,
  // Domains. VQ and VS use all nine values; VP and VT have one spare, and the
  // edge overlays only ever hold unused/forwards/backwards. The last column of
  // VH and the last row of VV have no neighbour to point at.
  pos7.makeReplicate(new Given(pos7.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  tot7.makeReplicate(new Given(tot7.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  hEdge.makeReplicate(new Given(hEdge.at(gridCells[0]), UNUSED, FWD, BWD)),
  vEdge.makeReplicate(new Given(vEdge.at(gridCells[0]), UNUSED, FWD, BWD)),
  ...graph.column(9).map(cell => new Given(hEdge.at(cell), UNUSED)),
  ...graph.row(9).map(cell => new Given(vEdge.at(cell), UNUSED)),
  ...reachRing,
  ...membership,
  ...reachLink,
  ...cellShape,
  ...positions,
  ...totals,
  ...snakeEnds,
  ...boxCounts,
  ...boxDigits,
  snakeDirection,
  // Non-snake cells reach the boundary; the ring is off-snake, so one region.
  // The snake is a connected path of cells, so its own cells are one region too.
  new ConnectedValues('VC', OFF_C),
  new ConnectedValues('VC', ON_C),
  ...CIRCLES.map(([topLeft, ...digits]) => new Quad(topLeft, ...digits)),
];
