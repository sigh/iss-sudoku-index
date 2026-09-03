// Title: RAT RUN 20: Gifted
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dedVIa0-gSA
// Source: https://sudokupad.app/mpi5qhto7n?setting-foganim=1

// Normal sudoku. Finkz the rat starts on R1C2 and must reach the cupcake on
// R7C7 by a path that visits no cell twice, never crosses itself, and never
// passes through a thick wall. A step is orthogonal, or diagonal when there is
// a 2x2 space to move through -- i.e. when the 2x2 block of cells the step cuts
// across carries no wall on any of its four internal borders. Exactly one thick
// wall is drawn inside the grid; it is the one the red tinsel decorates.
//
// CHRISTMAS LIGHTS: eight bulbs hang beside rows 1-4 and above columns 1-4. In
// an orange bulb's lane every cell Finkz visits holds an odd digit; in a blue
// bulb's lane every visited cell holds an even digit. Cells Finkz does not
// visit are unconstrained, and lanes 5-9 carry no bulb.
//
// TELEPORTS: five coloured cell pairs. Entering either cell of a pair carries
// Finkz instantly to its match, so a pair is either wholly off the path or used
// as one extra step between its two cells (in either direction) taken in place
// of an ordinary move -- never alongside one, since entering a teleport is not
// optional. Matching teleports hold equal digits and different-coloured
// teleports hold different digits; that is a statement about the ten cells,
// independent of whether the path uses them.
//
// BLACKCURRANTS: the four drawn edge discs join two digits in a 1:2 ratio. The
// rules give no negative constraint, so no other adjacent pair is restricted.
//
// BAUBLES: each gold disc's number totals the cells it touches -- the two cells
// either side of the border it sits on, or, for the one bauble drawn on a
// lattice corner, all four cells around that corner.
//
// TEST CONSTRAINT: two cells adjacent along the path hold consecutive digits.
// Across a teleport jump they hold identical digits instead, which the teleport
// digit rule above already states.
//
// Fog is solving UI: the payload's trigger/effect list only uncovers cells as
// digits are entered, and no rule is worded against what is revealed. The second
// rat and the explosion drawn on R7C9 carry no rules-text meaning.
//
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var overlays can carry step codes and the
// path-position counters; the 81 grid cells are pinned back to 1-9.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const RAT = 'R1C2';      // the rat emoji drawn in the top-left box
const CUPCAKE = 'R7C7';  // the cupcake emoji

// --- The drawn maze --------------------------------------------------------
// The tinselled wall and the board's outer frame, transcribed exactly as drawn:
// SudokuPad's [row, col], 0-indexed, integers, so each pair is a lattice corner
// and corner (i, j) is the point just above-left of 0-indexed cell (i, j).
const WALLS = [
  [[7, 6], [6, 6], [6, 8]],                             // tinselled wall
  [[0, 0], [0, 9], [9, 9], [9, 0], [0, 0]],             // board edge
];
// Split into unit lattice segments. wallH.has('i|c') means a wall spans corner
// row i from column c to c+1; wallV.has('r|j') spans corner column j from row r
// to r+1.
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
// An orthogonal step between 0-indexed adjacent cells is blocked by a wall on
// their shared border.
const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
// A diagonal step cuts across the 2x2 block of cells meeting at one lattice
// corner. Those four cells have exactly four internal borders -- the corner's
// four arms -- so "there's a 2x2 space to move through" is: none of them is a
// wall.
const cornerBlocked = (i, j) => wallV.has(`${i - 1}|${j}`) || wallV.has(`${i}|${j}`) ||
  wallH.has(`${i}|${j - 1}`) || wallH.has(`${i}|${j}`);

// --- Maze step variables ---------------------------------------------------
// One Var per legal move; a move the maze forbids gets no variable at all. A
// step records whether it is unused and, if used, its direction of travel.
const UNUSED = 1, FWD = 2, BWD = 3;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];  // each undirected edge once
const steps = [];
const stepByOrigin = new Map();  // 'r,c,dr,dc' -> step, for the no-crossing check
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

// --- Teleports -------------------------------------------------------------
// The five lettered/coloured marker pairs drawn on the grid: A green, B yellow,
// C orange, D red, E purple.
const TELEPORTS = [
  ['R2C6', 'R8C9'], ['R2C7', 'R6C9'], ['R3C4', 'R9C6'],
  ['R4C7', 'R9C1'], ['R5C5', 'R7C9'],
];
const teleId = idx => 'VT' + (idx + 1);
const teleAt = new Map();  // grid cell -> { id, sideIsFirst }
TELEPORTS.forEach(([a, b], idx) => {
  teleAt.set(a, { id: teleId(idx), sideIsFirst: true });
  teleAt.set(b, { id: teleId(idx), sideIsFirst: false });
});

