// Title: RAT RUN 15: Connectedness
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=CetIV4UWUR0
// Source: https://sudokupad.app/athyahqib1

// Normal sudoku. Finkz starts on R2C2 and must reach the cupcake on R1C9 by a
// path that visits no cell twice, never crosses itself, and never crosses a
// thick maze wall. A step is orthogonal, or diagonal across a 2x2 block whose
// shared corner carries no wall on any of its four unit edges -- a wall
// anywhere in the block (an end, a 90-degree turn, a straight run, or a
// crossing) blocks both its diagonals. The art draws a rounded cap at only the
// corners where a wall ends or turns (never at a straight-through or crossing
// corner), matching how a stroke is rendered rather than narrowing the rule:
// every wall-touched corner blocks its diagonals, not only the capped ones.
//
// TELEPORTS: nine coloured cell pairs. Entering either cell of a pair
// instantly carries Finkz to its match, so a pair is either wholly unused or
// used as one extra "step" between its two cells (either direction), taken in
// place of one ordinary move -- never in addition to one, since entering a
// teleport is not optional. Matching teleports hold equal digits and
// different-coloured teleports hold different digits, unconditionally (a
// digit rule about the 18 cells themselves, independent of the path).
//
// BLACKCURRANTS: the four drawn edges hold a 1:2 ratio; the rule states not
// all possible blackcurrants are drawn, so no other adjacent pair is
// constrained.
//
// TEST CONSTRAINT: a teleport use ends the current path segment at the entry
// cell and starts a new one at the exit cell, so the path is cut into
// segments by its teleport uses. Every segment must be a renban: a run of
// non-repeating, consecutive digits in any order.
//
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var overlays can carry step codes,
// path-position counters, and the renban-segment bookkeeping described below;
// the 81 grid cells are pinned back to 1-9.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const RAT = 'R2C2';      // the drawn rat emoji
const CUPCAKE = 'R1C9';  // the drawn cupcake emoji

// --- The drawn maze --------------------------------------------------------
// WALLS is transcribed from the eleven mediumvioletred thick lines drawn on
// the grid. Coordinates are exactly as drawn: SudokuPad's [row, col],
// 0-indexed, integer = a lattice corner, so corner (i, j) sits at the
// intersection just above-left of 0-indexed cell (i, j).
const WALLS = [
  [[1, 1], [3, 1], [3, 4], [4, 4]],
  [[3, 3], [1, 3], [1, 2], [2, 2]],
  [[1, 4], [1, 6], [3, 6], [3, 9], [9, 9], [9, 0], [0, 0], [0, 9], [3, 9]],
  [[3, 7], [1, 7], [1, 9]],
  [[4, 6], [3, 6], [3, 5], [5, 5], [5, 6], [6, 6], [6, 8], [8, 8], [8, 9]],
  [[3, 8], [6, 8]],
  [[9, 7], [7, 7], [7, 6], [6, 6]],
  [[9, 5], [8, 5], [8, 6], [7, 6]],
  [[2, 9], [2, 8]],
  [[3, 5], [2, 5], [2, 4]],
  [[7, 1], [4, 1], [4, 3], [8, 3], [8, 1]],
];
// Split into unit lattice segments. wallH.has('i|c') means a wall spans the
// corner row i from column c to c+1; wallV.has('r|j') means a wall spans the
// corner column j from row r to r+1.
const wallH = new Set();
const wallV = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [r0, c0] = line[n - 1], [r1, c1] = line[n];
    if (r0 === r1) {
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) wallH.add(`${r0}|${c}`);
    } else {
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) wallV.add(`${r}|${c0}`);
    }
  }
}
// An orthogonal step between 0-indexed adjacent cells is blocked by the wall
// segment on their shared edge.
const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
// A diagonal step passes through the one lattice corner its 2x2 block
// shares; a wall on any of that corner's four unit edges blocks it.
const cornerBlocked = (i, j) => wallV.has(`${i - 1}|${j}`) || wallV.has(`${i}|${j}`) ||
  wallH.has(`${i}|${j - 1}`) || wallH.has(`${i}|${j}`);

