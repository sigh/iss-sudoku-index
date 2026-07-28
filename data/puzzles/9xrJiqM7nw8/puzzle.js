// Title: RAT RUN 18: Mirror Maze
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=9xrJiqM7nw8
// Source: https://sudokupad.app/hypzc2xwbi

// Normal sudoku. Finkz stands on R1C1 and walks to the cupcake on R1C9. The
// walk visits no cell twice, never crosses itself, and never passes through a
// thick maze wall. A step is orthogonal, or diagonal across a 2x2 area free of
// walls and carrying no round wall-spot on the corner the two cells share.
// Entering a teleport transports Finkz instantly to the matching-coloured
// teleport, from where the walk continues; matching teleports hold identical
// digits, and teleports that do not match hold different digits.
// Each row, column and box holds exactly one mirror cell, none of them a
// teleport tile, and every mirror cell holds a different digit. A cell's
// value is 10 minus its digit if it is a mirror cell, its digit otherwise.
// A purple arrow sits on an open passage between two cells; the walk may use
// that passage only in the drawn direction, and the value at the arrowhead
// end is always the smaller of the two values.
// Test constraint: two cells adjacent along the walk (not linked by a
// teleport jump) have values differing by at least 5.
//
// Nothing is omitted.

// The alphabet is widened so the Var layers can carry the position counters;
// the 81 grid cells, the mirror flag and the value layer are pinned back to
// their true ranges below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside the walk would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell Finkz never visits
const FIRST = 2;                // counter value of the walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD
// means Finkz walked a->b and BWD means b->a, so the counters can tell
// direction.
const UNUSED = 1, FWD = 2, BWD = 3;

const RAT_CELL = 'R1C1';        // the rat emoji
const CUPCAKE = 'R1C9';         // the cupcake emoji

// The maze walls: forestgreen (#15a028) polylines, thickness 12.16, on the
// corner lattice where corner (i, j) is the top-left corner of cell RiCj, so
// the lattice runs 1..10. The first entry also traces the grid boundary,
// which separates no two grid cells.
const WALLS = [
  [[3, 2], [1, 2], [1, 10], [10, 10], [10, 1], [1, 1], [1, 2]],
  [[1, 7], [3, 7]],
  [[4, 10], [4, 9]],
  [[10, 4], [8, 4]],
  [[4, 8], [4, 4]],
  [[4, 5], [3, 5]],
  [[2, 3], [4, 3], [4, 2], [6, 2], [6, 3], [7, 3]],
  [[8, 3], [9, 3], [9, 2]],
  [[7, 2], [8, 2]],
  [[7, 4], [7, 5]],
  [[2, 4], [3, 4]],
  [[2, 5], [2, 6], [3, 6]],
  [[2, 8], [2, 9], [3, 9]],
  [[6, 6], [7, 6]],
  [[7, 7], [8, 7]],
  [[5, 7], [6, 7]],
];
// The 37 round forestgreen wall-spots, each on a lattice corner (same
// convention and colour as the walls above).
const SPOTS = [
  [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [2, 9], [3, 2], [3, 4], [3, 5],
  [3, 6], [3, 7], [3, 9], [4, 2], [4, 3], [4, 4], [4, 8], [4, 9], [5, 3],
  [5, 4], [5, 5], [5, 7], [6, 2], [6, 3], [6, 6], [6, 7], [7, 2], [7, 3],
  [7, 4], [7, 5], [7, 6], [7, 7], [8, 2], [8, 3], [8, 4], [8, 7], [9, 2],
  [9, 3],
];
// The three teleport pairs, read off the coloured target-shaped underlays and
// their A/B/C labels.
const TELEPORTS = [
  ['R5C3', 'R3C8'],   // A, yellow
  ['R6C4', 'R4C8'],   // B, purple
  ['R6C6', 'R9C5'],   // C, green
];
// The six purple (#730dc5) one-way-door arrows, each a chevron drawn on an
// open orthogonal passage; `from` is the base of the chevron (the larger
// value), `to` the point it aims at (the smaller value, and the only
// direction the walk may cross it).
const ARROWS = [
  ['R1C2', 'R1C3'],
  ['R2C4', 'R1C4'],
  ['R2C3', 'R3C3'],
  ['R5C3', 'R4C3'],
  ['R6C3', 'R5C3'],
  ['R7C3', 'R7C2'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // walk position mod MOD_A
const posB = graph.makeOverlay('VB');   // walk position mod MOD_B
const mirr = graph.makeOverlay('VM');   // 1 = ordinary cell, 2 = mirror cell
const val = graph.makeOverlay('VL');    // the cell's value (mirrored or not)

// --- The maze ---------------------------------------------------------------
// Split the wall polylines into unit lattice segments: 'H|i|j' runs from
// corner (i, j) to (i, j+1) and separates R(i-1)Cj from RiCj; 'V|i|j' runs
// from (i, j) to (i+1, j) and separates RiC(j-1) from RiCj.
const wallSegments = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [i0, j0] = line[n - 1], [i1, j1] = line[n];
    if (i0 === i1) {
      for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) {
        wallSegments.add(`H|${i0}|${j}`);
      }
    } else {
      for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) {
        wallSegments.add(`V|${i}|${j0}`);
      }
    }
  }
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));

