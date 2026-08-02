// Title: RAT RUN 10: Sensored
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=aonJknbuSdU
// Source: https://sudokupad.app/fjayk4klcz

// Normal sudoku. Finkz starts on the rat at R4C4 and walks to the cupcake at
// R9C9, entering no cell twice, never crossing her own route, and never passing
// through a thick maze wall. She steps orthogonally, or diagonally when there is
// a 2x2 space to do it in and no round wall-spot sits on the shared corner.
// Blackcurrants join digits in a 1:2 ratio (not all are given, so the negative
// is not encoded). A pink motion sensor's digit counts the visited cells of its
// own 3x3 neighbourhood, itself included. Cage digits are distinct; the digit in
// a cage's electricity cell is its shock value, and a cage whose shock value is
// 5 or more is never entered. The first cage Finkz enters may total anything;
// each cage she enters after that totals exactly one more than the one before.
//
// The fog and its `foglight` marker cage are display mechanics and carry no
// constraint. Nothing else is omitted.

// The alphabet is widened to 16 so the Var layers can carry path state; the 81
// grid cells are pinned back to 1-9 below. Two position counters with coprime
// moduli (lcm 165 > 81 cells) are what forbid a closed loop of steps beside the
// path: ISS has no single-path primitive, and in/out degree alone admits one.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                      // counter value for a cell the path misses
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, A->B, B->A
const START_POS = 2;                // counter value of the first cell

const RAT = 'R4C4', CUPCAKE = 'R9C9';

// --- Drawn maze geometry --------------------------------------------------
// Lattice corners are [row, col], 0-indexed, so corner [i,j] is the top-left
// corner of the cell at row i+1, column j+1.

// The 21 thick yellow-green polylines, verbatim from the drawn wall strokes,
// plus one wall of the same colour and position drawn as a bar rather than a
// stroke: the bar lies along the R2C2/R3C2 cell edge, and the rules name only
// two maze features -- thick walls and round wall-spots on a corner -- so a
// straight bar lying on a cell edge is a wall.
const WALLS = [
  [[7, 1], [8, 1]],
  [[7, 2], [9, 2], [9, 9], [0, 9], [0, 6], [1, 6]],
  [[9, 2], [9, 0], [0, 0], [0, 6]],
  [[9, 5], [7, 5]],
  [[8, 7], [8, 8]],
  [[6, 1], [6, 4]],
  [[7, 3], [7, 4], [8, 4]],
  [[7, 8], [7, 7], [5, 7]],
  [[7, 6], [5, 6]],
  [[5, 8], [2, 8]],
  [[4, 7], [1, 7]],
  [[1, 4], [1, 5]],
  [[2, 4], [2, 6]],
  [[3, 6], [4, 6]],
  [[3, 4], [3, 5], [6, 5]],
  [[3, 3], [4, 3]],
  [[4, 1], [4, 2]],
  [[5, 1], [5, 2]],
  [[3, 2], [1, 2]],
  [[1, 3], [2, 3]],
  [[4, 4], [5, 4]],
  [[2, 1], [2, 2]],
];

// The 43 round yellow-green wall-spots, verbatim from the drawn corner discs.
const SPOTS = [
  [5, 1], [5, 2], [4, 1], [4, 2], [3, 2], [2, 1], [1, 2], [1, 3], [2, 3],
  [1, 4], [1, 5], [1, 6], [2, 4], [2, 6], [1, 7], [2, 8], [5, 8], [4, 7],
  [5, 7], [7, 8], [8, 7], [7, 6], [5, 6], [6, 5], [7, 5], [8, 4], [7, 3],
  [7, 2], [7, 1], [6, 1], [6, 4], [5, 4], [4, 4], [4, 3], [3, 3], [3, 4],
  [8, 1], [7, 7], [7, 4], [3, 5], [3, 6], [4, 6], [8, 8],
];