// --- Maze step variables ----------------------------------------------------
// One Var per legal move (orthogonal or diagonal); illegal moves get no Var.
// A step records whether it is unused and, if used, its direction of travel.
const UNUSED = 1, FWD = 2, BWD = 3;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]; // each undirected edge once
const steps = [];
const stepByOrigin = new Map(); // 'r,c,dr,dc' -> step, for the no-crossing check
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    for (const [dr, dc] of DIRS) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 < 0 || r2 > 8 || c2 < 0 || c2 > 8) continue;
      const legal = (dr === 0 || dc === 0)
        ? !orthBlocked(r, c, dr, dc)
        : !cornerBlocked(r + 1, c + Math.max(dc, 0));
      if (!legal) continue;
      const a = makeCellId(r + 1, c + 1), b = makeCellId(r2 + 1, c2 + 1);
      const id = 'VS' + (steps.length + 1);
      const step = { id, a, b };
      steps.push(step);
      stepByOrigin.set(`${r},${c},${dr},${dc}`, step);
      stepsAt.get(a).push({ id, in: BWD, out: FWD });
      stepsAt.get(b).push({ id, in: FWD, out: BWD });
    }
  }
}

// --- Teleports ---------------------------------------------------------------
// Transcribed from the eighteen lettered markers drawn on the grid, paired by
// letter/colour: A yellow, B orange, C lightgreen, D lightskyblue,
// E lightcoral, F plum, G aquamarine, H cornflowerblue, I mediumpurple.
const TELEPORTS = [
  ['R2C3', 'R3C6'], ['R2C9', 'R4C7'], ['R3C7', 'R4C6'], ['R3C9', 'R6C6'],
  ['R4C4', 'R8C9'], ['R4C9', 'R7C7'], ['R5C2', 'R9C6'], ['R5C3', 'R9C9'],
  ['R8C7', 'R9C1'],
];
const teleStepVar = new Var('T', 'teleport steps', TELEPORTS.length);
const teleAt = new Map(); // grid cell -> { id, sideIsFirst }
TELEPORTS.forEach(([a, b], idx) => {
  const id = 'VT' + (idx + 1);
  teleAt.set(a, { id, sideIsFirst: true });
  teleAt.set(b, { id, sideIsFirst: false });
});

// --- Blackcurrants -------------------------------------------------------
// The four black edge discs drawn on the grid.
const BLACKCURRANTS = [['R2C8', 'R3C8'], ['R5C2', 'R6C2'], ['R4C4', 'R5C4'], ['R2C5', 'R2C6']];

// --- Path position (used both for subtour elimination below and as the
// visited/unvisited flag the path-shape machines read) -------------------
const MOD_A = 15, MOD_B = 11;
const OFF = 1, FIRST = 2;
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Per-cell path-shape machines ------------------------------------------
// Every machine reads its incident ordinary steps' values and counts how many
// say "arriving" (matches step.in) vs "leaving" (matches step.out) at this
// cell, capping at the cell's expected in/out degree.
function scanDegree(incident, wantIn, wantOut) {
  return {
    startState: { k: 0, in: 0, out: 0 },
    transition: (s, value) => {
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > wantIn || nOut > wantOut) return undefined;
      return { k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === wantIn && s.out === wantOut,
  };
}
// The per-position in/out pattern, not just the incident count: two cells
// with the same neighbour count can still disagree, position by position, on
// which of FWD/BWD means "arriving" versus "leaving" on that shared step.
const incidentSig = incident => incident.map(s => s.in + '/' + s.out).join(',');
// Rat/cupcake: a fixed, unconditional role (always on the path).
function fixedCellNFA(incident, wantIn, wantOut) {
  const sig = 'fixed|' + wantIn + '|' + wantOut + '|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec(scanDegree(incident, wantIn, wantOut), NV));
}
// A plain cell is off the path (0/0) or an interior path cell (1/1), using
// only ordinary steps. Reads the cell's own path-position (VA) first purely
// as a visited/unvisited flag -- its OFF-ness picks which degree the rest of
// the scan must match, exactly as the position counters already define.
function plainCellNFA(incident) {
  const sig = 'plain|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, visited: value !== OFF, in: 0, out: 0 };
      if (s.k - 1 >= incident.length) return undefined;
      const step = incident[s.k - 1];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      const cap = s.visited ? 1 : 0;
      if (nIn > cap || nOut > cap) return undefined;
      return { k: s.k + 1, visited: s.visited, in: nIn, out: nOut };
    },
    accept: s => {
      const cap = s.visited ? 1 : 0;
      return s.k === 1 + incident.length && s.in === cap && s.out === cap;
    },
  }, NV));
}
// A teleport cell's role (unvisited / entry / exit) is fixed entirely by its
// own teleport-step value, read first; its ordinary steps must then match
// that role exactly (never both an ordinary and a teleport edge on the same
// side -- entering a teleport is mandatory, not optional).
function teleCellNFA(incident, sideIsFirst) {
  const sig = 'tele|' + sideIsFirst + '|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: -1 },
    transition: (s, value) => {
      if (s.k === -1) {
        if (value === UNUSED) return { k: 0, in: 0, out: 0, wantIn: 0, wantOut: 0 };
        if (value !== FWD && value !== BWD) return undefined;
        const isEntry = (value === FWD) === sideIsFirst;
        return { k: 0, in: 0, out: 0, wantIn: isEntry ? 1 : 0, wantOut: isEntry ? 0 : 1 };
      }
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > s.wantIn || nOut > s.wantOut) return undefined;
      return { ...s, k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === s.wantIn && s.out === s.wantOut,
  }, NV));
}

