// Title: Hedge Fun
// Author: vfig
// Video: https://www.youtube.com/watch?v=XNZA9KNrEIc
// Source: https://sudokupad.app/8zj1gqnxkd

// Normal sudoku. Nine 3x3 hedge-maze pieces are placed one per box, unrotated
// and unreflected; THE CUT CORNER is already in box 7. Oliver starts on the
// centre cell of THE ORIGIN and walks a path between cell centres, orthogonally
// or diagonally, to one of the four cardinal exits (R1C5, R9C5, R5C1, R5C9).
// The path never branches, never crosses itself, enters no cell twice, and never
// touches a hedge. Adjacent digits along it differ by at least 5. Every fountain
// half must meet its partner half across a box border, and the path may not pass
// diagonally through a fountain. A sumflower sits between two digits summing to
// 10 and the path visits exactly one of its two cells. An apple tree sits between
// two digits summing to 5, and the path visits every cell holding an apple.
//
// Nothing is omitted. Two rule readings are fixed by the art rather than by the
// prose, and both are stated where they are encoded: what "touch a hedge" means
// for a diagonal step, and what a hedge drawn across a cell's diagonal does.

// The alphabet is widened to 16 so the Var layers can carry path state; the 81
// grid cells are pinned back to 1-9 below. Two position counters with coprime
// moduli (lcm 165 > 81 cells) are what forbid a closed loop of steps beside the
// path: ISS has no single-path primitive, and in/out degree alone admits one.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                     // counter value for a cell the path misses
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, A->B, B->A
const START_POS = 2;               // counter value of the first cell (position 0)

// --- The drawn pieces -----------------------------------------------------
// Transcribed from the eight tiles drawn beside the grid and from the piece
// already placed in box 7. A piece's own cells are R1C1..R3C3; its corner
// lattice runs 1..4, corner (i,j) being the top-left corner of cell RiCj.
// `walls` are the green hedge segments, each one lattice unit long, given as
// corner pairs; a segment whose two corners differ in both coordinates is a
// hedge drawn diagonally across the cell it crosses. `trees`/`flowers` are the
// tree and sumflower marks, each given as the two cells it sits between.
// `fountains` give the corner a half-fountain sits on and the side of the piece
// its missing half lies over. `start` is the cell holding Oliver.
const PIECES = [
  { name: 'THE ORIGIN',
    walls: [[[1, 2], [1, 3]], [[2, 1], [2, 2]], [[2, 1], [3, 1]],
            [[2, 3], [3, 3]], [[2, 4], [3, 4]], [[4, 2], [4, 3]]],
    trees: [[[1, 1], [1, 2]]], apples: [[1, 1], [1, 2]],
    flowers: [], fountains: [], start: [2, 2] },
  { name: 'WANDERFULLY',
    walls: [[[2, 1], [2, 2]], [[2, 2], [2, 3]], [[2, 3], [3, 4]]],
    trees: [[[3, 1], [3, 2]]], apples: [[3, 1]],
    flowers: [], fountains: [[[2, 1], 'left'], [[4, 3], 'down']], start: null },
  { name: 'FLOWER BED',
    walls: [[[1, 2], [1, 3]], [[1, 3], [1, 4]], [[1, 4], [2, 4]],
            [[3, 1], [3, 2]], [[3, 1], [4, 1]], [[3, 4], [4, 4]]],
    trees: [[[2, 3], [3, 3]]], apples: [[2, 3]],
    flowers: [[[1, 1], [1, 2]], [[2, 1], [2, 2]]], fountains: [[[2, 1], 'left'], [[4, 3], 'down']], start: null },
  { name: 'BIFURCATED BYWAY',
    walls: [[[1, 1], [1, 2]], [[1, 1], [2, 1]], [[2, 3], [2, 4]],
            [[2, 3], [3, 2]], [[4, 3], [4, 4]]],
    trees: [[[2, 3], [3, 3]]], apples: [[3, 3]],
    flowers: [], fountains: [], start: null },
  { name: 'NOW HERE',
    walls: [[[1, 1], [1, 2]], [[1, 3], [1, 4]], [[2, 3], [2, 4]],
            [[2, 3], [3, 2]], [[3, 4], [4, 4]]],
    trees: [[[2, 2], [3, 2]], [[1, 1], [1, 2]]], apples: [[3, 2], [1, 2]],
    flowers: [], fountains: [[[2, 4], 'right']], start: null },
  { name: 'EWE TURN',
    walls: [[[1, 3], [2, 2]], [[2, 1], [3, 1]], [[3, 1], [4, 1]],
            [[3, 2], [4, 3]]],
    trees: [[[1, 2], [1, 3]], [[2, 1], [2, 2]]], apples: [],
    flowers: [], fountains: [[[2, 4], 'right']], start: null },
  { name: 'QUODLIBET',
    walls: [[[2, 1], [3, 1]], [[2, 2], [2, 3]], [[2, 4], [3, 4]],
            [[4, 3], [4, 4]]],
    trees: [[[2, 1], [3, 1]]], apples: [[3, 1]],
    flowers: [], fountains: [[[1, 3], 'up']], start: null },
  { name: 'FRUITLESS PASSAGE',
    walls: [[[3, 1], [3, 2]], [[3, 1], [4, 1]], [[3, 2], [3, 3]],
            [[3, 4], [4, 4]], [[4, 2], [4, 3]], [[4, 3], [4, 4]]],
    trees: [], apples: [],
    flowers: [], fountains: [[[1, 3], 'up']], start: null },
];
const CUT_CORNER =
  { name: 'THE CUT CORNER',
    walls: [[[1, 1], [2, 2]], [[2, 2], [3, 2]]],
    trees: [[[1, 2], [1, 3]]], apples: [[1, 2]],
    flowers: [], fountains: [], start: null };
