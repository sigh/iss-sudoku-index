// Title: RAT RUN 1: Primer
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=RNWRYFUGHfQ
// Source: https://sudokupad.app/iu50qghplg

// Normal 6x6 sudoku. Finkz walks from the rat to the cupcake without
// revisiting or crossing a cell, through legal orthogonal or diagonal maze
// moves. Consecutive path digits, and the path digits in each 3x2 box, sum
// to primes. Nothing is omitted.

// The widened alphabet holds path layers; grid digits remain 1-6.
const NV = 9;
const MOD_A = 8, MOD_B = 5; // lcm 40 exceeds the 36-cell path bound.
const OFF = 1, FIRST = 2;
const UNUSED = 1, FWD = 2, BWD = 3;
const RAT = 'R1C3', CUPCAKE = 'R5C5';
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const isPrime = n => [2, 3, 5, 7, 11, 13, 17, 19].includes(n);

// Thick purple wall polylines and round wall-spots, transcribed from the maze.
const WALLS = [
  [[4, 2], [5, 2], [5, 4]], [[6, 5], [6, 6], [5, 6], [5, 5], [4, 5]],
  [[2, 3], [1, 3], [1, 7], [7, 7], [7, 1], [1, 1], [1, 3]],
  [[1, 4], [2, 4]], [[4, 3], [3, 3], [3, 6], [4, 6]],
  [[3, 3], [3, 2], [2, 2]], [[2, 5], [2, 6]],
];
const SPOTS = [
  [5, 2], [4, 2], [4, 3], [5, 6], [6, 6], [6, 5], [4, 5], [4, 6],
  [3, 6], [2, 6], [2, 5], [2, 4], [2, 3], [2, 2], [3, 2], [5, 4], [5, 5],
];

const wallSegments = new Set();
for (const line of WALLS) for (let n = 1; n < line.length; n++) {
  const [i0, j0] = line[n - 1], [i1, j1] = line[n];
  if (i0 === i1) for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) wallSegments.add(`H|${i0}|${j}`);
  else for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) wallSegments.add(`V|${i}|${j0}`);
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);
const stepAllowed = (cell, dr, dc) => {
  const { row, col } = parseCellId(cell);
  if (dr === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dc, 0)}`);
  if (dc === 0) return !wallSegments.has(`H|${row + Math.max(dr, 0)}|${col}`);
  return cornerOpen(row + Math.max(dr, 0), col + Math.max(dc, 0));
};

const shape = new Shape('6x6', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
// The six drawn 3x2 Sudoku boxes.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C4', 'R4C5', 'R4C6'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
];
const steps = [], stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
  const other = graph.step(cell, dr, dc);
  if (!other || !stepAllowed(cell, dr, dc)) continue;
  const id = 'VS' + (steps.length + 1), step = { id, a: cell, b: other };
  steps.push(step);
  stepsAt.get(cell).push({ id, out: FWD, in: BWD });
  stepsAt.get(other).push({ id, out: BWD, in: FWD });
}
const memo = new Map();
const cached = (key, build) => { if (!memo.has(key)) memo.set(key, build()); return memo.get(key); };

// Each cell has exactly its required directed in/out degree; the two counters
// agree on visitedness, so no cell can be revisited.
function cellNFA(incident, role) {
  const sig = `${role}|${incident.map(x => x.out).join(',')}`;
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, on: value !== OFF };
      if (s.k === 1) return (value !== OFF) === s.on ? { k: 2, on: s.on, inn: 0, out: 0 } : undefined;
      const n = s.k - 2; if (n >= incident.length) return undefined;
      const edge = incident[n], next = { k: s.k + 1, on: s.on, inn: s.inn, out: s.out };
      if (value === edge.in) next.inn++; else if (value === edge.out) next.out++; else if (value !== UNUSED) return undefined;
      return next.inn <= 1 && next.out <= 1 ? next : undefined;
    },
    accept: s => s.k === incident.length + 2 && (role === 'start' ? s.on && s.out === 1 && s.inn === 0 : role === 'end' ? s.on && s.inn === 1 && s.out === 0 : s.on ? s.inn === 1 && s.out === 1 : s.inn === 0 && s.out === 0),
  }, NV));
}
const pathShape = gridCells.map(cell => new NFA(cellNFA(stepsAt.get(cell), cell === RAT ? 'start' : cell === CUPCAKE ? 'end' : 'plain'), 'path-cell', posA.at(cell), posB.at(cell), ...stepsAt.get(cell).map(x => x.id)));

// Residue counters orient the path and eliminate disconnected directed cycles.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached(`counter-${mod}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    return s.dir === FWD ? (value === nextPos(s.a, mod) ? { done: true } : undefined) : (s.a === nextPos(value, mod) ? { done: true } : undefined);
  }, accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)), new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b))]);

// The two diagonals of a 2x2 square cannot both be selected.
const stepIndex = new Map(steps.map(s => [`${s.a}|${s.b}`, s.id]));
const noCrossKey = Pair.fnToKey((a, b) => a === UNUSED || b === UNUSED, NV);
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1), down = graph.step(cell, 1, 0), diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const a = stepIndex.get(`${cell}|${diag}`), b = stepIndex.get(`${right}|${down}`);
  if (a && b) noCross.push(new Pair(noCrossKey, 'no-crossing', a, b));
}

const primeStep = cached('prime-step', () => NFA.encodeSpec({
  startState: { k: 0 }, transition: (s, value) => s.k === 0 ? { k: 1, edge: value } : s.k === 1 ? { k: 2, edge: s.edge, a: value } : s.k === 2 ? ((s.edge === UNUSED || isPrime(s.a + value)) ? { done: true } : undefined) : undefined, accept: s => s.done === true,
}, NV));
const primeSteps = steps.map(s => new NFA(primeStep, 'path-prime-pair', s.id, s.a, s.b));
const boxPrime = cached('box-prime', () => NFA.encodeSpec({
  startState: { k: 0, sum: 0 }, transition: (s, value) => {
    if (s.k >= 12) return undefined;
    return s.k % 2 === 0 ? { k: s.k + 1, sum: s.sum, on: value !== OFF } : { k: s.k + 1, sum: s.sum + (s.on ? value : 0) };
  }, accept: s => s.k === 12 && isPrime(s.sum),
}, NV));
const primeBoxes = REGIONS.map(cells => new NFA(boxPrime, 'box-path-prime', ...cells.flatMap(cell => [posA.at(cell), cell])));

return [
  shape, new NoBoxes(), new RegionSize(6),
  ...REGIONS.map(cells => new Jigsaw('6x6~6', ...cells)),
  posA.toVar('path position mod 8'), posB.toVar('path position mod 5'), new Var('S', 'path steps', steps.length),
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 6))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(1, MOD_A + 1))), posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  new Given(posA.at(RAT), FIRST), new Given(posB.at(RAT), FIRST),
  ...pathShape, ...counters, ...noCross, ...primeSteps, ...primeBoxes,
];
