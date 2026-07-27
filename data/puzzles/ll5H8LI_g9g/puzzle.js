// Title: RAT RUN 34: On Reflection
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ll5H8LI_g9g
// Source: https://sudokupad.app/udyn0tghcs

// Normal sudoku, with no given digits. Two rats stand on R8C1 and R9C2 and each
// walks to a cupcake, the two cupcakes being R1C8 and R2C9. Neither walk visits a
// cell twice, the two walks share no cell, and neither crosses itself or the
// other. A step joins two cell centres and passes through no thick maze wall; it
// is orthogonal, or diagonal when the 2x2 block it cuts across has no wall
// between any two of its four cells and no round wall-spot on the corner the two
// cells share.
// A grey camera's digit is the sum of the digits of the visited cells its lens
// points at, stopping at the first wall; a camera cell may not be entered.
// Two digits joined by a blackcurrant have one double the other; two joined by a
// redcurrant are one odd and one even; two joined by a grape differ by at least
// 5.
// Every 1, 2 and 3 in the grid is visited; no 7, 8 or 9 is visited.
// The two walks are perfect reflections of each other across the positive
// diagonal, drawn as the thin pink line through R9C1 .. R1C9.
//
// Nothing is omitted.

// Only one walk carries a variable: the reflection rule makes the other its
// mirror image, and the two walks are interchangeable, so the modelled walk is
// the one lying above the pink diagonal. Both consequences used below follow from
// the reflection rule together with "the paths must not ... share cells":
//  * No walk enters a cell of the pink diagonal. Such a cell is its own mirror
//    image, so one walk entering it puts it on both walks.
//  * No walk has cells on both sides of the pink diagonal. Crossing sides in one
//    king step means a step from some X with row+col = 9 to X's own mirror image
//    (row+col = 11), which again puts two cells on both walks.
// So each walk stays strictly on its own side, and the walk from R8C1 (above the
// diagonal) must therefore reach the cupcake above it, R1C8. A cell below the
// diagonal is visited exactly when its mirror image above is, which is how the
// camera and low/high-digit rules below read the far side. Mirror-image segments
// lie on opposite sides of the pink line, so the two walks cannot cross each
// other and only self-crossing needs encoding.

// Counters run modulo these; a closed cycle of steps beside the walk would need a
// length divisible by both, i.e. 56, and the walk graph holds 33 cells.
const MOD_A = 8, MOD_B = 7;
const OFF = 1;                  // counter value for an unvisited cell
const FIRST = 2;                // counter value of the walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;

// --- The drawn maze -------------------------------------------------------
const RATS = ['R8C1', 'R9C2'];            // the two rat emoji
const CUPCAKES = ['R1C8', 'R2C9'];        // the two cupcake emoji
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the thick turquoise strokes exactly as drawn, the first of them the
// boundary loop, which separates no two grid cells.
const WALLS = [
  [[2, 10], [10, 10], [10, 1], [1, 1], [1, 10], [2, 10]],
  [[6, 2], [7, 2]],
  [[4, 4], [4, 5]],
  [[6, 7], [7, 7]],
  [[9, 4], [9, 5]],
  [[3, 3], [4, 3]],
  [[5, 3], [6, 3]],
  [[8, 5], [8, 6]],
  [[2, 5], [3, 5]],
  [[6, 8], [6, 9]],
  [[8, 7], [8, 8]],
  [[3, 6], [4, 6]],
  [[5, 7], [5, 8]],
];
// The 24 round turquoise wall-spots, each on a lattice corner; here each one is
// also an end-cap of one of the twelve strokes above.
const SPOTS = [
  [2, 5], [3, 3], [3, 5], [3, 6], [4, 3], [4, 4], [4, 5], [4, 6], [5, 3],
  [5, 7], [5, 8], [6, 2], [6, 3], [6, 7], [6, 8], [6, 9], [7, 2], [7, 7],
  [8, 5], [8, 6], [8, 7], [8, 8], [9, 4], [9, 5],
];
// The six grey cameras, each with the (dRow, dCol) its lens points along: the
// three above the pink diagonal look down, their three mirror images look left.
const CAMERAS = [
  ['R3C1', 1, 0], ['R1C4', 1, 0], ['R6C3', 1, 0],
  ['R7C4', 0, -1], ['R9C7', 0, -1], ['R6C9', 0, -1],
];
// The drawn fruit, each named by the two cells its edge separates.
const BLACKCURRANTS = [['R7C1', 'R7C2'], ['R8C3', 'R9C3']];
const REDCURRANTS = [['R8C1', 'R8C2'], ['R8C2', 'R9C2'], ['R2C4', 'R3C4']];
const GRAPES = [['R6C7', 'R6C8'], ['R5C4', 'R5C5'], ['R5C5', 'R6C5']];

const shape = new Shape('9x9');
const NV = 9;
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B

// Split the wall polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and so separates R(i-1)Cj from RiCj; 'V|i|j' runs from
// (i, j) to (i+1, j) and separates RiC(j-1) from RiCj.
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

// A diagonal step passes through the one corner its two cells share. It needs a
// 2x2 space, whose only internal edges are the four wall slots meeting at that
// corner, and it may not pass through a wall-spot.
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

