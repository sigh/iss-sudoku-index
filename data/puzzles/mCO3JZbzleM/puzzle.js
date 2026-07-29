// Title: RAT RUN 2: Tenacity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mCO3JZbzleM
// Source: https://sudokupad.app/3xofp0uc0s

// Normal 8x8 sudoku rules apply. Finkz walks from R7C2 to R8C8 without
// revisiting a cell, crossing the path, or crossing a thick maze wall. A move
// is orthogonal, or diagonal across a wall-free 2x2 corner. Adjacent digits
// on the walk sum to at least 10.

const NV = 16;
const OFF = 1, FIRST = 2;
const UNUSED = 1, FWD = 2, BWD = 3;
const MOD_A = 9, MOD_B = 8;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('8x8', NV);
const graph = cellGraph(shape);
const cells = graph.cells();
const rat = 'R7C2';
const cupcake = 'R8C8';

// Thick golden maze-wall polylines, transcribed from the drawn corner lattice.
const walls = [
  [[7, 3], [7, 2], [6, 2], [6, 0], [8, 0], [8, 8], [0, 8], [0, 6], [1, 6]],
  [[7, 2], [7, 1]], [[6, 0], [0, 0], [0, 6]], [[6, 8], [6, 7]],
  [[4, 8], [4, 5]], [[0, 4], [1, 4]], [[2, 7], [2, 3], [1, 3]],
  [[2, 5], [1, 5]], [[7, 7], [7, 4], [5, 4], [5, 1]],
  [[4, 3], [4, 1], [1, 1]], [[4, 4], [3, 4], [3, 7]], [[3, 4], [3, 3]],
  [[1, 2], [2, 2]], [[5, 5], [6, 5], [6, 6]], [[5, 6], [5, 7]],
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
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const r2 = r + dr, c2 = c + dc;
    if (r2 > 7 || c2 < 0 || c2 > 7) continue;
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
const pathShape = cells.map(cell => {
  const incident = at.get(cell);
  const role = cell === rat ? 'rat' : cell === cupcake ? 'cupcake' : 'plain';
  // A maze dead end has one incident legal step, so its degree rule is binary.
  if (incident.length === 1) {
    const step = incident[0];
    const required = role === 'rat' ? step.out : role === 'cupcake' ? step.in : UNUSED;
    const key = cached(`dead-end|${role}|${required}`, () => Pair.fnToKey(
      (position, direction) => role === 'plain'
        ? position === OFF && direction === UNUSED
        : position !== OFF && direction === required,
      NV,
    ));
    return new Pair(key, 'path-cell', posA.at(cell), step.id);
  }
  return new NFA(degreeNFA(incident, role), 'path-cell', posA.at(cell), ...incident.map(s => s.id));
});

// Two coprime position counters prevent a disjoint directed cycle beside the
// rat-to-cupcake path: a cycle would need length divisible by both 9 and 8.
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
for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
  const a = byOrigin.get(`${r},${c},1,1`), b = byOrigin.get(`${r},${c + 1},1,-1`);
  if (a && b) noCross.push(new Pair(noCrossKey, 'no-crossing', a.id, b.id));
}

// A used step joins digits whose sum is at least 10; an unused legal move has no digit rule.
const sumNFA = cached('path-sum-at-least-10', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => s.k === 0 ? { k: 1, active: value !== UNUSED }
    : s.k === 1 ? { k: 2, active: s.active, digit: value }
      : s.k === 2 ? (!s.active || s.digit + value >= 10 ? { done: true } : undefined) : undefined,
  accept: s => s.done === true,
}, NV));
const pathSums = steps.map(step => new NFA(sumNFA, 'path-sum-at-least-10', step.id, step.a, step.b));

return [
  shape,
  posA.toVar('path position mod 9'), posB.toVar('path position mod 8'), stepVar,
  graph.makeReplicate(new Given(cells[0], ...range(1, 8))),
  posA.makeReplicate(new Given(posA.cells()[0], ...range(1, MOD_A + 1))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  new Given(posA.at(rat), FIRST), new Given(posB.at(rat), FIRST),
  ...pathShape, ...counters, ...noCross, ...pathSums,
];