const ORIGIN_PIECE = 1;                       // PIECES index+1 of THE ORIGIN
const FIXED_BOX = { br: 3, bc: 1 };           // box 7 holds THE CUT CORNER
// Exits: the four gaps in the boundary hedge, at the cardinal points.
const EXITS = ['R1C5', 'R9C5', 'R5C1', 'R5C9'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const FREE_BOXES = [];
for (let br = 1; br <= 3; br++) {
  for (let bc = 1; bc <= 3; bc++) {
    if (br !== FIXED_BOX.br || bc !== FIXED_BOX.bc) FREE_BOXES.push({ br, bc });
  }
}
const boxVar = b => 'VP' + (FREE_BOXES.findIndex(
  x => x.br === b.br && x.bc === b.bc) + 1);

// --- Step variables -------------------------------------------------------
// One Var per king-move adjacency, recording whether the path uses it and in
// which direction; the direction is what the position counters need. Plus one
// per exit, recording whether the path leaves the grid there.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    const step = { id, a: cell, b: other, dR, dC };
    steps.push(step);
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);
EXITS.forEach((cell, n) => {
  stepsAt.get(cell).push({ id: 'VX' + (n + 1), out: 2, in: -1 });
});

// --- Geometry of a piece placed in a box ----------------------------------
// A piece's own cell RiCj, once the piece sits in the given box.
const localCell = (box, i, j) =>
  makeCellId((box.br - 1) * 3 + i, (box.bc - 1) * 3 + j);

// Grid corners run 1..10; only 2..9 have four cells around them.
const innerCorner = (i, j) => i >= 2 && i <= 9 && j >= 2 && j <= 9;

// The two diagonal steps that pass through grid corner (i,j).
const diagonalsThrough = (i, j) => innerCorner(i, j)
  ? [stepBetween(makeCellId(i - 1, j - 1), makeCellId(i, j)),
     stepBetween(makeCellId(i - 1, j), makeCellId(i, j - 1))]
  : [];