// Reflection in the pink diagonal, and the side of it a cell lies on.
const mirror = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - col, 10 - row);
};
const aboveDiagonal = cell => {
  const { row, col } = parseCellId(cell);
  return row + col < 10;
};
// The rat and the cupcake on the modelled side of the pink diagonal.
const WALK_START = RATS.find(aboveDiagonal);
const WALK_END = CUPCAKES.find(aboveDiagonal);

// The walk graph: the cells above the pink diagonal, less the camera cells,
// which may not be entered.
const cameraCells = new Set(CAMERAS.map(([cell]) => cell));
const walkCells = gridCells.filter(
  cell => aboveDiagonal(cell) && !cameraCells.has(cell));
const walkCellSet = new Set(walkCells);

// The var holding whether a cell is visited, or null for a cell no walk can
// reach: a camera cell, or a cell of the pink diagonal, which is its own mirror.
const visitedVar = cell => {
  const above = aboveDiagonal(cell) ? cell : mirror(cell);
  return walkCellSet.has(above) ? posA.at(above) : null;
};

// --- Step variables -------------------------------------------------------
// One Var per legal king move between two walk cells, recording whether the walk
// uses it and in which direction; a move the maze forbids gets no variable at
// all, which is how the walls and wall-spots are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(walkCells.map(cell => [cell, []]));
for (const cell of walkCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !walkCellSet.has(other)) continue;
    if (!stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. An unvisited cell takes the OFF counter in both layers and uses no step;
// any other cell is entered once and left once. The rat's own cell is only left,
// its cupcake only entered.
const ROLE_OF = new Map([[WALK_START, 'start'], [WALK_END, 'end']]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, ins: 0, outs: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, ins: s.ins, outs: s.outs };
      if (value === step.in) next.ins++;
      else if (value === step.out) next.outs++;
      else if (value !== UNUSED) return undefined;
      if (next.ins > 1 || next.outs > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'start') return s.vis && s.outs === 1 && s.ins === 0;
      if (role === 'end') return s.vis && s.ins === 1 && s.outs === 0;
      if (!s.vis) return s.ins === 0 && s.outs === 0;
      return s.ins === 1 && s.outs === 1;
    },
  }, NV));
}
const walkShape = walkCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
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

// The two diagonals of a 2x2 block cross each other.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
const noCross = walkCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1, d2)] : [];
});

// --- Cameras --------------------------------------------------------------
// The lens sees along its direction until a wall stops it.
const cameraRay = (cell, dRow, dCol) => {
  const seen = [];
  for (let cur = cell; stepAllowed(cur, dRow, dCol);) {
    const next = graph.step(cur, dRow, dCol);
    if (!next) break;
    seen.push(next);
    cur = next;
  }
  return seen;
};
// Reads the camera's own digit, then, for each cell in view that any walk could
// reach, that cell's digit followed by its visited counter. A visited cell's
// digit comes off the total, which must finish at zero; cells in view that no
// walk can reach are left out of the machine, as they can never contribute.
const cameraNFA = length => cached('camera|' + length, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, left: value };
    const n = s.k - 1;
    if (n >= 2 * length) return undefined;
    if (n % 2 === 0) return { k: s.k + 1, left: s.left, digit: value };
    if (value === OFF) return { k: s.k + 1, left: s.left };
    return s.left >= s.digit ? { k: s.k + 1, left: s.left - s.digit } : undefined;
  },
  accept: s => s.k === 1 + 2 * length && s.left === 0,
}, NV));
const cameras = CAMERAS.map(([cell, dRow, dCol]) => {
  const view = cameraRay(cell, dRow, dCol)
    .map(seen => [seen, visitedVar(seen)]).filter(([, v]) => v !== null);
  return new NFA(cameraNFA(view.length), 'camera-sum', cell, ...view.flat());
});

// --- Low and high digits --------------------------------------------------
const lowHighKey = Pair.fnToKey(
  (digit, pos) => (digit <= 3 ? pos !== OFF : digit <= 6 || pos === OFF), NV);
const lowHigh = gridCells.map(cell => {
  const seen = visitedVar(cell);
  // A cell no walk can reach is never visited, so it holds no low digit.
  return seen === null ? new Given(cell, 4, 5, 6, 7, 8, 9)
    : new Pair(lowHighKey, 'low-visited-high-not', cell, seen);
});

// --- Fruit ----------------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(pair => new BlackDot(...pair));
// Modular(2) over a two-cell edge is exactly one odd digit and one even digit.
const redcurrants = REDCURRANTS.map(pair => new Modular(2, ...pair));
const grapes = GRAPES.map(pair => new Whisper(5, ...pair));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the 9 values.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // Cells off the walk graph are never visited, in either layer.
  ...gridCells.filter(cell => !walkCellSet.has(cell)).flatMap(cell => [
    new Given(posA.at(cell), OFF), new Given(posB.at(cell), OFF)]),
  // The rat's own cell is the first cell of its walk; without this the whole
  // numbering of the walk could rotate freely through the residues.
  new Given(posA.at(WALK_START), FIRST), new Given(posB.at(WALK_START), FIRST),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out.
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...cameras,
  ...lowHigh,
  ...blackcurrants,
  ...redcurrants,
  ...grapes,
];
