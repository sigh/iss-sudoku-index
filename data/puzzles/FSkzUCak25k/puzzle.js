// Title: The Hare and the Tortoise
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=FSkzUCak25k
// Source: https://sudokupad.app/qes8ggvsi4

// Normal sudoku. The Hare (R7C7) and the Tortoise (R3C7) each draw a racing
// line of orthogonal or diagonal steps between cell centres, both ending on the
// chequered flag (R5C2). Neither line may enter a pond, and the two lines may
// not share a cell or intersect each other or themselves, except at the flag
// where both end. The Hare's line enters every 3x3 box exactly once, box 9
// included (starting there does not count as entering it). The Hare's line is a
// Fast Thermo -- digits rise by at least 3 from cell to cell -- but the Hare
// naps at every box border, so the thermo restarts on any digit in the first
// cell of the next box. The Tortoise's line is a Slow Thermo: its digits never
// decrease. The Fox (R2C9) displays a digit that does not appear on the
// winner's racing line. The two digits the Duck separates, R4C1 and R4C2, sum
// to 5.
//
// Nothing is omitted. One reading is left open by the rules and is encoded as
// the weaker of the two candidates: see the Fox section.

// The alphabet is widened to 11 so the Var layers can carry route state; the 81
// grid cells are pinned back to 1-9 below.
const NV = 11;
const OFF = 1;                       // "this cell is not on that line"
const UNUSED = 1, FWD = 2, BWD = 3;  // step values: unused, a->b, b->a
const FIRST_RUN = 2;                 // Hare run index 1, stored offset by OFF
const MOD_A = 9, MOD_B = 10;         // Tortoise position-counter moduli
const START_POS = 2;                 // Tortoise counter value of its first cell

// --- The drawn board ------------------------------------------------------
// Ponds are the pale blue (#9ce7ff) rounded blobs; five of them, one three
// cells long. The four emoji overlays give the two starts, the flag and the
// Fox; the Duck sits on the border inside the R4C1-R4C2 pond.
const PONDS = [
  ['R2C6', 'R2C7'],
  ['R4C1', 'R4C2'],
  ['R4C8', 'R4C9'],
  ['R8C3', 'R8C4'],
  ['R5C3', 'R6C3', 'R6C2'],
];
const HARE_START = 'R7C7';
const TORTOISE_START = 'R3C7';
const FLAG = 'R5C2';
const FOX = 'R2C9';
const DUCK = ['R4C1', 'R4C2'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const pondCells = new Set(PONDS.flat());
const openCells = gridCells.filter(cell => !pondCells.has(cell));

const hareRun = graph.makeOverlay('VR');   // Hare: which box-run a cell is in
const posA = graph.makeOverlay('VA');      // Tortoise: position mod MOD_A
const posB = graph.makeOverlay('VB');      // Tortoise: position mod MOD_B

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return (Math.ceil(row / 3) - 1) * 3 + Math.ceil(col / 3);
};

// --- Step variables -------------------------------------------------------
// One Var per king-move adjacency between two pond-free cells, per racer:
// unused, or used in one of the two directions. Direction is what the thermos
// and the position counters read. Adjacencies touching a pond are simply never
// created, which is how "avoid all the blue ponds" is enforced for the steps.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
for (const cell of openCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other || pondCells.has(other)) continue;
    const n = steps.length + 1;
    steps.push({ hare: 'VH' + n, tort: 'VT' + n, a: cell, b: other });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

// Steps incident to a cell, tagged with the value that means "leaves this cell"
// and the value that means "enters this cell".
const incident = new Map(openCells.map(cell => [cell, []]));
for (const s of steps) {
  incident.get(s.a).push({ step: s, out: FWD, in: BWD });
  incident.get(s.b).push({ step: s, out: BWD, in: FWD });
}

const specCache = new Map();
const cached = (key, build) => {
  if (!specCache.has(key)) specCache.set(key, build());
  return specCache.get(key);
};

