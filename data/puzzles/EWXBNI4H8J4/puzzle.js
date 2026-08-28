// Title: Pac-Man Returns!
// Author: Stavros
// Video: https://www.youtube.com/watch?v=EWXBNI4H8J4
// Source: https://cracking-the-cryptic.web.app/sudoku/R9h8LBHngd

// Normal sudoku (default row/col/box). Path: starting at the yellow cell
// R7C5, a 1-cell-wide path through cell centres that alternates between
// circles and coloured squares (beginning with yellow) until all four
// circles and all four other coloured squares are visited; it may not enter
// a grey wall cell, may not touch itself orthogonally (diagonal touch is
// fine), and may not cross itself. Row 5 and column 5 wrap around
// (R5C1<->R5C9, R1C5<->R9C5), Pac-Man style. Circles hold four different odd
// digits; the four non-yellow coloured squares hold four different even
// digits. Each wall cell's own digit equals the count of path cells among
// the (up to) 8 cells around it.
//
// "Cannot cross itself" needs no separate encoding: each cell is either on
// the path or not, so the model already forbids revisiting a cell.
//
// Wraparound only grants the path an extra pair of usable edges (movement),
// it is not drawn as an adjacency anywhere on the board, so the no-touch
// rule -- which is about cells that are geometrically next to each other --
// is not applied to the two wrap edges; see `TOUCH_EDGES` below.

// The alphabet is widened from 9 to 10 so the two path-position counter
// layers can carry an off-path sentinel. Grid cells are pinned back to 1-9
// below. Two coprime-modulus counters (mod 8, mod 9; lcm 72) are what forbid
// a stray path loop elsewhere on the grid, since a used-step subgraph with a
// single source and every other cell in/out-degree <=1 can only branch off
// into a separate closed loop, and a loop of length L only keeps consistent
// counters if L is 0 mod both moduli. The free (non-wall) cell count is
// 81-12=69 < 72, so no loop of legal length can satisfy both at once.
const NV = 10;
const MOD_A = 8, MOD_B = 9;
const OFF = 1;                     // counter value for a cell off the path
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a
const START_POS = 2;               // counter value pinned at the start cell

// --- Drawn geometry --------------------------------------------------------
// Wall cells (drawn as 12 grey 1x1 squares).
const WALLS = ['R2C2', 'R2C5', 'R2C8', 'R5C8', 'R5C6', 'R6C5',
  'R5C4', 'R5C2', 'R8C2', 'R8C4', 'R8C6', 'R8C8'];
// Circle cells (drawn as 4 grey circles).
const CIRCLES = ['R1C4', 'R2C7', 'R8C3', 'R9C7'];
// Coloured square cells, excluding the yellow start (drawn as red/blue/
// green/purple 1x1 squares).
const SQUARES = ['R9C5', 'R6C8', 'R5C5', 'R3C2'];
// Yellow start cell (drawn as a yellow 1x1 square), also the given digit 2.
const START = 'R7C5';
const MARKED_ON = [...CIRCLES, ...SQUARES];
const WALL_SET = new Set(WALLS);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Step variables ---------------------------------------------------
// One Var per usable orthogonal adjacency between two non-wall cells,
// recording whether the path uses it and in which direction (needed by the
// position counters). Built once per undirected edge (right/down avoids
// duplicates), plus the two hand-added wraparound edges.
const STEP_DIRS = [[0, 1], [1, 0]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const addStep = (a, b) => {
  const id = 'VS' + (steps.length + 1);
  steps.push({ id, a, b });
  stepsAt.get(a).push({ id, out: FWD, in: BWD });
  stepsAt.get(b).push({ id, out: BWD, in: FWD });
};
for (const cell of gridCells) {
  if (WALL_SET.has(cell)) continue;
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other || WALL_SET.has(other)) continue;
    addStep(cell, other);
  }
}
// Wraparound tunnels (Pac-Man style): row 5 wraps left-right, column 5 wraps
// top-bottom. Neither wrap endpoint is a wall.
const WRAP_EDGES = [addStep('R5C1', 'R5C9'), addStep('R1C5', 'R9C5')];
// Every other step is a geometrically real adjacency, so the no-touch rule
// applies to it.
const TOUCH_EDGES = steps.filter(s => !WRAP_EDGES.includes(s));

// --- Custom keys and machines ----------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);

// Position counter: an in-use step advances the counter by one along the
// direction of travel, so a closed subtour's length would have to be 0 mod
// the modulus; lcm(8,9)=72 exceeds the 69-cell free area, so no subtour of
// legal length can satisfy both layers at once (see header).
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