// A cell with only one ordinary neighbour (a maze dead end) needs just two
// cells of context, which is a Pair relation rather than a one-state NFA;
// likewise a fixed-role cell (rat/cupcake) with exactly two candidate moves.
// These wrap the same in/out matching the NFA versions above use.
const matchKind = (value, step) => value === step.in ? 'in' : value === step.out ? 'out' : value === UNUSED ? 'none' : null;

function fixedCellConstraint(incident, wantIn, wantOut) {
  const cells = incident.map(s => s.id);
  if (cells.length === 2) {
    const [s0, s1] = incident;
    const key = cached('fixed2|' + wantIn + '|' + wantOut + '|' + incidentSig(incident), () => Pair.fnToKey((a, b) => {
      const m0 = matchKind(a, s0), m1 = matchKind(b, s1);
      if (m0 === null || m1 === null) return false;
      return (m0 === 'in' ? 1 : 0) + (m1 === 'in' ? 1 : 0) === wantIn &&
        (m0 === 'out' ? 1 : 0) + (m1 === 'out' ? 1 : 0) === wantOut;
    }, NV));
    return new Pair(key, 'path-cell', ...cells);
  }
  return new NFA(fixedCellNFA(incident, wantIn, wantOut), 'path-cell', ...cells);
}

function plainCellConstraint(cell, incident) {
  const cells = [posA.at(cell), ...incident.map(s => s.id)];
  if (cells.length === 2) {
    // One neighbour can never supply both an arriving and a leaving edge, so
    // the only satisfiable case is unvisited with that neighbour's step unused.
    const key = cached('plain2', () => Pair.fnToKey((va, v) => va === OFF && v === UNUSED, NV));
    return new Pair(key, 'path-cell', ...cells);
  }
  return new NFA(plainCellNFA(incident), 'path-cell', ...cells);
}

function teleCellConstraint(incident, sideIsFirst, teleId) {
  const cells = [teleId, ...incident.map(s => s.id)];
  if (cells.length === 2) {
    const [s0] = incident;
    const key = cached('tele2|' + sideIsFirst + '|' + incidentSig(incident), () => Pair.fnToKey((t, v) => {
      let wantIn = 0, wantOut = 0;
      if (t !== UNUSED) {
        if (t !== FWD && t !== BWD) return false;
        const isEntry = (t === FWD) === sideIsFirst;
        wantIn = isEntry ? 1 : 0;
        wantOut = isEntry ? 0 : 1;
      }
      const m = matchKind(v, s0);
      if (m === null) return false;
      return (m === 'in' ? 1 : 0) === wantIn && (m === 'out' ? 1 : 0) === wantOut;
    }, NV));
    return new Pair(key, 'path-cell', ...cells);
  }
  return new NFA(teleCellNFA(incident, sideIsFirst), 'path-cell', ...cells);
}

const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  if (cell === RAT) return fixedCellConstraint(incident, 0, 1);
  if (cell === CUPCAKE) return fixedCellConstraint(incident, 1, 0);
  const tele = teleAt.get(cell);
  if (tele) return teleCellConstraint(incident, tele.sideIsFirst, tele.id);
  return plainCellConstraint(cell, incident);
});