// --- Route shape ----------------------------------------------------------
// Per-cell degree machine: reads the cell's membership layer(s), then every
// step it is an endpoint of. A cell off the line uses no step; a cell on it is
// entered once and left once; the racer's own start is left but never entered,
// and the flag is entered but never left.
function cellNFA(incidents, role, memberships) {
  const sig = 'deg|' + role + '|' + memberships + '|' +
    incidents.map(i => i.in + '/' + i.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k < memberships) {
        // The membership layers must agree with each other, and with the role.
        const on = value !== OFF;
        if (role !== 'plain' && !on) return undefined;
        if (s.k > 0 && on !== s.vis) return undefined;
        return { k: s.k + 1, vis: on };
      }
      const idx = s.k - memberships;
      if (idx >= incidents.length) return undefined;
      const inc = incidents[idx];
      let nIn = s.in || 0, nOut = s.out || 0;
      if (value === inc.in) nIn++;
      else if (value === inc.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== memberships + incidents.length) return false;
      const nIn = s.in || 0, nOut = s.out || 0;
      if (role === 'start') return nIn === 0 && nOut === 1;
      if (role === 'end') return nIn === 1 && nOut === 0;
      return s.vis ? (nIn === 1 && nOut === 1) : (nIn === 0 && nOut === 0);
    },
  }, NV));
}

const roleOf = (cell, start) =>
  cell === start ? 'start' : cell === FLAG ? 'end' : 'plain';

const hareShape = openCells.map(cell => new NFA(
  cellNFA(incident.get(cell), roleOf(cell, HARE_START), 1),
  'hare-cell', hareRun.at(cell),
  ...incident.get(cell).map(i => i.step.hare)));
const tortoiseShape = openCells.map(cell => new NFA(
  cellNFA(incident.get(cell), roleOf(cell, TORTOISE_START), 2),
  'tortoise-cell', posA.at(cell), posB.at(cell),
  ...incident.get(cell).map(i => i.step.tort)));

// --- Hare: box runs -------------------------------------------------------
// The Hare's line is cut into runs by the box borders it crosses. Every cell
// carries the index of the run it lies in: unchanged along a step inside one
// box, one higher along a step that crosses a border. The start cell is pinned
// to run 1, and since the line enters each of the nine boxes exactly once it
// crosses exactly nine borders, so run indices span 1..10 and fit the alphabet.
//
// This numbering is also what forbids a closed loop of Hare steps beside the
// line, which the degree machines alone would allow: a loop inside one box is
// already impossible because the Fast Thermo makes digits strictly rise along
// it, and a loop that crosses any border would have to come back to a run index
// it had already passed.
const runNFA = delta => cached('run' + delta, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value !== UNUSED && value !== FWD && value !== BWD) return undefined;
      return { k: 1, dir: value };
    }
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    const [from, to] = s.dir === FWD ? [s.a, value] : [value, s.a];
    return to === from + delta ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

const hareRuns = steps.map(s => new NFA(
  runNFA(boxOf(s.a) === boxOf(s.b) ? 0 : 1),
  'hare-run', s.hare, hareRun.at(s.a), hareRun.at(s.b)));

// Each box is entered exactly once: of the steps that cross that box's border,
// exactly one is used in the direction that goes into the box. The Hare's own
// starting cell is not reached by such a step, so starting in box 9 does not
// count as entering it, exactly as the rules say.
const boxEntries = graph.boxes().map((boxCells, n) => {
  const box = n + 1;
  const crossing = [];
  for (const s of steps) {
    if (boxOf(s.a) === boxOf(s.b)) continue;
    if (boxOf(s.b) === box) crossing.push({ id: s.hare, enter: FWD });
    else if (boxOf(s.a) === box) crossing.push({ id: s.hare, enter: BWD });
  }
  const enters = crossing.map(c => c.enter);
  const spec = cached('entries|' + enters.join(''), () => NFA.encodeSpec({
    startState: { k: 0, n: 0 },
    transition: (s, value) => {
      if (s.k >= enters.length) return undefined;
      const n = s.n + (value === enters[s.k] ? 1 : 0);
      if (n > 1) return undefined;
      return { k: s.k + 1, n };
    },
    accept: s => s.k === enters.length && s.n === 1,
  }, NV));
  return new NFA(spec, 'hare-box-entry', ...crossing.map(c => c.id));
});

// --- Tortoise: position counters ------------------------------------------
// The Tortoise's line carries no monotone quantity of its own, so its subtours
// are ruled out the standard way: number the cells along the line and require
// each step to advance the count by one, in two layers whose moduli are
// coprime. A closed loop of steps would have a length divisible by
// lcm(9, 10) = 90, and only 70 pond-free cells exist.
const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value !== UNUSED && value !== FWD && value !== BWD) return undefined;
      return { k: 1, dir: value };
    }
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

const tortoiseCounters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'tortoise-order', s.tort, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'tortoise-order', s.tort, posB.at(s.a), posB.at(s.b)),
]);

