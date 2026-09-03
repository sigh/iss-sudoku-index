// Title: RAT RUN 6: Equilibrium
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=u7yVQQC3QeI
// Source: https://sudokupad.app/3xa2x14bxe

// Normal sudoku. Finkz the rat starts on R7C8 and must reach the cupcake on
// R5C8 along a path that visits no cell more than once, never crosses itself,
// and never passes through a thick maze wall. A step is orthogonal, or
// diagonal when there is a 2x2 space to move through -- no wall on any of the
// four unit edges meeting at the corner the two cells share -- and no round
// wall-spot sits on that corner.
//
// TELEPORTS: the two yellow cells R1C1 and R9C9. Entering one carries Finkz
// instantly to the other, so a teleport cell is either unvisited or used as
// one extra step in place of an ordinary move. The two hold the same digit.
//
// ONE-WAY DOORS: six purple arrows, each on an edge between two cells. Finkz
// may pass directly through an arrow only when moving in the direction it
// points, and an arrow always points to the smaller of the two digits it sits
// between.
//
// BLACKCURRANTS: the seven drawn edge discs join cells in a 1:2 ratio. "Not
// all possible blackcurrants have been given", so no other pair is
// constrained.
//
// TEST CONSTRAINT: the digits on the path before teleporting sum to the same
// total as the digits on the path after teleporting.
//
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var overlays can carry step codes, the
// path-position counters and the segment bookkeeping below; the 81 grid cells
// are pinned back to 1-9.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const RAT = 'R7C8';      // the drawn rat emoji
const CUPCAKE = 'R5C8';  // the drawn cupcake emoji

// --- The drawn maze --------------------------------------------------------
// WALLS is the eighteen darkolivegreen thickness-12 polylines, transcribed as
// drawn: SudokuPad's [row, col], 0-indexed, integer = a lattice corner, so
// corner (i, j) is the intersection just above-left of 0-indexed cell (i, j).
// The grid boundary is part of the same strokes and is kept as drawn.
const WALLS = [
  [[8, 6], [6, 6], [6, 8], [7, 8], [7, 7], [9, 7], [9, 9], [0, 9], [0, 1], [1, 1]],
  [[6, 6], [6, 3], [8, 3]],
  [[9, 7], [9, 0], [3, 0], [3, 1]],
  [[3, 9], [3, 6], [5, 6]],
  [[0, 1], [0, 0], [3, 0]],
  [[6, 5], [5, 5]],
  [[9, 5], [8, 5]],
  [[3, 2], [3, 3], [1, 3]],
  [[3, 5], [3, 4], [5, 4]],
  [[6, 1], [6, 3], [5, 3]],
  [[5, 7], [5, 8]],
  [[1, 8], [2, 8]],
  [[1, 2], [2, 2]],
  [[4, 1], [4, 2]],
  [[1, 4], [1, 5]],
  [[7, 4], [7, 5]],
  [[1, 6], [1, 7]],
  [[2, 6], [2, 7]],
];
// SPOTS is the forty darkolivegreen 0.32 discs, each centred on a lattice
// corner, in the same 0-indexed [row, col] coordinates.
const SPOTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
  [2, 2], [2, 6], [2, 7], [2, 8],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [4, 1], [4, 2], [4, 7], [4, 8],
  [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8],
  [6, 1], [6, 8],
  [7, 4], [7, 5], [7, 7], [7, 8],
  [8, 2], [8, 3], [8, 5], [8, 6],
];
// The six purple chevrons, written [from, to]: `to` is the cell the chevron's
// apex points into, so `to` holds the smaller digit and is the only direction
// in which Finkz may cross that edge.
const ONE_WAY = [
  ['R3C2', 'R4C2'], ['R3C4', 'R4C4'], ['R6C6', 'R5C6'],
  ['R1C9', 'R1C8'], ['R1C6', 'R1C7'], ['R7C5', 'R7C4'],
];
// The seven black 0.26 edge discs.
const BLACKCURRANTS = [
  ['R4C9', 'R5C9'], ['R5C3', 'R6C3'], ['R5C5', 'R6C5'], ['R6C9', 'R7C9'],
  ['R7C1', 'R7C2'], ['R8C4', 'R9C4'], ['R8C5', 'R8C6'],
];
// The one yellow teleport pair.
const TELEPORT = ['R1C1', 'R9C9'];