// --- Subtour elimination: two coprime modular position counters -----------
// Numbering a genuine path 1, 2, 3, ... from Finkz's cell (teleport jumps
// count as ordinary moves) is always possible, so "the arriving cell's
// counter is the leaving cell's plus one" is implied by the rules. Any closed
// loop of steps then has a length divisible by both moduli, i.e. by 165 -- and
// there are only 81 cells, so no loop can survive.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const allEdges = [...steps, ...TELEPORTS.map(([a, b], idx) => ({ id: 'VT' + (idx + 1), a, b }))];
const counters = allEdges.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// No two diagonals of the same 2x2 block may both be used (they would cross).
const noCrossKey = cached('no-cross', () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV));
const noCross = [];
for (let r = 0; r <= 7; r++) {
  for (let c = 0; c <= 7; c++) {
    const d1 = stepByOrigin.get(`${r},${c},1,1`);
    const d2 = stepByOrigin.get(`${r},${c + 1},1,-1`);
    if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}

// --- Renban-segment bookkeeping ---------------------------------------------
// Four more full-grid overlays track, per on-path cell, the running summary
// of its teleport-delimited segment: the segment's minimum and maximum digit
// so far (VMN/VMX, encoded value = digit + 1, sentinel OFF = 1), its length so
// far (VLN, encoded value = length + 1, capped at 11 once length >= 10 -- a
// segment can never validly exceed 9 cells, since a renban's digits must be
// distinct within 1-9), and which segment it belongs to (VSG, encoded value =
// index + 1, capped at 11; at most 9 teleport uses are possible so at most 10
// segments exist). All four are OFF exactly when the cell is off the path.
const rmin = graph.makeOverlay('VMN');
const rmax = graph.makeOverlay('VMX');
const rlen = graph.makeOverlay('VLN');
const segid = graph.makeOverlay('VSG');
const LEN_CAP = 10; // raw length sentinel for "already too long to be valid"

// Extends a running summary across an ordinary step: the arriving cell's
// summary is `combine(leaving cell's summary[, arriving cell's own digit])`.
// Unused steps impose nothing. To keep the compiled automaton small, an
// unused step collapses immediately to a single counted "skip" state instead
// of recording the values it reads, and a used step (once its direction is
// known) keeps only the two fields that direction's check actually needs,
// dropping the other side's digit as soon as it is read. `cap` bounds the
// alphabet actually in play (10 for a digit-plus-OFF summary, 11 once length/
// segment-id's own sentinel is included) so the compiler explores far fewer
// branches than the shared 16-value grid alphabet would allow.
function extendNFA(combine, readsDigit, cap) {
  const FIELD_COUNT = readsDigit ? 4 : 2;
  return NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (value > cap) return undefined;
      if (s.k === 0) {
        if (value === UNUSED) return { k: 'skip', left: FIELD_COUNT };
        if (value !== FWD && value !== BWD) return undefined;
        return { k: 1, dir: value };
      }
      if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
      if (s.k === 1) return { k: 2, dir: s.dir, xA: value };
      if (!readsDigit) {
        if (s.k !== 2) return undefined;
        return { dir: s.dir, xA: s.xA, k: 'ready', xB: value };
      }
      if (s.k === 2) return s.dir === BWD
        ? { k: 3, dir: s.dir, xA: s.xA, dA: value }
        : { k: 3, dir: s.dir, xA: s.xA };
      if (s.k === 3) return { ...s, k: 4, xB: value };
      if (s.k === 4) return s.dir === FWD
        ? { dir: s.dir, xA: s.xA, dA: s.dA, xB: s.xB, k: 'ready', dB: value }
        : { ...s, k: 'ready' };
      return undefined;
    },
    accept: s => {
      if (s.k === 'done') return true;
      if (s.k !== 'ready') return false;
      if (readsDigit) {
        return s.dir === FWD
          ? s.xA !== OFF && combine(s.xA, s.dB) === s.xB
          : s.xB !== OFF && combine(s.xB, s.dA) === s.xA;
      }
      return s.dir === FWD
        ? s.xA !== OFF && combine(s.xA) === s.xB
        : s.xB !== OFF && combine(s.xB) === s.xA;
    },
  }, NV);
}
const minCombine = (xA, dB) => Math.min(xA - 1, dB) + 1;
const maxCombine = (xA, dB) => Math.max(xA - 1, dB) + 1;
const lenCombine = xA => Math.min((xA - 1) + 1, LEN_CAP) + 1;
const segCombine = xA => xA;
const extendKeys = {
  min: cached('ext-min', () => extendNFA(minCombine, true, 10)),
  max: cached('ext-max', () => extendNFA(maxCombine, true, 10)),
  len: cached('ext-len', () => extendNFA(lenCombine, false, LEN_CAP + 1)),
  seg: cached('ext-seg', () => extendNFA(segCombine, false, TELEPORTS.length + 2)),
};
const propagate = steps.flatMap(s => [
  new NFA(extendKeys.min, 'segment-min', s.id, rmin.at(s.a), s.a, rmin.at(s.b), s.b),
  new NFA(extendKeys.max, 'segment-max', s.id, rmax.at(s.a), s.a, rmax.at(s.b), s.b),
  new NFA(extendKeys.len, 'segment-len', s.id, rlen.at(s.a), rlen.at(s.b)),
  new NFA(extendKeys.seg, 'segment-id', s.id, segid.at(s.a), segid.at(s.b)),
]);