// A diagonal step passes through the one corner its two cells share. It needs
// a 2x2 space, whose only internal edges are the four wall slots meeting at
// that corner, and it may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step out of `cell` a legal move?
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// --- Step variables -----------------------------------------------------------
// One Var per move the maze leaves open, recording whether the walk uses it
// and in which direction; a walled or spotted move gets no variable at all.
// Each teleport pair adds one more such move, joining its two tiles wherever
// they sit.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const addStep = (a, b) => {
  const step = { id: 'VS' + (steps.length + 1), a, b };
  steps.push(step);
  stepsAt.get(a).push({ id: step.id, out: FWD, in: BWD });
  stepsAt.get(b).push({ id: step.id, out: BWD, in: FWD });
  return step;
};
for (const cell of gridCells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    addStep(cell, other);
  }
}
const footSteps = steps.slice();                       // the on-foot moves
const teleportSteps = TELEPORTS.map(([a, b]) => addStep(a, b));
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape ---------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell Finkz never visits takes the OFF counter in both layers and
// uses no step; any other cell is entered once and left once. The rat's own
// cell is only left, the cupcake only entered.
//
// A teleport tile is neither: "entering a teleport will cause Finkz to be
// instantly transported", so a visited tile's one arrival or one departure
// must be the tile's own teleport link (`specialIndex`, always the last entry
// of `incident` since teleport steps are appended after every foot step).
const ROLE_OF = new Map([[RAT_CELL, 'rat'], [CUPCAKE, 'cupcake'],
...TELEPORTS.flat().map(cell => [cell, 'teleport'])]);
function cellNFA(incident, role, specialIndex) {
  const sig = 'cell|' + role + '|' + specialIndex + '|' +
    incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0, spec: false };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in: s.in, out: s.out, spec: s.spec };
      if (value === step.in) { next.in++; if (n === specialIndex) next.spec = true; }
      else if (value === step.out) { next.out++; if (n === specialIndex) next.spec = true; }
      else if (value !== UNUSED) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      if (role === 'teleport') {
        return s.vis ? (s.in === 1 && s.out === 1 && s.spec) : (s.in === 0 && s.out === 0);
      }
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const walkShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  const specialIndex = role === 'teleport' ? incident.length - 1 : -1;
  return new NFA(cellNFA(incident, role, specialIndex), 'walk-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" rejects no genuine walk; what it buys is that a closed cycle of steps
// beside the walk would need a length divisible by MOD_A and by MOD_B. The
// degree rules above admit such a cycle and nothing else rules it out.
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
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'walk-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'walk-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 area cross each other, and the walk may not
// cross itself. Orthogonal steps meet only at cells they share, which no cell
// being used twice already forbids, and a teleport is instantaneous rather
// than a drawn line, so neither needs anything further.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepBetween(cell, diag);
  const d2 = stepBetween(right, down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1.id, d2.id)] : [];
});

// --- Teleports ------------------------------------------------------------
// A visit to a teleport tile always spends its one arrival or its one
// departure on the link (walking onto it means transported at once; arriving
// by transport means leaving on foot next), so the link is used exactly when
// the tile is visited, which the OFF counter value reports.
const teleportLinkKey = Pair.fnToKey(
  (position, step) => (position === OFF) === (step === UNUSED), NV);