// No-touch: reject an edge between two orthogonally-adjacent non-wall cells
// that are both on the path but not consecutive there (step left unused).
const touchNFA = cached('touch', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, step: value };
    if (s.k === 1) return { k: 2, step: s.step, aOn: value !== OFF };
    if (s.k !== 2) return undefined;
    const bOn = value !== OFF;
    if (s.step === UNUSED && s.aOn && bOn) return undefined;
    return { done: true };
  },
  accept: s => s.done === true,
}, NV));

// Per-cell path shape for an ordinary (non-start) cell. Reads its two
// position counters (agreeing on-path/off-path) then every incident step:
// off the path needs no step; on the path is entered once and left at most
// once (in=1,out=1 mid-path, in=1,out=0 at the far end -- there can only be
// one such end, since every other on-path cell forwards its one in-edge to
// exactly one out-edge, and the sole cell allowed in=0 is the pinned start).
function cellNFA(incident) {
  const sig = 'cell|' + incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0 };
      }
      if (s.k - 2 >= incident.length) return undefined;
      const step = incident[s.k - 2];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (!s.vis) return s.in === 0 && s.out === 0;
      return s.in === 1 && (s.out === 1 || s.out === 0);
    },
  }, NV));
}

// Per-cell path shape for the pinned start cell: always on the path, left
// exactly once, entered never.
function startCellNFA(incident) {
  const sig = 'start|' + incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0, in: 0, out: 0 },
    transition: (s, value) => {
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === 0 && s.out === 1,
  }, NV));
}

// Wall cell: its own digit must equal the count of on-path cells among its
// (always exactly 8, since every wall is interior) surrounding cells.
const wallNeighbourNFA = cached('wall8', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, target: value, count: 0 };
    if (s.k <= 8) return { k: s.k + 1, target: s.target, count: s.count + (value !== OFF ? 1 : 0) };
    return undefined;
  },
  accept: s => s.k === 9 && s.count === s.target,
}, NV));

// --- Layers and domains -----------------------------------------------
const posAVar = posA.toVar('path position mod ' + MOD_A);
const posBVar = posB.toVar('path position mod ' + MOD_B);
const layers = [
  posAVar,
  posBVar,
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];
// Wall cells never carry the path.
const wallOff = WALLS.flatMap(cell => [
  new Given(posA.at(cell), OFF), new Given(posB.at(cell), OFF)]);
// Marked (circle/square) cells are always on the path, anywhere but off.
const markedOn = MARKED_ON.flatMap(cell => [
  new Given(posA.at(cell), ...Array.from({ length: MOD_A }, (_, n) => n + 2)),
  new Given(posB.at(cell), ...Array.from({ length: MOD_B }, (_, n) => n + 2)),
]);
// The start cell anchors the numbering (position 0 in both layers).
const startPinned = [new Given(posA.at(START), START_POS), new Given(posB.at(START), START_POS)];

// --- Path shape, order and no-touch -----------------------------------
const pathShape = gridCells
  .filter(cell => !WALL_SET.has(cell))
  .map(cell => {
    const incident = stepsAt.get(cell);
    if (cell === START) {
      return new NFA(startCellNFA(incident), 'path-cell', ...incident.map(s => s.id));
    }
    return new NFA(cellNFA(incident), 'path-cell', posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
  });
const order = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);
const noTouch = TOUCH_EDGES.map(s => new NFA(touchNFA, 'no-touch', s.id, posA.at(s.a), posA.at(s.b)));

// --- Walls, circles, squares --------------------------------------------
const wallCounts = WALLS.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      neighbours.push(posAVar.cell(row + dr, col + dc));
    }
  }
  return new NFA(wallNeighbourNFA, 'wall-count', cell, ...neighbours);
});
const circleClue = [
  new Given('R1C4', 1, 3, 5, 7, 9), new Given('R2C7', 1, 3, 5, 7, 9),
  new Given('R8C3', 1, 3, 5, 7, 9), new Given('R9C7', 1, 3, 5, 7, 9),
  new AllDifferent(...CIRCLES),
];
const squareClue = [
  new Given('R9C5', 2, 4, 6, 8), new Given('R6C8', 2, 4, 6, 8),
  new Given('R5C5', 2, 4, 6, 8), new Given('R3C2', 2, 4, 6, 8),
  new AllDifferent(...SQUARES),
];

// --- Givens (printed digits) --------------------------------------------
const givens = [
  new Given('R1C7', 5), new Given('R2C3', 2), new Given('R4C3', 6),
  new Given('R6C9', 5), new Given('R7C5', 2), new Given('R7C8', 9),
  new Given('R7C9', 1), new Given('R8C7', 8), new Given('R9C2', 2),
];

return [
  shape,
  ...layers,
  ...domains,
  ...wallOff,
  ...markedOn,
  ...startPinned,
  ...pathShape,
  ...order,
  ...noTouch,
  ...wallCounts,
  ...circleClue,
  ...squareClue,
  ...givens,
];