// A used teleport edge is treated as one more directed step for the same
// per-edge propagation as ordinary steps, just with "extend" replaced by
// "reset": the exit cell's summary becomes a fresh one-cell run of its own
// digit (min = max = its digit, length = 1), and the segment id increments.
const teleFreshCombine = (xA, dB) => dB + 1;             // ignore xA: fresh min/max = own digit
const teleLenResetCombine = () => FIRST;                  // fresh length = 1
const segCapValue = TELEPORTS.length + 2;
const teleSegIncCombine = xA => Math.min(xA + 1, segCapValue);
extendKeys.teleFresh = cached('ext-tele-fresh', () => extendNFA(teleFreshCombine, true, 10));
extendKeys.teleLen = cached('ext-tele-len', () => extendNFA(teleLenResetCombine, false, LEN_CAP + 1));
extendKeys.teleSeg = cached('ext-tele-seg', () => extendNFA(teleSegIncCombine, false, segCapValue));
const propagateTele = TELEPORTS.flatMap(([a, b], idx) => {
  const id = 'VT' + (idx + 1);
  return [
    new NFA(extendKeys.teleFresh, 'teleport-reset-min', id, rmin.at(a), a, rmin.at(b), b),
    new NFA(extendKeys.teleFresh, 'teleport-reset-max', id, rmax.at(a), a, rmax.at(b), b),
    new NFA(extendKeys.teleLen, 'teleport-reset-len', id, rlen.at(a), rlen.at(b)),
    new NFA(extendKeys.teleSeg, 'teleport-segment-id', id, segid.at(a), segid.at(b)),
  ];
});

// The cell a used teleport edge departs from (its entry side) must already
// hold a complete, valid renban run (max - min + 1 == length) -- the segment
// the path is about to leave. Reads the teleport step first to know whether
// this side is the entry (given `sideIsFirst`, matching teleAt's convention),
// then collapses to a single accept/reject once min, max and length are read;
// an unused edge, or this side playing exit, is left unconstrained.
function entryCompleteNFA(sideIsFirst) {
  const sig = 'entry-complete|' + sideIsFirst;
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (value > 11) return undefined;
      if (s.k === 0) {
        if (value === UNUSED) return { k: 'skip', left: 3 };
        if (value !== FWD && value !== BWD) return undefined;
        return (value === FWD) === sideIsFirst ? { k: 1 } : { k: 'skip', left: 3 };
      }
      if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
      if (s.k === 1) return { k: 2, mn: value };
      if (s.k === 2) return { k: 3, mn: s.mn, mx: value };
      if (s.k !== 3) return undefined;
      return (s.mn !== OFF && s.mx - s.mn + 1 === value - 1) ? { k: 'ready' } : undefined;
    },
    accept: s => s.k === 'done' || s.k === 'ready',
  }, NV));
}
const entryChecks = TELEPORTS.flatMap(([a, b], idx) => {
  const id = 'VT' + (idx + 1);
  return [
    new NFA(entryCompleteNFA(true), 'teleport-segment-complete', id, rmin.at(a), rmax.at(a), rlen.at(a)),
    new NFA(entryCompleteNFA(false), 'teleport-segment-complete', id, rmin.at(b), rmax.at(b), rlen.at(b)),
  ];
});