// What piece `piece` blocks when placed in box `box`.
function placement(piece, box) {
  const off = [(box.br - 1) * 3, (box.bc - 1) * 3];
  const map = p => [p[0] + off[0], p[1] + off[1]];
  const blockedSteps = new Set();
  const deadCells = new Set();
  const corners = new Set();
  for (const [pa, pb] of piece.walls) {
    const [i0, j0] = map(pa), [i1, j1] = map(pb);
    corners.add(i0 + ',' + j0);
    corners.add(i1 + ',' + j1);
    if (i0 === i1) {                                  // hedge along a row line
      // separates the cells above and below it
      const j = Math.min(j0, j1);
      if (i0 >= 2 && i0 <= 9) {
        blockedSteps.add(stepBetween(makeCellId(i0 - 1, j), makeCellId(i0, j)).id);
      }
    } else if (j0 === j1) {                           // hedge along a column line
      const i = Math.min(i0, i1);
      if (j0 >= 2 && j0 <= 9) {
        blockedSteps.add(stepBetween(makeCellId(i, j0 - 1), makeCellId(i, j0)).id);
      }
    } else {
      // A hedge drawn corner-to-corner across a cell runs through that cell's
      // centre, and the rules draw the path "between cell centers", so the path
      // cannot enter such a cell at all -- hence a dead cell rather than a cell
      // that merely loses some of its steps.
      deadCells.add(makeCellId(Math.min(i0, i1), Math.min(j0, j1)));
    }
  }
  // "must never touch any hedges": a diagonal step passes exactly through the
  // corner shared by its two cells, so any hedge reaching that corner -- an end
  // cap as much as a crossing -- blocks it.
  for (const key of corners) {
    const [i, j] = key.split(',').map(Number);
    for (const s of diagonalsThrough(i, j)) blockedSteps.add(s.id);
  }
  const fountainCorners = piece.fountains.map(([p]) => map(p));
  return { blockedSteps, deadCells, fountainCorners };
}

// --- Custom keys and machines --------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// "if this box holds one of these pieces then <fact about the second cell>"
const condKey = (pieceSet, ok) => cached(
  'c|' + [...pieceSet].sort().join('_') + '|' + ok.name,
  () => Pair.fnToKey((p, v) => !pieceSet.has(p) || ok(v), NV));
const stepUnused = v => v === UNUSED;
const cellOffPath = v => v === OFF;
const cellOnPath = v => v !== OFF;

// Two diagonal steps of the same 2x2 square cross each other, and the path may
// not cross itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);

const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);

// Position counter: an in-use step advances the counter by one along the
// direction of travel, so a closed loop's length must be 0 mod the modulus.
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
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

// Digits joined by a step of the path differ by at least 5.
const diffNFA = cached('diff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return Math.abs(s.a - value) >= 5 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Per-cell path shape: reads the cell's two counters and then every step it is
// an endpoint of. A cell off the path (counter OFF in both layers) uses no step;
// a cell on the path is entered once and left once. Cells that may hold Oliver
// read their box's piece Var first: if the box holds THE ORIGIN the cell is the
// start, so it is left but never entered, and its counters are pinned to the
// first position to stop the whole numbering rotating.
function cellNFA(incident, startable) {
  const sig = 'deg|' + (startable ? 'S' : '-') + '|' +
    incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      let k = s.k, isStart = s.isStart;
      if (startable && k === 0) return { k: 1, isStart: value === ORIGIN_PIECE };
      const base = startable ? 1 : 0;
      if (k === base) {
        if (isStart && value !== START_POS) return undefined;
        return { k: k + 1, isStart, vis: value !== OFF };
      }
      if (k === base + 1) {
        if (isStart && value !== START_POS) return undefined;
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: k + 1, isStart, vis: s.vis, in: 0, out: 0 };
      }
      if (k - base - 2 >= incident.length) return undefined;
      const step = incident[k - base - 2];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: k + 1, isStart, vis: s.vis, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== (startable ? 1 : 0) + 2 + incident.length) return false;
      if (s.isStart) return s.vis && s.in === 0 && s.out === 1;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}

// "if this box holds one of these pieces, these two digits sum to N"
const sumNFA = sums => cached(
  'sum|' + [...sums.entries()].sort().map(e => e.join(':')).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, want: sums.get(value) || 0 };
      if (s.k === 1) return { k: 2, want: s.want, a: value };
      if (s.k !== 2) return undefined;
      if (!s.want) return { done: true };
      return s.a + value === s.want ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));

// "if this box holds one of these pieces, the path visits exactly one of the
// two cells beside the sumflower"
const flowerNFA = pieceSet => cached(
  'flower|' + [...pieceSet].sort().join('_'),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, on: pieceSet.has(value) };
      if (s.k === 1) return { k: 2, on: s.on, a: value !== OFF };
      if (s.k !== 2) return undefined;
      if (!s.on) return { done: true };
      return s.a !== (value !== OFF) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));

// --- Placement layer ------------------------------------------------------
const placements = new Map();
for (const box of FREE_BOXES) {
  for (let p = 1; p <= PIECES.length; p++) {
    placements.set(boxVar(box) + '#' + p, placement(PIECES[p - 1], box));
  }
}
const fixed = placement(CUT_CORNER, FIXED_BOX);