// Split the polylines into unit lattice segments. wallH.has('i|j') means a
// wall spans corner row i from column j to j+1; wallV.has('i|j') means a wall
// spans corner column j from row i to i+1.
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
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));

// An orthogonal step is blocked by a wall on the shared edge of its two cells.
const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
// A diagonal step cuts across the 2x2 block meeting at one lattice corner. It
// needs that block to be a clear space -- the block's only internal edges are
// the four unit segments meeting at the corner -- and no wall-spot there.
const cornerBlocked = (i, j) => spotSet.has(`${i}|${j}`) ||
  wallV.has(`${i - 1}|${j}`) || wallV.has(`${i}|${j}`) ||
  wallH.has(`${i}|${j - 1}`) || wallH.has(`${i}|${j}`);

// --- Maze step variables ----------------------------------------------------
// One Var per legal move; a move the maze forbids gets no variable at all. A
// step records whether it is unused and, if used, its direction of travel:
// FWD means the step's `a` end was left for its `b` end, BWD the reverse.
const UNUSED = 1, FWD = 2, BWD = 3;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]; // each undirected edge once
const oneWayDir = new Map();
for (const [from, to] of ONE_WAY) {
  oneWayDir.set(`${from}|${to}`, FWD);
  oneWayDir.set(`${to}|${from}`, BWD);
}
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
      // A one-way door leaves the edge crossable in one direction only, so the
      // step keeps its Var but loses the other direction from its domain.
      const step = { id, a, b, allowed: oneWayDir.get(`${a}|${b}`) || null };
      steps.push(step);
      stepByOrigin.set(`${r},${c},${dr},${dc}`, step);
      stepsAt.get(a).push({ id, in: BWD, out: FWD });
      stepsAt.get(b).push({ id, in: FWD, out: BWD });
    }
  }
}

// --- Path position, which doubles as the visited/unvisited flag ------------
const MOD_A = 15, MOD_B = 11;
const OFF = 1, FIRST = 2;
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The single teleport pair is one more edge of the same kind, with its own Var.
const TELE_ID = 'VT';  // a single-cell Var group is addressed by its bare prefix
const teleEdge = { id: TELE_ID, a: TELEPORT[0], b: TELEPORT[1] };

