// Title: RAT RUN 18: Mirror Maze
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=9xrJiqM7nw8
// Source: https://sudokupad.app/hypzc2xwbi

// Normal sudoku on the digits. Finkz starts on R1C1 and must reach the cupcake
// on R1C9 by a walk that visits no cell twice, never crosses itself, and never
// crosses a thick maze wall. A step is orthogonal, or diagonal across a 2x2
// block -- and a diagonal needs "a 2x2 space", so a wall on any of the four
// unit edges meeting the shared corner blocks it, and a round wall-spot drawn
// on that corner blocks it as well.
//
// MIRROR CELLS: exactly one per row, column and box; they carry no teleport;
// a mirror cell's value is 10 minus its digit (every other cell's value is its
// digit); the nine mirror digits are all different.
//
// TELEPORTS: three coloured cell pairs. Entering either cell of a pair
// instantly carries Finkz to its match, so a pair is either wholly unused or
// used as one extra "step" between its two cells (either direction), taken in
// place of one ordinary move -- never in addition to one, since entering a
// teleport is not optional. Matching teleports hold equal digits and
// different-coloured teleports hold different digits, unconditionally (a digit
// rule about the six cells themselves, independent of the path).
//
// ONE-WAY DOORS: six purple chevrons on cell borders. Each names the smaller of
// the two values it sits between (unconditionally), and the border may only be
// crossed in the direction the chevron points.
//
// TEST CONSTRAINT: two cells consecutive along the walk and physically adjacent
// -- i.e. joined by an ordinary step rather than by a teleport jump -- have
// values differing by at least 5.
//
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var overlays can carry step codes and
// path-position counters; the 81 grid cells are pinned back to 1-9 below.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const RAT = 'R1C1';      // the drawn rat emoji
const CUPCAKE = 'R1C9';  // the drawn cupcake emoji

// --- The drawn maze --------------------------------------------------------
// WALLS is transcribed from the sixteen forestgreen thick lines drawn on the
// grid (the grid frame is the first of them). Coordinates are exactly as
// drawn: SudokuPad's [row, col], 0-indexed, integer = a lattice corner, so
// corner (i, j) sits at the intersection just above-left of 0-indexed cell
// (i, j).
const WALLS = [
  [[2, 1], [0, 1], [0, 9], [9, 9], [9, 0], [0, 0], [0, 1]],
  [[0, 6], [2, 6]],
  [[3, 9], [3, 8]],
  [[9, 3], [7, 3]],
  [[3, 7], [3, 3]],
  [[3, 4], [2, 4]],
  [[1, 2], [3, 2], [3, 1], [5, 1], [5, 2], [6, 2]],
  [[7, 2], [8, 2], [8, 1]],
  [[6, 1], [7, 1]],
  [[6, 3], [6, 4]],
  [[1, 3], [2, 3]],
  [[1, 4], [1, 5], [2, 5]],
  [[1, 7], [1, 8], [2, 8]],
  [[5, 5], [6, 5]],
  [[6, 6], [7, 6]],
  [[4, 6], [5, 6]],
];
// SPOTS is transcribed from the thirty-seven forestgreen 0.32-size discs drawn
// on lattice corners, same [row, col] convention.
const SPOTS = [
  [1, 2], [1, 3], [1, 4], [1, 5], [1, 7], [1, 8],
  [2, 1], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8],
  [3, 1], [3, 2], [3, 3], [3, 7], [3, 8],
  [4, 2], [4, 3], [4, 4], [4, 6],
  [5, 1], [5, 2], [5, 5], [5, 6],
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
  [7, 1], [7, 2], [7, 3], [7, 6],
  [8, 1], [8, 2],
];
// Split the walls into unit lattice segments. wallH.has('i|c') means a wall
// spans the corner row i from column c to c+1; wallV.has('r|j') means a wall
// spans the corner column j from row r to r+1.
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
const spotAt = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));
// An orthogonal step between 0-indexed adjacent cells is blocked by the wall
// segment on their shared edge.
const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
// A diagonal step passes through the one lattice corner its 2x2 block shares.
// The four unit edges meeting there are the 2x2's own internal edges, so a wall
// on any of them means there is no "2x2 space" to move in; a drawn round
// wall-spot closes the corner too. Three of the drawn spots -- (4,2), (4,3),
// (4,4) -- sit on corners with no wall at all, which is what shows the spots
// are a clue of their own rather than decoration on the wall ends.
const cornerBlocked = (i, j) => wallV.has(`${i - 1}|${j}`) || wallV.has(`${i}|${j}`) ||
  wallH.has(`${i}|${j - 1}`) || wallH.has(`${i}|${j}`) || spotAt.has(`${i}|${j}`);