const teleportLinks = teleportSteps.flatMap(s => [
  new Pair(teleportLinkKey, 'teleport-link', posA.at(s.a), s.id),
  new Pair(teleportLinkKey, 'teleport-link', posA.at(s.b), s.id),
]);
const teleportDigits = [
  ...TELEPORTS.map(([a, b]) => new SameValues(2, a, b)),
  // Each pair already shares a digit, so one tile per pair carries "teleports
  // that don't match always have different digits".
  new AllDifferent(...TELEPORTS.map(([a]) => a)),
];

// --- Mirror cells ---------------------------------------------------------
// One mirror cell per row, column and box: ContainExact(2, ...) over every
// house says the mirror flag hits exactly once. No drawn mark says which
// cell -- the flag is free, discovered like any other digit.
const mirrorHouses = graph.rowsColumnsBoxes().map(
  house => new ContainExact(String(2), ...mirr.at(house)));
// Mirror cells may not hold a teleport.
const mirrorNotTeleport = TELEPORTS.flat().map(cell => new Given(mirr.at(cell), 1));
// VD<n> is row n's mirror digit; with exactly one mirror cell in the row (via
// mirrorHouses above) it is forced to that cell's digit and nothing else, so
// "every mirror cell holds a different digit" is one AllDifferent over the
// nine rows.
const mirrorDigit = n => 'VD' + n;
const mirrorDigitKey = cached('mirror-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === 2 };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const mirrorDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(mirrorDigitKey, 'mirror-digit',
    mirr.at(cell), cell, mirrorDigit(n + 1))));

// A cell's value is 10 minus its digit when it is a mirror cell, its digit
// otherwise.
const valueKey = cached('cell-value', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, mirror: value === 2 };
    if (s.k === 1) return { k: 2, want: s.mirror ? 10 - value : value };
    if (s.k !== 2) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const cellValues = gridCells.map(cell =>
  new NFA(valueKey, 'cell-value', mirr.at(cell), cell, val.at(cell)));

// --- One-way doors ---------------------------------------------------------
// "An arrow always points to the smaller of the two values it sits between":
// a value fact that holds unconditionally, independent of the walk.
const arrowOrderKey = cached('arrow-order', () => Pair.fnToKey((from, to) => from > to, NV));
const arrowOrders = ARROWS.map(([from, to]) =>
  new Pair(arrowOrderKey, 'one-way-door-order', val.at(from), val.at(to)));
// The walk may cross the passage only base->head, so the step's direction
// value opposite that reading is dropped from its domain.
const arrowDirections = ARROWS.map(([from, to]) => {
  const step = stepBetween(from, to);
  const allowedDir = step.a === from ? FWD : BWD;
  return new Given(step.id, UNUSED, allowedDir);
});

// --- Test constraint --------------------------------------------------------
// Two cells adjacent along the walk (only an on-foot step -- a teleport jump
// is excluded by the rule, and is anyway already forced to equal values by
// teleportDigits/cellValues above) must have values differing by at least 5.
const valueDiffKey = cached('value-diff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value !== UNUSED };
    if (s.k === 1) return { k: 2, active: s.active, a: value };
    if (s.k !== 2) return undefined;
    if (!s.active) return { done: true };
    return Math.abs(value - s.a) >= 5 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const valueDifferences = footSteps.map(s =>
  new NFA(valueDiffKey, 'path-value-difference', s.id, val.at(s.a), val.at(s.b)));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  mirr.toVar('mirror cells'),
  val.toVar('cell value'),
  new Var('S', 'walk steps', steps.length),
  new Var('D', 'mirror digit by row', 9),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  mirr.makeReplicate(new Given(mirr.at(gridCells[0]), 1, 2)),
  val.makeReplicate(new Given(val.at(gridCells[0]), ...range(1, 9))),
  ...range(1, 9).map(n => new Given(mirrorDigit(n), ...range(1, 9))),
  // The step Vars need no domain of their own beyond the arrow restrictions
  // above: the walk-cell machines accept no value on them but unused/in/out.
  // The rat's own cell is the first cell of the walk; without this the whole
  // numbering of the walk could rotate freely through the residues.
  new Given(posA.at(RAT_CELL), FIRST), new Given(posB.at(RAT_CELL), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...teleportLinks,
  ...teleportDigits,
  ...mirrorHouses,
  ...mirrorNotTeleport,
  ...mirrorDigits,
  ...cellValues,
  ...arrowOrders,
  ...arrowDirections,
  ...valueDifferences,
];