const pieceIds = FREE_BOXES.map(boxVar);

const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
  new Var('X', 'exit steps', EXITS.length),
  new Var('P', 'piece placed in each box', FREE_BOXES.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];
// The step and exit Vars need no domain constraint of their own: the per-cell
// path machine below accepts no value on them but unused / in / out, and the
// piece Vars are pinned to their box's legal pieces by `edgeBoxes`.

// One piece per box, and each piece used once.
const oneEach = [new AllDifferent(...pieceIds)];

// --- Hedges ---------------------------------------------------------------
// Steps and cells the already-placed piece rules out, unconditionally.
const fixedHedges = [
  ...[...fixed.blockedSteps].map(id => new Given(id, UNUSED)),
  ...[...fixed.deadCells].flatMap(cell => [
    new Given(posA.at(cell), OFF), new Given(posB.at(cell), OFF)]),
];

// Every other hedge depends on which piece landed in the box.
const stepVeto = new Map();     // stepId -> boxVar -> set of vetoing pieces
const cellVeto = new Map();     // cell   -> boxVar -> set of vetoing pieces
const noteVeto = (table, key, vp, piece) => {
  if (!table.has(key)) table.set(key, new Map());
  const byBox = table.get(key);
  if (!byBox.has(vp)) byBox.set(vp, new Set());
  byBox.get(vp).add(piece);
};
for (const box of FREE_BOXES) {
  const vp = boxVar(box);
  for (let p = 1; p <= PIECES.length; p++) {
    const pl = placements.get(vp + '#' + p);
    for (const id of pl.blockedSteps) noteVeto(stepVeto, id, vp, p);
    for (const cell of pl.deadCells) noteVeto(cellVeto, cell, vp, p);
    // A fountain is an obstacle at a corner: the path may pass either side of it
    // but may not go diagonally through it.
    for (const [i, j] of pl.fountainCorners) {
      for (const s of diagonalsThrough(i, j)) noteVeto(stepVeto, s.id, vp, p);
    }
  }
}
const hedges = [
  ...[...stepVeto].flatMap(([id, byBox]) => [...byBox].map(([vp, set]) =>
    new Pair(condKey(set, stepUnused), 'hedge', vp, id))),
  ...[...cellVeto].flatMap(([cell, byBox]) => [...byBox].map(([vp, set]) =>
    new Pair(condKey(set, cellOffPath), 'hedge', vp, posA.at(cell)))),
];

// --- Path shape -----------------------------------------------------------
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return { br: Math.ceil(row / 3), bc: Math.ceil(col / 3) };
};
const isBoxCentre = cell => {
  const { row, col } = parseCellId(cell);
  return row % 3 === 2 && col % 3 === 2;
};
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const box = boxOf(cell);
  // Oliver stands on the centre cell of THE ORIGIN, so only a box centre can be
  // the start, and only when its box turns out to hold that piece.
  const startable = isBoxCentre(cell) &&
    !(box.br === FIXED_BOX.br && box.bc === FIXED_BOX.bc);
  const cells = [...(startable ? [boxVar(box)] : []),
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id)];
  return new NFA(cellNFA(incident, startable), 'path-cell', ...cells);
});
// Exactly one exit is taken: forced by the degrees above, since every visited
// cell but Oliver's is entered once and left once.
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);
const noCross = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const [d1, d2] = diagonalsThrough(i, j);
    noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}
const differences = steps.map(s =>
  new NFA(diffNFA, 'path-difference', s.id, s.a, s.b));