// --- Maze step variables ----------------------------------------------------
// One Var per legal move (orthogonal or diagonal); illegal moves get no Var.
// A step records whether it is unused and, if used, its direction of travel.
const UNUSED = 1, FWD = 2, BWD = 3;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]; // each undirected edge once
const steps = [];
const stepByOrigin = new Map(); // 'r,c,dr,dc' -> step, for the no-crossing check
const stepByPair = new Map();   // 'cellA|cellB' (both orders) -> step
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
      stepByPair.set(`${a}|${b}`, step);
      stepByPair.set(`${b}|${a}`, step);
      stepsAt.get(a).push({ id, in: BWD, out: FWD });
      stepsAt.get(b).push({ id, in: FWD, out: BWD });
    }
  }
}

// --- Teleports ---------------------------------------------------------------
// Transcribed from the six lettered markers drawn on the grid, paired by
// letter/colour: A yellow, B plum/purple, C lightgreen.
const TELEPORTS = [
  ['R3C8', 'R5C3'], ['R4C8', 'R6C4'], ['R6C6', 'R9C5'],
];
const teleStepVar = new Var('T', 'teleport steps', TELEPORTS.length);
const teleAt = new Map(); // grid cell -> { id, sideIsFirst }
TELEPORTS.forEach(([a, b], idx) => {
  const id = 'VT' + (idx + 1);
  teleAt.set(a, { id, sideIsFirst: true });
  teleAt.set(b, { id, sideIsFirst: false });
});

// --- One-way doors -----------------------------------------------------------
// Transcribed from the six purple chevrons drawn on cell borders. `to` is the
// cell each chevron points at -- both the only direction Finkz may cross that
// border and, by the rule, the smaller of the two values.
const DOORS = [
  { from: 'R1C2', to: 'R1C3' },
  { from: 'R2C4', to: 'R1C4' },
  { from: 'R2C3', to: 'R3C3' },
  { from: 'R5C3', to: 'R4C3' },
  { from: 'R6C3', to: 'R5C3' },
  { from: 'R7C3', to: 'R7C2' },
];

// --- Mirror cells, and the value each cell contributes ----------------------
// Two full-grid overlays: a mirror flag and the cell's value. Nothing in the
// art marks the mirror cells, so the flag is a solver choice; digit 5 mirrors
// to itself, so the value alone could not stand in for the flag.
const PLAIN = 1, MIRROR = 2;
const flag = graph.makeOverlay('VF');
const value = graph.makeOverlay('VV');
// Reads digit, flag, value: value is the digit, or 10 minus it in a mirror.
const valueNFA = cached('value-link', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) return v <= 9 ? { k: 1, digit: v } : undefined;
    if (s.k === 1) {
      if (v !== PLAIN && v !== MIRROR) return undefined;
      return { k: 2, want: v === PLAIN ? s.digit : 10 - s.digit };
    }
    if (s.k !== 2) return undefined;
    return v === s.want ? { k: 'done' } : undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const valueLink = gridCells.map(cell =>
  new NFA(valueNFA, 'mirror-value', cell, flag.at(cell), value.at(cell)));

// One Var cell per row holds that row's mirror digit, so "every mirror cell
// contains a different digit" becomes a single AllDifferent over the nine.
// Reads flag, digit, the row's register: a mirror cell forces the register to
// its digit, a plain cell says nothing. With exactly one mirror per row, the
// register is pinned and adds no free choice.
const mirrorDigits = new Var('D', 'mirror digit by row', 9);
const registerNFA = cached('mirror-register', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) {
      if (v === PLAIN) return { k: 'skip', left: 2 };
      if (v !== MIRROR) return undefined;
      return { k: 1 };
    }
    if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
    if (s.k === 1) return v <= 9 ? { k: 2, digit: v } : undefined;
    if (s.k !== 2) return undefined;
    return v === s.digit ? { k: 'done' } : undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const mirrorRules = [
  ...range(1, 9).flatMap(n => [
    new ContainExact(String(MIRROR), ...flag.row(n)),
    new ContainExact(String(MIRROR), ...flag.column(n)),
  ]),
  ...flag.boxes().map(box => new ContainExact(String(MIRROR), ...box)),
  // Mirror cells may not contain teleports.
  ...[...teleAt.keys()].map(cell => new Given(flag.at(cell), PLAIN)),
  ...gridCells.map(cell => new NFA(
    registerNFA, 'mirror-digit', flag.at(cell), cell,
    mirrorDigits.cell(parseCellId(cell).row))),
  new AllDifferent(...mirrorDigits.cells()),
];

