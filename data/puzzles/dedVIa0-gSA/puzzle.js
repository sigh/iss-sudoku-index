// Title: RAT RUN 20: Gifted
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dedVIa0-gSA
// Source: https://sudokupad.app/mpi5qhto7n

// Normal sudoku. Finkz stands on R1C2 and walks to the cupcake on R7C7. The walk
// visits no cell twice, never crosses itself, and (per the drawn geometry -- see
// below) is not blocked by any wall. A step is orthogonal, or diagonal across a
// free 2x2 area.
// Entering a teleport transports Finkz instantly to the matching-coloured
// teleport, from where the walk continues; matching teleports hold identical
// digits, and teleports that do not match hold different digits.
// A Christmas light beside a row or column means every digit Finkz visits in
// that row/column is odd (orange) or even (blue).
// A blackcurrant sits between two digits, one double the other.
// A gold bauble's number is the total of the cells it touches.
// Test constraint: two cells adjacent along the walk hold consecutive digits,
// except across a teleport jump, where -- per the teleport rule above -- they
// already hold identical digits.
//
// Dynamic fog is solving UI, not a rule, and is not encoded. The second rat
// and the explosion mark on R7C9 belong to the post-solve flavour text
// (metadata.msgcorrect), not to a live rule: they are not encoded either.
//
// Omitted: "pass through any thick walls." The rules describe walls, but no
// wall geometry is drawn anywhere in the source payload -- no wall polylines
// or corner spots appear in `lines`, `overlays`, or `underlays`, unlike every
// other Rat Run puzzle in this index (compare e.g. the slate `#6f789b`
// polylines of RAT RUN 35). The only grid-spanning line/overlay geometry here is generic
// template decoration (fog-cloud hairlines, box-border highlighting, a
// corner snow flourish, and a red tinsel garland drawn purely over the box
// grid near the cupcake) -- confirmed by finding the identical `#e4e4e4`
// hairlines and box-border lines, coordinate-for-coordinate, in RAT RUN 35's
// own payload. So this edition's maze has no walls: every king-move step
// between in-grid cells is legal.

// The alphabet is widened so the Var layers can carry the position counters;
// the 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside the walk would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell Finkz never visits
const FIRST = 2;                // counter value of the walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// Finkz walked a->b and BWD means b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;

const RAT_CELL = 'R1C2';        // the rat emoji
const CUPCAKE = 'R7C7';         // the cupcake emoji

// The five teleport pairs, read off the coloured tiles and their A-E labels.
const TELEPORTS = [
  ['R2C6', 'R8C9'],   // A, green
  ['R2C7', 'R6C9'],   // B, yellow
  ['R3C4', 'R9C6'],   // C, orange
  ['R4C7', 'R9C1'],   // D, red
  ['R5C5', 'R7C9'],   // E, purple
];
// The four solid black 0.32-size edge dots.
const BLACKCURRANTS = [
  ['R2C2', 'R2C3'], ['R9C2', 'R9C3'], ['R2C2', 'R3C2'], ['R8C4', 'R9C4'],
];
// The ten gold baubles, each an edge or corner mark with a total; the touched
// cells are the ones the mark sits against (two for an edge mark, four for a
// corner mark).
const BAUBLES = [
  { cells: ['R4C3', 'R4C4'], total: 12 },
  { cells: ['R4C4', 'R5C4'], total: 6 },
  { cells: ['R8C6', 'R8C7'], total: 14 },
  { cells: ['R8C7', 'R9C7'], total: 15 },
  { cells: ['R7C4', 'R7C5'], total: 16 },
  { cells: ['R7C2', 'R7C3'], total: 11 },
  { cells: ['R5C7', 'R6C7'], total: 13 },
  { cells: ['R1C7', 'R1C8'], total: 15 },
  { cells: ['R1C4', 'R1C5', 'R2C4', 'R2C5'], total: 21 },
  { cells: ['R6C2', 'R6C3'], total: 8 },
];
// The eight off-grid Christmas lights: gold/orange lights over columns 1 and 3
// and beside rows 2 and 4 want odd digits; sky-blue lights over columns 2 and 4
// and beside rows 1 and 3 want even digits. No light sits over/beside rows or
// columns 5-9.
const ROW_LIGHTS = { 1: 'even', 2: 'odd', 3: 'even', 4: 'odd' };
const COL_LIGHTS = { 1: 'odd', 2: 'even', 3: 'odd', 4: 'even' };

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B

// --- Step variables ---------------------------------------------------------
// One Var per king-move edge (no wall blocks any of them -- see the header
// note) plus one per teleport pair, joining its two tiles wherever they sit.
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
    if (other) addStep(cell, other);
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

// --- Walk shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell Finkz never visits takes the OFF counter in both layers and uses no
// step; any other cell is entered once and left once. The rat's own cell is only
// left, the cupcake only entered.
//
// A teleport tile is neither: "entering a teleport will cause Finkz to be
// instantly transported", so a visited tile can never be an ordinary pass-
// through cell reached and left entirely on foot -- one of its two used edges
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
      const next = {
        k: s.k + 1, vis: s.vis, in: s.in, out: s.out, spec: s.spec,
      };
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

// The two diagonals of a 2x2 area cross each other, and the walk may not cross
// itself; orthogonal steps meet only at cells they share, which no cell being
// used twice already forbids, and a teleport is instantaneous rather than a
// drawn line, so neither needs anything further.
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

// --- Teleports ----------------------------------------------------------------
// A visit to a teleport tile always spends its one arrival or its one departure
// on the link (walking onto it means transported at once; arriving by transport
// means leaving on foot next), so the link is used exactly when the tile is
// visited, which the OFF counter value reports. Neither tile is the rat or the
// cupcake, so no visited tile is missing an arrival or a departure.
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

// --- Test constraint: consecutive digits along an on-foot step ---------------
// Only foot steps need this: a used teleport step already forces identical
// digits via teleportDigits above, regardless of whether the step is used, so
// the "except ... identical" half of the rule needs no separate encoding.
const consecutiveKey = cached('consecutive-step', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value !== UNUSED };
    if (s.k === 1) return { k: 2, active: s.active, a: value };
    if (s.k !== 2) return undefined;
    if (!s.active) return { done: true };
    return Math.abs(value - s.a) === 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const consecutiveSteps = footSteps.map(s =>
  new NFA(consecutiveKey, 'consecutive-step', s.id, s.a, s.b));

// --- Christmas lights ----------------------------------------------------------
// A light's row/column only constrains digits Finkz actually visits; the OFF
// counter value reports that.
const lightKeyEven = cached('light-even', () => Pair.fnToKey(
  (pos, digit) => pos === OFF || digit % 2 === 0, NV));
const lightKeyOdd = cached('light-odd', () => Pair.fnToKey(
  (pos, digit) => pos === OFF || digit % 2 === 1, NV));
const lightKey = parity => parity === 'even' ? lightKeyEven : lightKeyOdd;
const christmasLights = [
  ...Object.entries(ROW_LIGHTS).flatMap(([n, parity]) => graph.row(Number(n)).map(
    cell => new Pair(lightKey(parity), 'christmas-light', posA.at(cell), cell))),
  ...Object.entries(COL_LIGHTS).flatMap(([n, parity]) => graph.column(Number(n)).map(
    cell => new Pair(lightKey(parity), 'christmas-light', posA.at(cell), cell))),
];

// --- Currants and baubles ------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const baubles = BAUBLES.map(({ cells, total }) => new Sum(total, ...cells));

// --- Variables and domains ------------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out.
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
  ...consecutiveSteps,
  ...christmasLights,
  ...blackcurrants,
  ...baubles,
];