// The five opaque black edge discs, each given as the two cells it sits between.
const BLACKCURRANTS = [
  ['R4C4', 'R5C4'], ['R4C5', 'R5C5'], ['R7C3', 'R7C4'],
  ['R7C6', 'R8C6'], ['R3C6', 'R4C6'],
];

// The 16 pink ring marks, each drawn on a cell centre.
const SENSORS = [
  'R1C2', 'R1C8', 'R2C1', 'R3C5', 'R5C2', 'R5C5', 'R5C6', 'R6C1',
  'R6C9', 'R7C6', 'R8C1', 'R8C2', 'R8C3', 'R8C5', 'R9C1', 'R9C2',
];

// The 13 sky-blue dashed outlines; `shock` is the cell holding that outline's
// electricity symbol.
const CAGES = [
  { cells: ['R1C5', 'R1C6'], shock: 'R1C6' },
  { cells: ['R2C5', 'R2C6', 'R2C7'], shock: 'R2C6' },
  { cells: ['R3C1', 'R4C1'], shock: 'R3C1' },
  { cells: ['R3C3', 'R3C4'], shock: 'R3C4' },
  { cells: ['R3C5', 'R3C6', 'R3C7'], shock: 'R3C7' },
  { cells: ['R3C9', 'R4C9'], shock: 'R4C9' },
  { cells: ['R4C7', 'R5C7', 'R6C7'], shock: 'R5C7' },
  { cells: ['R5C3', 'R5C4', 'R6C3'], shock: 'R6C3' },
  { cells: ['R6C1', 'R6C2'], shock: 'R6C2' },
  { cells: ['R6C5'], shock: 'R6C5' },
  { cells: ['R7C2', 'R7C3'], shock: 'R7C3' },
  { cells: ['R8C7', 'R8C8', 'R9C7'], shock: 'R8C8' },
  { cells: ['R9C3', 'R9C4'], shock: 'R9C4' },
];
const SHOCK_LIMIT = 5;      // shock value >= 5 keeps Finkz out of the cage

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const rank = graph.makeOverlay('VR');   // cages entered so far, +1 (see below)

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Which moves the maze allows -----------------------------------------
// wallH holds `i|j` when the lattice segment from [i,j] to [i,j+1] is walled;
// wallV holds `i|j` when the segment from [i,j] to [i+1,j] is walled.
const wallH = new Set(), wallV = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [a, b] = [line[n - 1], line[n]];
    if (a[0] === b[0]) {
      for (let j = Math.min(a[1], b[1]); j < Math.max(a[1], b[1]); j++) {
        wallH.add(a[0] + '|' + j);
      }
    } else {
      for (let i = Math.min(a[0], b[0]); i < Math.max(a[0], b[0]); i++) {
        wallV.add(i + '|' + a[1]);
      }
    }
  }
}
const spots = new Set(SPOTS.map(p => p.join('|')));

// "Finkz may move diagonally if there's a 2x2 space in which to do so, but may
// never pass diagonally through a round wall-spot": a wall segment reaching
// corner [i,j] lies inside that corner's 2x2 block, so it removes the space,
// and a spot on the corner blocks it outright.
const cornerBlocked = (i, j) =>
  spots.has(i + '|' + j) ||
  wallH.has(i + '|' + (j - 1)) || wallH.has(i + '|' + j) ||
  wallV.has((i - 1) + '|' + j) || wallV.has(i + '|' + j);

// (i, j) is the 0-indexed cell; (dI, dJ) the move.
const moveAllowed = (i, j, dI, dJ) => {
  if (dI === 0) return !wallV.has(i + '|' + (j + Math.max(dJ, 0)));
  if (dJ === 0) return !wallH.has((i + Math.max(dI, 0)) + '|' + j);
  return !cornerBlocked(i + 1, j + Math.max(dJ, 0));
};