// --- Blackcurrants and baubles ---------------------------------------------
// The four black edge discs.
const BLACKCURRANTS = [
  ['R2C2', 'R2C3'], ['R2C2', 'R3C2'], ['R8C4', 'R9C4'], ['R9C2', 'R9C3'],
];
// The ten gold discs: the printed number, then the cells the disc overlaps --
// two for a disc drawn on a cell border, four for the one drawn on a corner.
const BAUBLES = [
  [15, ['R1C7', 'R1C8']],
  [21, ['R1C4', 'R1C5', 'R2C4', 'R2C5']],
  [12, ['R4C3', 'R4C4']],
  [6, ['R4C4', 'R5C4']],
  [13, ['R5C7', 'R6C7']],
  [8, ['R6C2', 'R6C3']],
  [11, ['R7C2', 'R7C3']],
  [16, ['R7C4', 'R7C5']],
  [14, ['R8C6', 'R8C7']],
  [15, ['R8C7', 'R9C7']],
];
// The eight bulbs, each opposite one lane: 0 = blue (visited digits even),
// 1 = orange (visited digits odd).
const LIGHTS = [
  { lane: graph.row(1), parity: 0 },
  { lane: graph.row(2), parity: 1 },
  { lane: graph.row(3), parity: 0 },
  { lane: graph.row(4), parity: 1 },
  { lane: graph.column(1), parity: 1 },
  { lane: graph.column(2), parity: 0 },
  { lane: graph.column(3), parity: 1 },
  { lane: graph.column(4), parity: 0 },
];

// --- Path position ---------------------------------------------------------
// Two coprime modular counters, used for subtour elimination below and as the
// visited/unvisited flag the rest of the encoding reads.
const MOD_A = 15, MOD_B = 11;
const OFF = 1, FIRST = 2;
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Per-cell path-shape machines ------------------------------------------
// Each machine reads the cell's incident step values and counts how many say
// "arriving" (matches step.in) versus "leaving" (matches step.out), capping at
// the in/out degree the cell's role allows.
// The signature keys on the per-position in/out pattern, not just the incident
// count: two cells with the same number of neighbours can still disagree,
// position by position, on which of FWD/BWD means arriving on that shared step.
const incidentSig = incident => incident.map(s => s.in + '/' + s.out).join(',');

// Finkz's cell and the cupcake have a fixed, unconditional degree.
function fixedCellNFA(incident, wantIn, wantOut) {
  const sig = 'fixed|' + wantIn + '|' + wantOut + '|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec({
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
  }, NV));
}

// A plain cell is either off the path (0 in, 0 out) or walked through (1 in,
// 1 out). Its own position counter is read first, purely as the
// visited/unvisited flag, which is what makes the two cases exclusive.
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

// A teleport cell's role -- unvisited, entry, or exit -- is fixed entirely by
// its own teleport-step value, read first; its ordinary steps must then supply
// exactly the complementary degree. An entry cell is walked into and leaves by
// the jump, an exit cell arrives by the jump and is walked out of, and an
// unvisited pair touches no ordinary step at all. That is what makes entering a
// teleport mandatory rather than optional: no assignment lets the path walk
// through a teleport cell on ordinary steps alone.
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

const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const stepIds = incident.map(s => s.id);
  if (cell === RAT) {
    return new NFA(fixedCellNFA(incident, 0, 1), 'path-cell', ...stepIds);
  }
  if (cell === CUPCAKE) {
    return new NFA(fixedCellNFA(incident, 1, 0), 'path-cell', ...stepIds);
  }
  const tele = teleAt.get(cell);
  if (tele) {
    return new NFA(teleCellNFA(incident, tele.sideIsFirst), 'path-cell',
      tele.id, ...stepIds);
  }
  return new NFA(plainCellNFA(incident), 'path-cell', posA.at(cell), ...stepIds);
});

// A teleport cell's own path-shape machine never reads its position counter, so
// tie the two together directly: the pair's step is used exactly when its cells
// are on the path.
const teleVisitedKey = cached('tele-visited', () => Pair.fnToKey(
  (t, p) => (t === UNUSED) === (p === OFF), NV));
