// Title: RAT RUN 3: Double Dutch
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=7bqcxHY6cSw
// Source: https://sudokupad.app/5b1du6ra7d

// Normal sudoku rules apply. Finkz walks from R1C8 to R8C7 without revisiting
// a cell, crossing the path, or crossing a thick maze wall. A move is
// orthogonal, or diagonal across a wall-free 2x2 corner. Adjacent digits on
// the walk differ by at least 4. The eleven drawn blackcurrants are 1:2 dots;
// the rules state that other possible blackcurrants are not necessarily drawn.

const NV = 16;
const OFF = 1, FIRST = 2;
const UNUSED = 1, FWD = 2, BWD = 3;
const MOD_A = 15, MOD_B = 11;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const cells = graph.cells();
const rat = 'R1C8';
const cupcake = 'R8C7';

// Thick brown maze-wall polylines, transcribed from the drawn corner lattice.
const walls = [
  [[1, 1], [1, 8]], [[2, 3], [2, 4]],
  [[3, 4], [3, 2], [2, 2], [2, 1]],
  [[3, 1], [3, 0], [9, 0], [9, 9], [2, 9], [2, 5], [3, 5]],
  [[3, 0], [0, 0], [0, 9], [2, 9]], [[9, 2], [8, 2]],
  [[8, 1], [7, 1], [7, 2]], [[7, 1], [4, 1], [4, 5]],
  [[4, 3], [5, 3]], [[7, 6], [7, 4], [8, 4], [8, 3]],
  [[7, 5], [6, 5]], [[4, 6], [3, 6], [3, 8], [4, 8]],
  [[8, 8], [5, 8]], [[6, 8], [6, 6], [5, 6]], [[4, 7], [5, 7]],
  [[5, 4], [5, 5]], [[6, 3], [6, 4]], [[5, 2], [6, 2]], [[8, 6], [8, 7]],
];
const wallH = new Set(), wallV = new Set();
for (const line of walls) for (let i = 1; i < line.length; i++) {
  const [r0, c0] = line[i - 1], [r1, c1] = line[i];
  if (r0 === r1) for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) wallH.add(`${r0}|${c}`);
  else for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) wallV.add(`${r}|${c0}`);
}
const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
const cornerBlocked = (r, c) => wallV.has(`${r - 1}|${c}`) || wallV.has(`${r}|${c}`) ||
  wallH.has(`${r}|${c - 1}`) || wallH.has(`${r}|${c}`);

// A directed step Var exists only for a move that the maze permits.
const steps = [], at = new Map(cells.map(cell => [cell, []])), byOrigin = new Map();
for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const r2 = r + dr, c2 = c + dc;
    if (r2 > 8 || c2 < 0 || c2 > 8) continue;
    const legal = dr === 0 || dc === 0
      ? !orthBlocked(r, c, dr, dc)
      : !cornerBlocked(r + 1, c + Math.max(dc, 0));
    if (!legal) continue;
    const step = { a: makeCellId(r + 1, c + 1), b: makeCellId(r2 + 1, c2 + 1) };
    steps.push(step);
    byOrigin.set(`${r},${c},${dr},${dc}`, step);
  }
}
const stepVar = new Var('S', 'maze steps', steps.length);
steps.forEach((step, i) => {
  step.id = stepVar.cell(i + 1);
  at.get(step.a).push({ id: step.id, in: BWD, out: FWD });
  at.get(step.b).push({ id: step.id, in: FWD, out: BWD });
});

const memo = new Map();
const cached = (key, build) => { if (!memo.has(key)) memo.set(key, build()); return memo.get(key); };
const signature = incident => incident.map(s => `${s.in}/${s.out}`).join(',');
const degreeNFA = (incident, role) => cached(`degree|${role}|${signature(incident)}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, visited: value !== OFF, in: 0, out: 0 };
    const n = s.k - 1;
    if (n >= incident.length) return undefined;
    const step = incident[n];
    const next = { k: s.k + 1, visited: s.visited, in: s.in, out: s.out };
    if (value === step.in) next.in++;
    else if (value === step.out) next.out++;
    else if (value !== UNUSED) return undefined;
    if (next.in > 1 || next.out > 1) return undefined;
    return next;
  },
  accept: s => {
    if (s.k !== incident.length + 1) return false;
    if (role === 'rat') return s.visited && s.in === 0 && s.out === 1;
    if (role === 'cupcake') return s.visited && s.in === 1 && s.out === 0;
    return s.visited ? s.in === 1 && s.out === 1 : s.in === 0 && s.out === 0;
  },
}, NV));

const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const pathShape = cells.map(cell => new NFA(degreeNFA(at.get(cell), cell === rat ? 'rat' : cell === cupcake ? 'cupcake' : 'plain'),
  'path-cell', posA.at(cell), ...at.get(cell).map(s => s.id)));

// Two coprime position counters prevent any disjoint directed cycle beside the
// rat-to-cupcake path: such a cycle would need length divisible by 15 and 11.
const nextPos = (value, mod) => FIRST + ((value - FIRST + 1) % mod);
const counterNFA = mod => cached(`counter|${mod}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    return s.dir === FWD ? (value === nextPos(s.a, mod) ? { done: true } : undefined)
      : (s.a === nextPos(value, mod) ? { done: true } : undefined);
  }, accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(step => [
  new NFA(counterNFA(MOD_A), 'path-order', step.id, posA.at(step.a), posA.at(step.b)),
  new NFA(counterNFA(MOD_B), 'path-order', step.id, posB.at(step.a), posB.at(step.b)),
]);

// The two diagonals of any 2x2 block cannot both be used.
const noCrossKey = cached('no-cross', () => Pair.fnToKey((a, b) => a === UNUSED || b === UNUSED, NV));
const noCross = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
  const a = byOrigin.get(`${r},${c},1,1`), b = byOrigin.get(`${r},${c + 1},1,-1`);
  if (a && b) noCross.push(new Pair(noCrossKey, 'no-crossing', a.id, b.id));
}

// A used step is a Dutch Whisper edge; an unused legal move has no digit rule.
const whisperNFA = cached('dutch-whisper', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => s.k === 0 ? { k: 1, active: value !== UNUSED }
    : s.k === 1 ? { k: 2, active: s.active, digit: value }
      : s.k === 2 ? (!s.active || Math.abs(s.digit - value) >= 4 ? { done: true } : undefined) : undefined,
  accept: s => s.done === true,
}, NV));
const whispers = steps.map(step => new NFA(whisperNFA, 'dutch-whisper', step.id, step.a, step.b));

const blackcurrants = [
  ['R1C3', 'R1C4'], ['R1C9', 'R2C9'], ['R2C3', 'R3C3'], ['R2C5', 'R3C5'],
  ['R3C2', 'R4C2'], ['R4C5', 'R4C6'], ['R5C5', 'R5C6'], ['R6C1', 'R7C1'],
  ['R7C7', 'R7C8'], ['R8C2', 'R9C2'], ['R8C9', 'R9C9'],
].map(([a, b]) => new BlackDot(a, b));

return [
  shape,
  posA.toVar('path position mod 15'), posB.toVar('path position mod 11'),
  stepVar,
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  new Given(posA.at(rat), FIRST), new Given(posB.at(rat), FIRST),
  ...pathShape, ...counters, ...noCross, ...whispers, ...blackcurrants,
];