// --- Step variables -------------------------------------------------------
// One Var per legal move, holding whether the path uses it and in which
// direction; the direction is what the position counters need. Illegal moves
// get no Var at all, so the maze walls live in the graph rather than in a
// constraint.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const stepFrom = new Map();
for (const cell of gridCells) {
  const { row, col } = parseCellId(cell);
  for (const [dI, dJ] of STEP_DIRS) {
    const other = graph.step(cell, dI, dJ);
    if (!other || !moveAllowed(row - 1, col - 1, dI, dJ)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
    stepFrom.set([row - 1, col - 1, dI, dJ].join(','), { id, a: cell, b: other });
  }
}

// --- Path shape -----------------------------------------------------------
// Per cell: read both position counters, then every step the cell is an end of.
// A cell off the path is OFF in both layers and uses no step; a cell on the path
// is entered once and left once. The rat's cell is left but never entered, the
// cupcake's cell entered but never left.
const cellSpec = (incident, role) => cached(
  'cell|' + role + '|' + incident.map(s => s.in + '/' + s.out).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        return (value !== OFF) === s.vis
          ? { k: 2, vis: s.vis, ins: 0, outs: 0 } : undefined;
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      let { ins, outs } = s;
      if (value === step.in) ins++;
      else if (value === step.out) outs++;
      else if (value !== UNUSED) return undefined;
      if (ins > 1 || outs > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, ins, outs };
    },
    accept: s => {
      if (s.k !== incident.length + 2) return false;
      if (role === 'rat') return s.vis && s.ins === 0 && s.outs === 1;
      if (role === 'cupcake') return s.vis && s.ins === 1 && s.outs === 0;
      return s.vis ? (s.ins === 1 && s.outs === 1) : (s.ins === 0 && s.outs === 0);
    },
  }, NV));
const pathShape = gridCells.map(cell => new NFA(
  cellSpec(stepsAt.get(cell),
    cell === RAT ? 'rat' : cell === CUPCAKE ? 'cupcake' : 'plain'),
  'path-cell', posA.at(cell), posB.at(cell), ...stepsAt.get(cell).map(s => s.id)));