const teleVisited = [...teleAt.entries()].map(([cell, tele]) =>
  new Pair(teleVisitedKey, 'path-cell', tele.id, posA.at(cell)));

// The two counters agree about which cells are on the path. Without this, an
// off-path cell's VB would be left free by every other constraint.
const bothOffKey = cached('both-off', () => Pair.fnToKey(
  (a, b) => (a === OFF) === (b === OFF), NV));
const counterAgree = gridCells.map(cell =>
  new Pair(bothOffKey, 'path-cell', posA.at(cell), posB.at(cell)));

// --- Subtour elimination: two coprime modular position counters ------------
// Numbering a genuine path 1, 2, 3, ... from Finkz's cell (a teleport jump
// counts as one move) is always possible, so "the arriving cell's counter is the
// leaving cell's plus one" is implied by the rules and rules nothing out on its
// own. What it buys is that a closed loop of steps sitting beside the path would
// need a length divisible by both 15 and 11, i.e. by 165, and there are only 81
// cells; degree constraints alone cannot exclude such a loop.
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
const allEdges = [
  ...steps,
  ...TELEPORTS.map(([a, b], idx) => ({ id: teleId(idx), a, b })),
];
const counters = allEdges.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// No two diagonals of the same 2x2 block may both be used: they cross.
const noCrossKey = cached('no-cross', () => Pair.fnToKey(
  (x, y) => x === UNUSED || y === UNUSED, NV));
const noCross = [];
for (let r = 0; r <= 7; r++) {
  for (let c = 0; c <= 7; c++) {
    const d1 = stepByOrigin.get(`${r},${c},1,1`);
    const d2 = stepByOrigin.get(`${r},${c + 1},1,-1`);
    if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}

// --- The test constraint ---------------------------------------------------
// Reads a step and the two digits it joins: when the step is used, in either
// direction, the digits differ by one. An unused step collapses to a counted
// skip state rather than recording the digits it reads, which keeps the
// compiled machine tiny.
const consecutiveKey = cached('consecutive', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value === UNUSED) return { k: 'skip', left: 2 };
      if (value !== FWD && value !== BWD) return undefined;
      return { k: 1 };
    }
    if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
    if (s.k === 1) return value > 9 ? undefined : { k: 2, a: value };
    if (s.k !== 2) return undefined;
    if (value > 9) return undefined;
    return Math.abs(s.a - value) === 1 ? { k: 'done' } : undefined;
  },
  accept: s => s.k === 'done',
}, NV));
// Only ordinary steps: across a teleport the digits are identical instead, which
// is what the teleport digit rule below says.
const consecutive = steps.map(s =>
  new NFA(consecutiveKey, 'path-consecutive', s.id, s.a, s.b));

// --- Christmas lights ------------------------------------------------------
// Reads the cell's position counter and its digit: a cell Finkz visits must
// match its lane's bulb parity, and an unvisited cell is unconstrained. A cell
// lying in two lanes of opposite parity therefore simply cannot be visited.
const lightKey = parity => cached('light|' + parity, () => Pair.fnToKey(
  (p, d) => p === OFF || d % 2 === parity, NV));
const lights = LIGHTS.flatMap(({ lane, parity }) => lane.map(cell =>
  new Pair(lightKey(parity), 'christmas-light', posA.at(cell), cell)));

// --- Digit clues -----------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b));
const baubles = BAUBLES.map(([total, cells]) => new Sum(total, ...cells));
const teleportDigits = [
  ...TELEPORTS.map(([a, b]) => new SameValues(2, a, b)),
  // Each pair's two cells are equal, so one representative per pair being
  // pairwise distinct is exactly "teleports that don't match have different
  // digits".
  new AllDifferent(...TELEPORTS.map(([a]) => a)),
];

// --- Variables and domains -------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'maze steps', steps.length),
  new Var('T', 'teleport steps', TELEPORTS.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the off-path sentinel plus the 15 residues is
  // exactly the 16-value alphabet.
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  // Finkz's own cell is the first cell of the path, which pins both counters so
  // the numbering cannot rotate.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  // The step Vars need no domain of their own: the path-cell machines accept no
  // value on them but unused / in / out.
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...teleVisited,
  ...counterAgree,
  ...counters,
  ...noCross,
  ...consecutive,
  ...lights,
  ...blackcurrants,
  ...baubles,
  ...teleportDigits,
];
