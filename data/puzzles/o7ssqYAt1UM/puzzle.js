// Title: RAT RUN 4: Borderline
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=o7ssqYAt1UM
// Source: https://sudokupad.app/wv8l8x67dy

// Normal sudoku. Finkz walks orthogonally from R2C8 to R5C5 without revisiting
// a cell, crossing the path, or crossing a thick blue maze wall. Blackcurrant
// dots give a 1:2 digit ratio. A purple door can be used only in its drawn
// direction, towards its smaller digit. The path Region Sum Line rule is
// omitted: its box-border segments are selected by the unknown path.

const NV = 16;
const UNUSED = 1, FWD = 2, BWD = 3;
const OFF = 1, FIRST = 2;
const RAT = 'R2C8', CUPCAKE = 'R5C5';
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const cells = graph.cells();
// Purple arrows are doors in the maze wall: they are legal only in the listed
// direction, so their wall segments are deliberately retained as step edges.
const DOORS = [['R4C7','R4C8'], ['R7C6','R7C7'], ['R2C1','R2C2'], ['R3C3','R4C3'], ['R9C9','R9C8'], ['R9C8','R9C7'], ['R5C8','R5C9']];

// The thick blue wall polylines transcribed from the drawing. Integer pairs are
// lattice corners in SudokuPad row-first coordinates.
const WALLS = [
  [[6,3],[5,3],[5,5],[6,5]], [[5,4],[2,4]], [[5,5],[3,5],[3,6]],
  [[4,1],[3,1],[3,2]], [[4,2],[6,2]], [[7,2],[7,3],[8,3]],
  [[4,6],[4,7],[7,7]], [[3,7],[2,7],[2,5],[1,5],[1,4]], [[1,3],[1,1]],
  [[4,3],[2,3],[2,0],[9,0],[9,9],[0,9],[0,0],[2,0]], [[9,4],[8,4]],
  [[9,6],[8,6]], [[5,8],[8,8],[8,7]], [[3,8],[4,8]], [[1,8],[2,8]],
  [[1,6],[1,7]], [[5,6],[6,6]], [[7,6],[7,5],[8,5]],
  [[7,5],[7,4],[6,4]], [[5,1],[6,1]], [[7,1],[8,1],[8,2]],
];
const edgeKey = (a, b) => a < b ? a + '|' + b : b + '|' + a;
const doorEdges = new Set(DOORS.map(([a, b]) => edgeKey(a, b)));
const walled = new Set();
for (const line of WALLS) for (let i = 1; i < line.length; i++) {
  const [r0, c0] = line[i - 1], [r1, c1] = line[i];
  if (r0 === r1) for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++)
    if (r0 > 0 && r0 < 9) walled.add(edgeKey(makeCellId(r0, c + 1), makeCellId(r0 + 1, c + 1)));
  if (c0 === c1) for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++)
    if (c0 > 0 && c0 < 9) walled.add(edgeKey(makeCellId(r + 1, c0), makeCellId(r + 1, c0 + 1)));
}

// One directed-state Var for each legal orthogonal maze edge.
const steps = [];
const at = new Map(cells.map(cell => [cell, []]));
for (const cell of cells) for (const [dr, dc] of [[0, 1], [1, 0]]) {
  const other = graph.step(cell, dr, dc);
  if (!other || (walled.has(edgeKey(cell, other)) && !doorEdges.has(edgeKey(cell, other)))) continue;
  const id = 'VS' + (steps.length + 1);
  const step = { id, a: cell, b: other };
  steps.push(step);
  at.get(cell).push({ id, in: BWD, out: FWD });
  at.get(other).push({ id, in: FWD, out: BWD });
}

const memo = new Map();
const cached = (key, build) => { if (!memo.has(key)) memo.set(key, build()); return memo.get(key); };
const signature = incident => incident.map(x => x.in + '/' + x.out).join(',');
const degreeNFA = (incident, role) => cached(role + '|' + signature(incident), () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, visited: value !== OFF, inside: 0, outside: 0 };
    const i = s.k - 1;
    if (i >= incident.length) return undefined;
    const edge = incident[i];
    let inside = s.inside, outside = s.outside;
    if (value === edge.in) inside++; else if (value === edge.out) outside++; else if (value !== UNUSED) return undefined;
    const want = role === 'rat' ? [0, 1] : role === 'cupcake' ? [1, 0] : s.visited ? [1, 1] : [0, 0];
    if (inside > want[0] || outside > want[1]) return undefined;
    return { k: s.k + 1, visited: s.visited, inside, outside };
  },
  accept: s => {
    const want = role === 'rat' ? [0, 1] : role === 'cupcake' ? [1, 0] : s.visited ? [1, 1] : [0, 0];
    return s.k === incident.length + 1 && s.inside === want[0] && s.outside === want[1];
  },
}, NV));

const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const roles = cells.map(cell => cell === RAT ? 'rat' : cell === CUPCAKE ? 'cupcake' : 'plain');
const pathShape = cells.map((cell, i) => {
  const incident = at.get(cell), role = roles[i];
  if (incident.length !== 1) return new NFA(degreeNFA(incident, role), 'path-cell', posA.at(cell), ...incident.map(x => x.id));
  const edge = incident[0];
  const key = cached('one-edge|' + role + '|' + edge.in + '/' + edge.out, () => Pair.fnToKey((position, step) => {
    if (role === 'rat') return position !== OFF && step === edge.out;
    if (role === 'cupcake') return position !== OFF && step === edge.in;
    return position === OFF && step === UNUSED;
  }, NV));
  return new Pair(key, 'path-cell', posA.at(cell), edge.id);
});

// Two coprime position counters eliminate disconnected cycles: a cycle would
// need length divisible by 15 and 11, greater than the 81-cell board.
const advance = mod => cached('advance|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    const next = x => FIRST + ((x - FIRST + 1) % mod);
    return s.dir === FWD ? value === next(s.a) ? { done: true } : undefined : s.a === next(value) ? { done: true } : undefined;
  }, accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(advance(15), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(advance(11), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

const BLACKCURRANTS = [['R2C5','R3C5'], ['R7C9','R8C9'], ['R5C2','R6C2'], ['R7C2','R7C3'], ['R3C1','R3C2']];
const stepId = new Map(steps.map(s => [edgeKey(s.a, s.b), s]));
const doors = DOORS.flatMap(([a, b]) => {
  const step = stepId.get(edgeKey(a, b));
  const forward = step.a === a ? FWD : BWD;
  return [new Given(step.id, UNUSED, forward), new GreaterThan(a, b)];
});

return [
  shape,
  posA.toVar('path position mod 15'), posB.toVar('path position mod 11'), new Var('S', 'maze steps', steps.length),
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, 12))),
  new Given(posA.at(RAT), FIRST), new Given(posB.at(RAT), FIRST),
  ...pathShape, ...counters,
  ...BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b)),
  ...doors,
];