// --- Per-cell path-shape machines ------------------------------------------
// Every machine reads its incident ordinary steps' values and counts how many
// say "arriving" (matches step.in) vs "leaving" (matches step.out) at this
// cell, capping at the cell's expected in/out degree.
function scanDegree(incident, wantIn, wantOut) {
  return {
    startState: { k: 0, in: 0, out: 0 },
    transition: (s, v) => {
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (v === step.in) nIn++;
      else if (v === step.out) nOut++;
      else if (v !== UNUSED) return undefined;
      if (nIn > wantIn || nOut > wantOut) return undefined;
      return { k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === wantIn && s.out === wantOut,
  };
}
// The per-position in/out pattern, not just the incident count: two cells with
// the same neighbour count can still disagree, position by position, on which
// of FWD/BWD means "arriving" versus "leaving" on that shared step.
const incidentSig = incident => incident.map(s => s.in + '/' + s.out).join(',');
// Rat/cupcake: a fixed, unconditional role (always on the path).
function fixedCellNFA(incident, wantIn, wantOut) {
  const sig = 'fixed|' + wantIn + '|' + wantOut + '|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec(scanDegree(incident, wantIn, wantOut), NV));
}
// A plain cell is off the path (0/0) or an interior path cell (1/1), using only
// ordinary steps. Reads the cell's own path-position (VA) first purely as a
// visited/unvisited flag -- its OFF-ness picks which degree the rest of the
// scan must match, exactly as the position counters already define.
function plainCellNFA(incident) {
  const sig = 'plain|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, v) => {
      if (s.k === 0) return { k: 1, visited: v !== OFF, in: 0, out: 0 };
      if (s.k - 1 >= incident.length) return undefined;
      const step = incident[s.k - 1];
      let { in: nIn, out: nOut } = s;
      if (v === step.in) nIn++;
      else if (v === step.out) nOut++;
      else if (v !== UNUSED) return undefined;
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
// own teleport-step value, read first; its ordinary steps must then match that
// role exactly (never both an ordinary and a teleport edge on the same side --
// entering a teleport is mandatory, not optional).
function teleCellNFA(incident, sideIsFirst) {
  const sig = 'tele|' + sideIsFirst + '|' + incidentSig(incident);
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: -1 },
    transition: (s, v) => {
      if (s.k === -1) {
        if (v === UNUSED) return { k: 0, in: 0, out: 0, wantIn: 0, wantOut: 0 };
        if (v !== FWD && v !== BWD) return undefined;
        const isEntry = (v === FWD) === sideIsFirst;
        return { k: 0, in: 0, out: 0, wantIn: isEntry ? 1 : 0, wantOut: isEntry ? 0 : 1 };
      }
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (v === step.in) nIn++;
      else if (v === step.out) nOut++;
      else if (v !== UNUSED) return undefined;
      if (nIn > s.wantIn || nOut > s.wantOut) return undefined;
      return { ...s, k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === s.wantIn && s.out === s.wantOut,
  }, NV));
}

// A cell with only one ordinary neighbour (a maze dead end) needs at most two
// cells of context, which is a Pair relation -- or, for a fixed-role cell, a
// bare Given. These wrap the same in/out matching the NFA versions use.
const matchKind = (v, step) => v === step.in ? 'in' : v === step.out ? 'out' : v === UNUSED ? 'none' : null;

function fixedCellConstraint(incident, wantIn, wantOut) {
  const cells = incident.map(s => s.id);
  if (cells.length === 1) {
    // Finkz's own cell is walled in on every side but one, so her first move is
    // that one step, taken outwards.
    const [s0] = incident;
    return new Given(s0.id, wantOut === 1 ? s0.out : s0.in);
  }
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

// --- Path position (used both for subtour elimination below and as the
// visited/unvisited flag the path-shape machines read) -------------------
const MOD_A = 15, MOD_B = 11;
const OFF = 1, FIRST = 2;
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  if (cell === RAT) return fixedCellConstraint(incident, 0, 1);
  if (cell === CUPCAKE) return fixedCellConstraint(incident, 1, 0);
  const tele = teleAt.get(cell);
  if (tele) return teleCellConstraint(incident, tele.sideIsFirst, tele.id);
  return plainCellConstraint(cell, incident);
});