// The path's final cell (the cupcake, which has no outgoing edge) also ends a
// segment, so its own running summary must already be a complete renban.
const cupcakeEndNFA = cached('cupcake-end', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (value > 11) return undefined;
    if (s.k === 0) return { k: 1, mn: value };
    if (s.k === 1) return { k: 2, mn: s.mn, mx: value };
    if (s.k !== 2) return undefined;
    return (s.mn !== OFF && s.mx - s.mn + 1 === value - 1) ? { k: 'ready' } : undefined;
  },
  accept: s => s.k === 'ready',
}, NV));
const cupcakeEnd = new NFA(cupcakeEndNFA, 'segment-end', rmin.at(CUPCAKE), rmax.at(CUPCAKE), rlen.at(CUPCAKE));

// Finkz's own cell has no incoming edge, so it starts the first segment
// directly: a fresh one-cell run of its own digit.
const digitPlusOneKey = cached('digit-plus-one', () => Pair.fnToKey((d, x) => x === d + 1, NV));
const ratInit = [
  new Pair(digitPlusOneKey, 'segment-start', RAT, rmin.at(RAT)),
  new Pair(digitPlusOneKey, 'segment-start', RAT, rmax.at(RAT)),
  new Given(rlen.at(RAT), FIRST),
  new Given(segid.at(RAT), FIRST),
];

// Off the path, all four summary layers read OFF; on it, none do. VA already
// carries exactly that visited/unvisited distinction.
const offGateNFA = cached('off-gate', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, visited: value !== OFF };
    if (s.k >= 1 && s.k <= 4) {
      if ((value !== OFF) !== s.visited) return undefined;
      return { k: s.k + 1, visited: s.visited };
    }
    return undefined;
  },
  accept: s => s.k === 5,
}, NV));
const offGates = gridCells.map(cell => new NFA(offGateNFA, 'segment-off-gate',
  posA.at(cell), rmin.at(cell), rmax.at(cell), rlen.at(cell), segid.at(cell)));

// Two cells in the same segment must hold different digits (the other half
// of "renban": a complete range of the right width, with no repeat). Checked
// pairwise over every pair of grid cells, since which cells share a segment
// is a solver choice.
const segDistinctKey = cached('seg-distinct', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value <= segCapValue ? { k: 1, sx: value } : undefined;
    if (s.k === 1) return value <= 9 ? { k: 2, sx: s.sx, dx: value } : undefined;
    if (s.k === 2) return value <= segCapValue ? { k: 3, sx: s.sx, dx: s.dx, sy: value } : undefined;
    if (s.k !== 3) return undefined;
    if (value > 9) return undefined;
    if (s.sx === s.sy && s.sx !== OFF && s.dx === value) return undefined;
    return { k: 'done' };
  },
  accept: s => s.k === 'done',
}, NV));
const segDistinct = [];
for (let i = 0; i < gridCells.length; i++) {
  for (let j = i + 1; j < gridCells.length; j++) {
    const x = gridCells[i], y = gridCells[j];
    segDistinct.push(new NFA(segDistinctKey, 'segment-distinct', segid.at(x), x, segid.at(y), y));
  }
}

// --- Variables and domains --------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'maze steps', steps.length),
  teleStepVar,
  rmin.toVar('segment min digit'),
  rmax.toVar('segment max digit'),
  rlen.toVar('segment length'),
  segid.toVar('segment id'),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  rmin.makeReplicate(new Given(rmin.cells()[0], ...range(1, 10))),
  rmax.makeReplicate(new Given(rmax.cells()[0], ...range(1, 10))),
  rlen.makeReplicate(new Given(rlen.cells()[0], ...range(1, LEN_CAP + 1))),
  segid.makeReplicate(new Given(segid.cells()[0], ...range(1, TELEPORTS.length + 2))),
  // Finkz's own cell is the first cell of the path, pinning both position
  // counters so the numbering can't float on unvisited cells or rotate.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  // Step Vars need no domain of their own: the path-cell machines above
  // accept no value on them but unused / in / out.
];

const blackcurrants = BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b));

const teleportDigits = [
  ...TELEPORTS.map(([a, b]) => new SameValues(2, a, b)),
  new AllDifferent(...TELEPORTS.map(([a]) => a)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...propagate,
  ...propagateTele,
  ...entryChecks,
  cupcakeEnd,
  ...ratInit,
  ...offGates,
  ...segDistinct,
  ...blackcurrants,
  ...teleportDigits,
];