// --- Thermos --------------------------------------------------------------
// Digits along a used step, read in the direction of travel: the Hare's rise by
// at least 3, the Tortoise's never fall. The Hare's rule is applied only to
// steps that stay inside one box -- across a border he naps and the thermo
// restarts on any digit.
const thermoNFA = gap => cached('thermo' + gap, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value !== UNUSED && value !== FWD && value !== BWD) return undefined;
      return { k: 1, dir: value };
    }
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    const [from, to] = s.dir === FWD ? [s.a, value] : [value, s.a];
    return to >= from + gap ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

const fastThermo = steps
  .filter(s => boxOf(s.a) === boxOf(s.b))
  .map(s => new NFA(thermoNFA(3), 'fast-thermo', s.hare, s.a, s.b));
const slowThermo = steps
  .map(s => new NFA(thermoNFA(0), 'slow-thermo', s.tort, s.a, s.b));

// --- The two lines keep apart ---------------------------------------------
// No shared cells except the flag, where both lines end.
const shareKey = Pair.fnToKey((r, a) => r === OFF || a === OFF, NV);
const noSharing = openCells
  .filter(cell => cell !== FLAG)
  .map(cell => new Pair(shareKey, 'no-sharing', hareRun.at(cell), posA.at(cell)));

// No intersections: the two diagonals of a 2x2 block cross at the corner they
// share, so at most one of the four (racer, diagonal) combinations that would
// cross there may be used. Two racers using the same diagonal is already ruled
// out by no-sharing, so only the crossing pairs are listed.
const crossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCrossing = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const d1 = stepBetween(makeCellId(i - 1, j - 1), makeCellId(i, j));
    const d2 = stepBetween(makeCellId(i - 1, j), makeCellId(i, j - 1));
    if (!d1 || !d2) continue;
    for (const [x, y] of [[d1.hare, d2.hare], [d1.tort, d2.tort],
                          [d1.hare, d2.tort], [d1.tort, d2.hare]]) {
      noCrossing.push(new Pair(crossKey, 'no-crossing', x, y));
    }
  }
}

// --- The Fox --------------------------------------------------------------
// One of the two racers -- the winner -- has a line that the Fox's digit never
// appears on. The machine reads the Fox cell, then walks the board reading each
// cell's membership followed by its digit, and rejects as soon as a cell on the
// line repeats that digit. The rules say only that the winner's line misses the
// digit, and never that the loser's line carries it, so this is an `Or` of the
// two racers rather than an exclusive choice; the stronger reading is not
// stated and is left unencoded.
const missesFoxNFA = cached('fox', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, fox: value };
    if (s.k === 1) return { k: 2, fox: s.fox, on: value !== OFF };
    if (s.k !== 2) return undefined;
    if (s.on && value === s.fox) return undefined;
    return { k: 1, fox: s.fox };
  },
  accept: s => s.k === 1,
}, NV));
const missesFox = membership => new NFA(
  missesFoxNFA, 'fox-declares-winner', FOX,
  ...openCells.flatMap(cell => [membership.at(cell), cell]));
const fox = new Or([missesFox(hareRun), missesFox(posA)]);

// --- Domains and fixed cells ----------------------------------------------
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
];
// A pond cell is on neither line.
const ponds = [...pondCells].flatMap(cell => [
  new Given(hareRun.at(cell), OFF),
  new Given(posA.at(cell), OFF),
  new Given(posB.at(cell), OFF),
]);
// Each racer's own starting cell anchors its numbering, so neither the run
// indices nor the position counters can float or rotate.
const anchors = [
  new Given(hareRun.at(HARE_START), FIRST_RUN),
  new Given(posA.at(TORTOISE_START), START_POS),
  new Given(posB.at(TORTOISE_START), START_POS),
];

return [
  shape,
  hareRun.toVar('hare box-run index'),
  posA.toVar('tortoise position mod ' + MOD_A),
  posB.toVar('tortoise position mod ' + MOD_B),
  new Var('H', 'hare steps', steps.length),
  new Var('T', 'tortoise steps', steps.length),
  ...domains,
  ...ponds,
  ...anchors,
  ...hareShape,
  ...tortoiseShape,
  ...hareRuns,
  ...boxEntries,
  ...tortoiseCounters,
  ...fastThermo,
  ...slowThermo,
  ...noSharing,
  ...noCrossing,
  fox,
  new Sum(5, ...DUCK),
];