// The two counter layers are one fact told twice, so they must agree about
// which cells are on the path; and a teleport cell is on the path exactly when
// its teleport step is used (the machine above already gives it degree 0
// otherwise). Without these the counters would be free to invent values on
// cells the path never reaches.
const bothOffKey = cached('both-off', () => Pair.fnToKey((a, b) => (a === OFF) === (b === OFF), NV));
const teleOffKey = cached('tele-off', () => Pair.fnToKey((t, a) => (t === UNUSED) === (a === OFF), NV));
const offAgreement = [
  ...gridCells.map(cell => new Pair(bothOffKey, 'off-path-agreement', posA.at(cell), posB.at(cell))),
  ...[...teleAt].map(([cell, tele]) =>
    new Pair(teleOffKey, 'off-path-agreement', tele.id, posA.at(cell))),
];

// --- Subtour elimination: two coprime modular position counters -----------
// Numbering a genuine path 1, 2, 3, ... from Finkz's cell (teleport jumps count
// as ordinary moves) is always possible, so "the arriving cell's counter is the
// leaving cell's plus one" is implied by the rules. Any closed loop of steps
// then has a length divisible by both moduli, i.e. by 165 -- and there are only
// 81 cells, so no loop can survive.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) return { k: 1, dir: v };
    if (s.k === 1) return { k: 2, dir: s.dir, a: v };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || v === OFF) return undefined;
    if (s.dir === FWD) return v === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(v, mod) ? { done: true } : undefined;
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

// --- One-way doors, both halves ---------------------------------------------
// The value inequality holds of the two cells outright; the travel restriction
// removes the wrong-way direction from that border's step Var.
const smallerKey = cached('door-smaller', () => Pair.fnToKey((lo, hi) => lo < hi, NV));
const doors = DOORS.flatMap(({ from, to }) => {
  const step = stepByPair.get(`${from}|${to}`);
  const allowed = step.a === from ? FWD : BWD;
  return [
    new Pair(smallerKey, 'one-way-smaller', value.at(to), value.at(from)),
    new Given(step.id, UNUSED, allowed),
  ];
});

// --- TEST CONSTRAINT ---------------------------------------------------------
// Reads the step, then the two values it joins: a used ordinary step needs its
// two values at least 5 apart. Teleport steps carry no such Var, so the jumps
// are skipped, as the rule's parenthesis says.
const gapNFA = cached('test-gap', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) {
      if (v === UNUSED) return { k: 'skip', left: 2 };
      if (v !== FWD && v !== BWD) return undefined;
      return { k: 1 };
    }
    if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
    if (s.k === 1) return v <= 9 ? { k: 2, a: v } : undefined;
    if (s.k !== 2) return undefined;
    return (v <= 9 && Math.abs(s.a - v) >= 5) ? { k: 'done' } : undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const testGaps = steps.map(s =>
  new NFA(gapNFA, 'adjacent-gap', s.id, value.at(s.a), value.at(s.b)));

// --- Teleport digits ---------------------------------------------------------
const teleportDigits = [
  ...TELEPORTS.map(([a, b]) => new SameValues(2, a, b)),
  new AllDifferent(...TELEPORTS.map(([a]) => a)),
];

// --- Variables and domains --------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'maze steps', steps.length),
  teleStepVar,
  flag.toVar('mirror flags'),
  value.toVar('cell values'),
  mirrorDigits,
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  flag.makeReplicate(new Given(flag.cells()[0], PLAIN, MIRROR)),
  value.makeReplicate(new Given(value.cells()[0], ...range(1, 9))),
  ...mirrorDigits.cells().map(cell => new Given(cell, ...range(1, 9))),
  // Finkz's own cell is the first cell of the path, pinning both position
  // counters so the numbering can't float on unvisited cells or rotate.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  // Step Vars need no domain of their own: the path-cell machines above accept
  // no value on them but unused / in / out.
];

return [
  shape,
  ...layers,
  ...domains,
  ...valueLink,
  ...mirrorRules,
  ...pathShape,
  ...offAgreement,
  ...counters,
  ...noCross,
  ...doors,
  ...testGaps,
  ...teleportDigits,
];