// --- Trees, sumflowers, apples -------------------------------------------
const sumClues = new Map();      // "cellX|cellY" -> Map(piece -> required sum)
const appleVeto = new Map();     // cell -> boxVar -> set of pieces with an apple
const flowerClues = new Map();   // "vp|cellX|cellY" -> set of pieces
const addSum = (box, vp, p, edge, total) => {
  const [x, y] = edge.map(([i, j]) => localCell(box, i, j));
  const key = vp + '|' + x + '|' + y;
  if (!sumClues.has(key)) sumClues.set(key, new Map());
  sumClues.get(key).set(p, total);
  return [x, y];
};
for (const box of FREE_BOXES) {
  const vp = boxVar(box);
  for (let p = 1; p <= PIECES.length; p++) {
    const piece = PIECES[p - 1];
    for (const edge of piece.trees) addSum(box, vp, p, edge, 5);
    for (const edge of piece.flowers) {
      const [x, y] = addSum(box, vp, p, edge, 10);
      const key = vp + '|' + x + '|' + y;
      if (!flowerClues.has(key)) flowerClues.set(key, new Set());
      flowerClues.get(key).add(p);
    }
    for (const [i, j] of piece.apples) noteVeto(appleVeto, localCell(box, i, j), vp, p);
  }
}
// The fixed piece's own tree and apple.
for (const edge of CUT_CORNER.trees) {
  const [x, y] = edge.map(([i, j]) => localCell(FIXED_BOX, i, j));
  sumClues.set('fixed|' + x + '|' + y, null);
}
const fixedApples = CUT_CORNER.apples.map(([i, j]) => localCell(FIXED_BOX, i, j));

const clues = [
  ...[...sumClues].flatMap(([key, sums]) => {
    const [head, x, y] = key.split('|');
    if (head === 'fixed') return [new V(x, y)];
    return [new NFA(sumNFA(sums), 'tree-or-sumflower', head, x, y)];
  }),
  ...[...flowerClues].map(([key, set]) => {
    const [vp, x, y] = key.split('|');
    return new NFA(flowerNFA(set), 'sumflower-visit', vp, posA.at(x), posA.at(y));
  }),
  ...[...appleVeto].flatMap(([cell, byBox]) => [...byBox].map(([vp, set]) =>
    new Pair(condKey(set, cellOnPath), 'apple', vp, posA.at(cell)))),
  // The already-placed piece's apple: its cell is on the path, so its counter
  // takes any position value but the off-path sentinel.
  ...fixedApples.map(cell => new Given(posA.at(cell),
    ...Array.from({ length: MOD_A }, (_, n) => n + 2))),
];

// --- Fountains ------------------------------------------------------------
// Each half must meet its partner across the box border it sits on, so a piece
// showing a half on one side needs a neighbour showing the matching half.
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };
const SIDE_STEP = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] };
const faces = (piece, side) => piece.fountains.some(([, s]) => s === side);
const fixedFaces = side => faces(CUT_CORNER, side);
const boxAt = (br, bc) => (br >= 1 && br <= 3 && bc >= 1 && bc <= 3)
  ? { br, bc } : null;

const fountainPairs = [];
for (const box of FREE_BOXES) {
  for (const side of ['right', 'down']) {
    const [dR, dC] = SIDE_STEP[side];
    const nb = boxAt(box.br + dR, box.bc + dC);
    if (!nb) continue;
    if (nb.br === FIXED_BOX.br && nb.bc === FIXED_BOX.bc) continue;
    const key = cached('fount|' + side, () => Pair.fnToKey(
      (p, q) => p >= 1 && p <= PIECES.length && q >= 1 && q <= PIECES.length &&
        faces(PIECES[p - 1], side) === faces(PIECES[q - 1], OPPOSITE[side]), NV));
    fountainPairs.push(new Pair(key, 'fountain', boxVar(box), boxVar(nb)));
  }
}
// A side with no box beyond it -- the grid edge, or the fixed piece, which shows
// no halves -- can only take a piece with no half on that side.
const edgeBoxes = FREE_BOXES.map(box => {
  const allowed = PIECES.map((_, n) => n + 1).filter(p => {
    for (const side of ['left', 'right', 'up', 'down']) {
      const [dR, dC] = SIDE_STEP[side];
      const nb = boxAt(box.br + dR, box.bc + dC);
      const beyond = !nb ? false
        : (nb.br === FIXED_BOX.br && nb.bc === FIXED_BOX.bc)
          ? fixedFaces(OPPOSITE[side]) : null;
      if (beyond === null) continue;
      if (faces(PIECES[p - 1], side) !== beyond) return false;
    }
    return true;
  });
  return new Given(boxVar(box), ...allowed);
});

return [
  shape,
  ...layers,
  ...domains,
  ...oneEach,
  ...fixedHedges,
  ...hedges,
  ...pathShape,
  ...counters,
  ...noCross,
  ...differences,
  ...clues,
  ...fountainPairs,
  ...edgeBoxes,
];