// Position counter: a step in use advances the counter by one along the
// direction of travel, so any closed loop of steps would have to have length
// 0 mod the modulus, and no length up to 81 is 0 mod both 15 and 11.
const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);
const counterSpec = mod => cached('counter|' + mod, () => NFA.encodeSpec({
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
  new NFA(counterSpec(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterSpec(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// "The path must not ... cross itself": the two diagonals of one 2x2 block are
// the only pair of steps that meet away from a cell centre.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    const down = stepFrom.get([i, j, 1, 1].join(','));
    const up = stepFrom.get([i, j + 1, 1, -1].join(','));
    if (down && up) noCross.push(new Pair(noCrossKey, 'no-crossing', down.id, up.id));
  }
}

// --- Motion sensors -------------------------------------------------------
// Reads the position counter of every cell in the sensor's 3x3 neighbourhood
// (the sensor cell first), then the sensor cell's own digit: the number of those
// cells the path visits must equal that digit. The count is clamped one past the
// largest digit, which is a sink.
const sensorSpec = n => cached('sensor|' + n, () => NFA.encodeSpec({
  startState: { k: 0, count: 0 },
  transition: (s, value) => {
    if (s.k < n) {
      return { k: s.k + 1, count: Math.min(s.count + (value !== OFF ? 1 : 0), 10) };
    }
    return s.k === n && value === s.count ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const sensors = SENSORS.map(cell => {
  const box = [cell, ...graph.kingNeighbours(cell)];
  return new NFA(sensorSpec(box.length), 'motion-sensor', ...posA.at(box), cell);
});

// --- Blackcurrants --------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(pair => new BlackDot(...pair));

// --- Cages: distinctness and shock value ----------------------------------
// A shock value of 5 or more keeps every cell of that cage off the path.
const shockKey = cached('shock', () => Pair.fnToKey(
  (digit, pos) => digit < SHOCK_LIMIT || pos === OFF, NV));
const cageDistinct = CAGES
  .filter(c => c.cells.length > 1)
  .map(c => new AllDifferent(...c.cells));
const shockValues = CAGES.flatMap(c => c.cells.map(
  cell => new Pair(shockKey, 'shock-value', c.shock, posA.at(cell))));

// --- The test constraint: cage totals along the path ----------------------
// `rank` counts the cages entered so far, held as count+1 so that the value 1
// means "no cage entered yet"; the count is carried from cell to cell along
// each step of the path and rises by one exactly when the step crosses into a
// cage from outside it. VK<n> is cage n's own entry number, again as count+1,
// so 1 means the cage was never entered.
const cageOf = new Map();
CAGES.forEach((c, n) => c.cells.forEach(cell => cageOf.set(cell, n)));
const NO_RANK = 1;                      // rank value meaning "no cage yet"
const MAX_RANK = CAGES.length + 1;      // rank value for the last possible cage
const cageVar = n => 'VK' + (n + 1);

// Reads the step, then the rank of each end, then the entry numbers of whichever
// ends lie in a cage (`trail` names them in cell order). An unused step relates
// nothing. Crossing into a cage sets that cage's entry number to the new rank.
const rankStepSpec = (aCaged, bCaged, sameCage) => cached(
  'rankstep|' + aCaged + '|' + bCaged + '|' + sameCage,
  () => {
    const trail = [];
    if (aCaged && !sameCage) trail.push('a');
    if (bCaged && !sameCage) trail.push('b');
    if (sameCage) trail.push('same');
    return NFA.encodeSpec({
      startState: { k: 0 },
      transition: (s, value) => {
        if (s.k === 0) return { k: 1, dir: value };
        if (s.k === 1) return { k: 2, dir: s.dir, ra: value };
        if (s.k === 2) {
          const ra = s.ra, rb = value;
          // reqs[i] is the value the i-th trailing entry-number cell must take,
          // or null when this step says nothing about it.
          const free = trail.map(() => null);
          if (s.dir === UNUSED) return { k: 3, reqs: free };
          const entersB = s.dir === FWD && bCaged && !sameCage;
          const entersA = s.dir === BWD && aCaged && !sameCage;
          if (!entersA && !entersB) return ra === rb ? { k: 3, reqs: free } : undefined;
          const [from, to] = entersB ? [ra, rb] : [rb, ra];
          if (to !== from + 1 || to > MAX_RANK) return undefined;
          const reqs = trail.map(tag => (tag === (entersB ? 'b' : 'a')) ? to : null);
          return { k: 3, reqs };
        }
        const n = s.k - 3;
        if (n >= trail.length) return undefined;
        const want = s.reqs[n];
        return (want === null || want === value)
          ? { k: s.k + 1, reqs: s.reqs } : undefined;
      },
      accept: s => s.k === trail.length + 3,
    }, NV);
  });
const rankSteps = steps.map(s => {
  const ca = cageOf.has(s.a) ? cageOf.get(s.a) : -1;
  const cb = cageOf.has(s.b) ? cageOf.get(s.b) : -1;
  const same = ca >= 0 && ca === cb;
  const trailCells = same ? [cageVar(ca)]
    : [...(ca >= 0 ? [cageVar(ca)] : []), ...(cb >= 0 ? [cageVar(cb)] : [])];
  return new NFA(rankStepSpec(ca >= 0, cb >= 0, same), 'cage-order',
    s.id, rank.at(s.a), rank.at(s.b), ...trailCells);
});

// A cage's entry number is 1 exactly when the path visits none of its cells.
const enteredSpec = n => cached('entered|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, entered: value !== NO_RANK, seen: false };
    if (s.k > n) return undefined;
    return { k: s.k + 1, entered: s.entered, seen: s.seen || value !== OFF };
  },
  accept: s => s.k === n + 1 && s.entered === s.seen,
}, NV));
const enteredKey = cached('entered-pair', () => Pair.fnToKey(
  (k, pos) => (k !== NO_RANK) === (pos !== OFF), NV));
const cageEntered = CAGES.map((c, n) => c.cells.length === 1
  ? new Pair(enteredKey, 'cage-order', cageVar(n), posA.at(c.cells[0]))
  : new NFA(enteredSpec(c.cells.length), 'cage-order',
    cageVar(n), ...posA.at(c.cells)));

// A cage's total, split across two Vars so it can exceed the 16-value alphabet:
// total = VU + 9*(VW - 1), which is one-to-one for totals 1..27.
const totalUnit = n => 'VU' + (n + 1);
const totalNine = n => 'VW' + (n + 1);
const cageTotals = CAGES.map((c, n) =>
  new Sum(-9, ...c.cells, [totalUnit(n), -1], [totalNine(n), -9]));

// Cages whose entry numbers are consecutive have consecutive totals. Reads both
// entry numbers, then both unit parts, then both nine parts; carrying the unit
// difference and then the nine part cage j is forced to keeps the machine small.
// `diff` is the total cage j must exceed cage i by, 0 when the pair is not
// consecutive either way and nothing has to be checked.
const chainSpec = cached('chain', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, ki: value };
    if (s.k === 1) {
      const diff = s.ki === NO_RANK || value === NO_RANK ? 0
        : value === s.ki + 1 ? 1 : s.ki === value + 1 ? -1 : 0;
      return { k: 2, diff };
    }
    if (s.k === 2) return { k: 3, diff: s.diff, ui: value };
    if (s.k === 3) return { k: 4, diff: s.diff, d: value - s.ui };
    if (s.k === 4) {
      if (s.diff === 0) return { k: 5, wj: null };
      // (uj - ui) + 9 * (wj - wi) must equal diff.
      const shift = (s.diff - s.d) / 9;
      if (!Number.isInteger(shift)) return undefined;
      const wj = value + shift;
      return wj >= 1 && wj <= 3 ? { k: 5, wj } : undefined;
    }
    if (s.k === 5) {
      return (s.wj === null || s.wj === value) ? { k: 6 } : undefined;
    }
    return undefined;
  },
  accept: s => s.k === 6,
}, NV));
const cageChain = [];
for (let i = 0; i < CAGES.length; i++) {
  for (let j = i + 1; j < CAGES.length; j++) {
    cageChain.push(new NFA(chainSpec, 'cage-order',
      cageVar(i), cageVar(j),
      totalUnit(i), totalUnit(j), totalNine(i), totalNine(j)));
  }
}

// --- Domains --------------------------------------------------------------
const upTo = n => Array.from({ length: n }, (_, k) => k + 1);
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  rank.toVar('cages entered so far, plus one'),
  new Var('S', 'path steps', steps.length),
  new Var('K', 'entry number of each cage, plus one', CAGES.length),
  new Var('U', 'cage total mod 9, plus one', CAGES.length),
  new Var('W', 'cage total div 9, plus one', CAGES.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...upTo(9))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...upTo(MOD_A + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...upTo(MOD_B + 1))),
  rank.makeReplicate(new Given(rank.at(gridCells[0]), ...upTo(MAX_RANK))),
  ...CAGES.map((_, n) => new Given(cageVar(n), ...upTo(MAX_RANK))),
  ...CAGES.map((_, n) => new Given(totalUnit(n), ...upTo(9))),
  ...CAGES.map((_, n) => new Given(totalNine(n), 1, 2, 3)),
  // Finkz starts on the rat, before any cage, so her counters start at the
  // first position and her rank at zero; this also pins the whole numbering.
  new Given(posA.at(RAT), START_POS),
  new Given(posB.at(RAT), START_POS),
  new Given(rank.at(RAT), NO_RANK),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...sensors,
  ...blackcurrants,
  ...cageDistinct,
  ...shockValues,
  ...rankSteps,
  ...cageEntered,
  ...cageTotals,
  ...cageChain,
];