// --- Per-cell path-shape machines ------------------------------------------
// Every machine reads its cell's incident step values and counts how many say
// "arriving" (step.in) versus "leaving" (step.out) at this cell.
const incidentSig = incident => incident.map(s => s.in + '/' + s.out).join(',');
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
// Finkz's cell (0 in, 1 out) and the cupcake (1 in, 0 out) are always on the
// path, so their degree is unconditional.
function fixedCellConstraint(incident, wantIn, wantOut) {
  if (incident.length === 1) {
    // With one neighbour the whole machine collapses to the single value that
    // gives the wanted degree.
    const s = incident[0];
    const allowed = [UNUSED, s.in, s.out].filter(v => {
      const nIn = v === s.in ? 1 : 0, nOut = v === s.out ? 1 : 0;
      return nIn === wantIn && nOut === wantOut;
    });
    return new Given(s.id, ...allowed);
  }
  const key = cached(`fixed|${wantIn}|${wantOut}|${incidentSig(incident)}`,
    () => NFA.encodeSpec(scanDegree(incident, wantIn, wantOut), NV));
  return new NFA(key, 'path-cell', ...incident.map(s => s.id));
}
// A plain cell is off the path (0 in, 0 out) or an interior path cell (1/1).
// Its position counter is read first purely as the visited flag.
function plainCellConstraint(cell, incident) {
  const cells = [posA.at(cell), ...incident.map(s => s.id)];
  if (cells.length === 2) {
    // One neighbour can never supply both an arriving and a leaving edge, so
    // the only satisfiable case is unvisited with that step unused.
    const key = cached('plain2', () => Pair.fnToKey((va, v) => va === OFF && v === UNUSED, NV));
    return new Pair(key, 'path-cell', ...cells);
  }
  const key = cached('plain|' + incidentSig(incident), () => NFA.encodeSpec({
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
  return new NFA(key, 'path-cell', ...cells);
}
// A teleport cell's role is fixed entirely by the teleport Var, read first:
// unused means the cell is off the path, and a used jump makes this side
// either the entry (one ordinary arriving edge, no leaving edge) or the exit
// (no arriving edge, one ordinary leaving edge). There is no case where an
// ordinary edge and the teleport edge leave on the same side, which is what
// makes entering a teleport compulsory rather than optional.
function teleCellConstraint(incident, sideIsFirst) {
  const cells = [TELE_ID, ...incident.map(s => s.id)];
  const wanted = t => {
    if (t === UNUSED) return { wantIn: 0, wantOut: 0 };
    if (t !== FWD && t !== BWD) return null;
    const isEntry = (t === FWD) === sideIsFirst;
    return { wantIn: isEntry ? 1 : 0, wantOut: isEntry ? 0 : 1 };
  };
  if (cells.length === 2) {
    const s0 = incident[0];
    const key = cached('tele2|' + sideIsFirst + '|' + incidentSig(incident),
      () => Pair.fnToKey((t, v) => {
        const w = wanted(t);
        if (!w) return false;
        const nIn = v === s0.in ? 1 : 0, nOut = v === s0.out ? 1 : 0;
        if (v !== UNUSED && v !== s0.in && v !== s0.out) return false;
        return nIn === w.wantIn && nOut === w.wantOut;
      }, NV));
    return new Pair(key, 'path-cell', ...cells);
  }
  const key = cached('tele|' + sideIsFirst + '|' + incidentSig(incident), () => NFA.encodeSpec({
    startState: { k: -1 },
    transition: (s, value) => {
      if (s.k === -1) {
        const w = wanted(value);
        return w ? { k: 0, in: 0, out: 0, ...w } : undefined;
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
  return new NFA(key, 'path-cell', ...cells);
}
const teleSide = new Map([[TELEPORT[0], true], [TELEPORT[1], false]]);
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  if (cell === RAT) return fixedCellConstraint(incident, 0, 1);
  if (cell === CUPCAKE) return fixedCellConstraint(incident, 1, 0);
  if (teleSide.has(cell)) return teleCellConstraint(incident, teleSide.get(cell));
  return plainCellConstraint(cell, incident);
});

// --- Subtour elimination: two coprime modular position counters -----------
// Numbering a genuine path 1, 2, 3, ... from Finkz's cell (a teleport jump
// counts as one move) is always possible, so "the arriving cell's counter is
// the leaving cell's plus one" adds nothing to the rules. What it buys is that
// a closed loop of steps sitting beside the path would need a length divisible
// by both moduli, i.e. by lcm(15, 11) = 165, and there are only 81 cells.
// In/out degree alone cannot rule such a loop out.
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
const allEdges = [...steps, teleEdge];
const counters = allEdges.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, so at most one is used.
const noCrossKey = cached('no-cross', () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV));
const noCross = [];
for (let r = 0; r <= 7; r++) {
  for (let c = 0; c <= 7; c++) {
    const d1 = stepByOrigin.get(`${r},${c},1,1`);
    const d2 = stepByOrigin.get(`${r},${c + 1},1,-1`);
    if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}

// --- Which side of the teleport a cell is walked on ------------------------
// VG marks each cell as off the path (OFF), walked before teleporting (SEG1)
// or walked after teleporting (SEG2). An ordinary step keeps the mark; the
// teleport jump advances it by one. SEG2 is the largest value in the domain,
// so a second jump has nowhere to advance to -- with one drawn pair there is
// at most one jump anyway.
const SEG1 = 2, SEG2 = 3;
const segid = graph.makeOverlay('VG');
const segStepNFA = delta => cached('seg-step|' + delta, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === s.a + delta ? { done: true } : undefined;
    return s.a === value + delta ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const segPropagate = [
  ...steps.map(s => new NFA(segStepNFA(0), 'segment-side', s.id, segid.at(s.a), segid.at(s.b))),
  new NFA(segStepNFA(1), 'teleport-side', TELE_ID, segid.at(teleEdge.a), segid.at(teleEdge.b)),
];
// The three per-cell layers are OFF together or not at all. Only VA is read by
// the path-shape machines, so without this tie an unvisited cell could take a
// free counter residue, or claim a side and have its digit counted in the sums
// below.
const offGateKey = cached('off-gate', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k > 2) return undefined;
    return (value === OFF) === s.off ? { k: s.k + 1, off: s.off } : undefined;
  },
  accept: s => s.k === 3,
}, NV));
const offGates = gridCells.map(cell => new NFA(offGateKey, 'path-off-gate',
  posA.at(cell), posB.at(cell), segid.at(cell)));

// --- The test constraint ---------------------------------------------------
// VP holds digit + 1 for a cell walked before the teleport and 1 everywhere
// else; VQ does the same for cells walked after it. Both layers cover all 81
// cells, so each layer's total is its side's digit sum plus 81 and EqualSum
// says exactly that the two sides' digit sums agree. The offset is needed
// because a Var value cannot be 0.
// Whether the two teleport cells themselves count is moot: the entry lands in
// VP and the exit in VQ, and the rules make their digits equal.
const contrib = cached('contrib', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value <= SEG2 ? { k: 1, side: value } : undefined;
    if (s.k === 1) return value <= 9 ? { k: 2, side: s.side, digit: value } : undefined;
    if (s.k === 2) return value === (s.side === SEG1 ? s.digit + 1 : 1)
      ? { k: 3, side: s.side, digit: s.digit } : undefined;
    if (s.k !== 3) return undefined;
    return value === (s.side === SEG2 ? s.digit + 1 : 1) ? { k: 'done' } : undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const preSum = graph.makeOverlay('VP');
const postSum = graph.makeOverlay('VQ');
const contributions = gridCells.map(cell => new NFA(contrib, 'walk-contribution',
  segid.at(cell), cell, preSum.at(cell), postSum.at(cell)));
const equilibrium = new EqualSum(preSum.cells(), postSum.cells());

// --- Digit clues -----------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b));
const teleportDigits = new SameValues(2, ...TELEPORT);
// GreaterThan(x, y) puts the larger digit first, so the arrow's apex cell --
// the one it points at -- goes second.
const oneWayDigits = ONE_WAY.map(([from, to]) => new GreaterThan(from, to));

// --- Variables and domains --------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  segid.toVar('side of the teleport'),
  preSum.toVar('digit walked before teleporting'),
  postSum.toVar('digit walked after teleporting'),
  new Var('S', 'maze steps', steps.length),
  new Var('T', 'teleport step', 1),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain: the sentinel plus MOD_A residues is the whole alphabet.
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  segid.makeReplicate(new Given(segid.cells()[0], ...range(1, SEG2))),
  preSum.makeReplicate(new Given(preSum.cells()[0], ...range(1, 10))),
  postSum.makeReplicate(new Given(postSum.cells()[0], ...range(1, 10))),
  // Finkz's cell is the first cell of the path and of the first side, which
  // pins the counters so the numbering cannot float or rotate.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  new Given(segid.at(RAT), SEG1),
  // The cupcake is walked after teleporting: with nothing after the jump the
  // second sum would be 0 while the first is at least one digit, so the test
  // constraint cannot be met without a teleport.
  new Given(segid.at(CUPCAKE), SEG2),
  // A one-way door's edge may only be crossed towards the arrow's apex.
  ...steps.filter(s => s.allowed).map(s => new Given(s.id, UNUSED, s.allowed)),
  // The other step Vars need no domain: the path-cell machines accept nothing
  // on them but unused / arriving / leaving.
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...segPropagate,
  ...offGates,
  ...contributions,
  equilibrium,
  ...blackcurrants,
  teleportDigits,
  ...oneWayDigits,
];
