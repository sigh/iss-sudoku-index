// Title: Horsing Around
// Author: Tim Hasselaar
// Video: https://www.youtube.com/watch?v=JAfswb4nVYU
// Source: https://sudokupad.app/3di357jqj1

// Normal sudoku.
//
// Henry the horse travels by chess knight's move. His journey starts on the
// green circle R9C1, which holds a 1 or a 5; he lands only on cells holding a 1
// or a 5, never on two 5s in a row, never on a cell he has already visited; he
// lands on every 1 in the grid; and the journey ends when he lands on the ninth
// 1. He cannot jump over a blue wall, but "can jump around them if a knight's
// move allows it".
//
// Red parity line: consecutive cells along the line are one odd and one even.
// Minimum cells (the arrows pointing inwards): smaller than every adjacent cell.
// Black dot: the two cells are in ratio 1:2.
//
// Nothing is omitted. The fog is a presentation rule -- it hides clues until
// digits are placed -- and restricts no digit, so it has no constraint.

// The alphabet is widened to 16 so the Var layers can carry journey state; the
// 81 grid cells are pinned back to 1-9 below. Two position counters with coprime
// moduli (lcm 165, more than the 81 cells) are what forbid a closed loop of
// steps beside the journey: ISS has no single-path primitive, and in/out degree
// alone admits one.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                      // counter value for a cell Henry never lands on
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, A->B, B->A
const START_POS = 2;                // counter value of the green circle (position 0)
const START = 'R9C1';               // the green circle
const FAVOURITE = 1, OTHER = 5;     // the two digits Henry may land on

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- The drawn clues ------------------------------------------------------
// The three blue wall strokes, as grid corner coordinates: corner (i,j) is the
// top-left corner of RiCj, so corners run 1..10 in each direction.
const WALLS = [
  [[10, 4], [4, 4], [4, 3]],
  [[7, 4], [7, 3]],
  [[4, 4], [3, 4], [3, 6], [4, 6], [4, 7], [7, 7], [7, 8]],
];
// The four red strokes, cell by cell as drawn. They branch: stroke 2 leaves
// stroke 1 at R7C3 and stroke 3 leaves stroke 2 at R6C4.
const PARITY_LINES = [
  ['R7C2', 'R7C1', 'R8C1', 'R8C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R7C3', 'R6C4', 'R6C5', 'R5C6'],
  ['R6C4', 'R5C4', 'R4C4', 'R4C5', 'R5C5'],
  ['R5C3', 'R5C2', 'R5C1', 'R4C1'],
];
// The two cells ringed by inward-pointing arrows.
const MINIMUM_CELLS = ['R8C2', 'R8C4'];
// The seven black dots, each as the pair of cells it sits between.
const BLACK_DOTS = [
  ['R1C3', 'R2C3'], ['R2C3', 'R2C4'], ['R4C4', 'R4C5'], ['R5C6', 'R5C7'],
  ['R6C4', 'R7C4'], ['R7C4', 'R8C4'], ['R5C8', 'R6C8'],
];
const GIVENS = [['R3C9', 3], ['R7C5', 9], ['R8C7', 3]];

// --- Walls and the knight moves they block --------------------------------
const edgeKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
const blockedEdges = new Set();
for (const poly of WALLS) {
  for (let n = 0; n + 1 < poly.length; n++) {
    const [i0, j0] = poly[n], [i1, j1] = poly[n + 1];
    if (i0 === i1) {          // along a row line: separates the cells above/below
      for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) {
        blockedEdges.add(edgeKey(makeCellId(i0 - 1, j), makeCellId(i0, j)));
      }
    } else {                  // along a column line: separates the cells left/right
      for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) {
        blockedEdges.add(edgeKey(makeCellId(i, j0 - 1), makeCellId(i, j0)));
      }
    }
  }
}

// "Henry can't jump over blue walls, but he can jump around them if a knight's
// move allows it": the move is legal when some route of single orthogonal steps
// runs from its start to its end without crossing a wall, staying inside the
// 2x3 block the move spans -- that block is what "a knight's move allows".
// (Letting the route wander the whole grid instead would block nothing at all:
// the walls leave the grid orthogonally connected, so the clue would be inert.)
const ORTHOGONAL = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const canJump = (a, b) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  const rLo = Math.min(pa.row, pb.row), rHi = Math.max(pa.row, pb.row);
  const cLo = Math.min(pa.col, pb.col), cHi = Math.max(pa.col, pb.col);
  const seen = new Set([a]);
  const queue = [a];
  while (queue.length) {
    const cur = queue.pop();
    if (cur === b) return true;
    const { row, col } = parseCellId(cur);
    for (const [dR, dC] of ORTHOGONAL) {
      const r = row + dR, c = col + dC;
      if (r < rLo || r > rHi || c < cLo || c > cHi) continue;
      const next = makeCellId(r, c);
      if (seen.has(next) || blockedEdges.has(edgeKey(cur, next))) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
};

// --- Step variables -------------------------------------------------------
// One Var per legal knight move, recording whether the journey uses it and in
// which direction; the direction is what the position counters need. The four
// offsets below give each unordered move exactly once.
const KNIGHT_STEPS = [[1, 2], [2, 1], [1, -2], [2, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of KNIGHT_STEPS) {
    const other = graph.step(cell, dR, dC);
    if (!other || !canJump(cell, other)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

// --- Custom machines ------------------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);

// Position counter: a step in use advances the counter by one along the
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

// A step in use may not join two 5s: "never twice in a row".
const noDoubleOtherNFA = cached('dbl', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, other: value === OTHER };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return (s.other && value === OTHER) ? undefined : { done: true };
  },
  accept: s => s.done === true,
}, NV));

// Per-cell journey shape: reads the cell's digit, then its two counters, then
// every step it is an endpoint of. Which digits may be landed on, whether the
// cell is landed on, and its in/out degree are decided here together:
//   - a 1 is always landed on, a 5 may be, no other digit ever is;
//   - a cell off the journey uses no step;
//   - a cell on the journey is entered once and left once, except the green
//     circle (left, never entered) and the final cell (entered, never left) --
//     the journey stops there, so that cell must hold a 1.
// Sum of in-degrees equals sum of out-degrees, so allowing any visited 1 to be
// the final cell still yields exactly one of them.
function cellNFA(incident, isStart) {
  const sig = 'cell|' + (isStart ? 'S' : '-') + '|' +
    incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {                          // the cell's digit
        return { k: 1, fav: value === FAVOURITE, oth: value === OTHER };
      }
      if (s.k === 1) {                          // position mod MOD_A
        if (isStart && value !== START_POS) return undefined;
        const on = value !== OFF;
        if (s.fav && !on) return undefined;
        if (!s.fav && !s.oth && on) return undefined;
        return { k: 2, fav: s.fav, on };
      }
      if (s.k === 2) {                          // position mod MOD_B
        if (isStart && value !== START_POS) return undefined;
        if ((value !== OFF) !== s.on) return undefined;
        return { k: 3, fav: s.fav, on: s.on, in: 0, out: 0 };
      }
      const n = s.k - 3;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, fav: s.fav, on: s.on, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      if (isStart) return s.in === 0 && s.out === 1;
      if (!s.on) return s.in === 0 && s.out === 0;
      return s.in === 1 && (s.out === 1 || s.fav);
    },
  }, NV));
}

// --- Constraint groups ----------------------------------------------------
const layers = [
  posA.toVar('journey position mod ' + MOD_A),
  posB.toVar('journey position mod ' + MOD_B),
  new Var('S', 'knight steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];
// The step Vars need no domain constraint of their own: the per-cell machine
// accepts no value on them but unused / in / out.

const journey = [
  new Given(START, FAVOURITE, OTHER),
  ...gridCells.map(cell => new NFA(
    cellNFA(stepsAt.get(cell), cell === START), 'journey-cell',
    cell, posA.at(cell), posB.at(cell),
    ...stepsAt.get(cell).map(s => s.id))),
  ...steps.flatMap(s => [
    new NFA(counterNFA(MOD_A), 'journey-order', s.id, posA.at(s.a), posA.at(s.b)),
    new NFA(counterNFA(MOD_B), 'journey-order', s.id, posB.at(s.a), posB.at(s.b)),
  ]),
  ...steps.map(s => new NFA(noDoubleOtherNFA, 'no-two-fives', s.id, s.a, s.b)),
];

const parity = PARITY_LINES.map(cells => new Modular(2, ...cells));

// A minimum cell is smaller than each of its orthogonal neighbours;
// GreaterThan reads "earlier cell > later adjacent cell".
const minimums = MINIMUM_CELLS.flatMap(cell => ORTHOGONAL
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(nbr => new GreaterThan(nbr, cell)));

const dots = BLACK_DOTS.map(([a, b]) => new BlackDot(a, b));

return [
  shape,
  ...layers,
  ...domains,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...journey,
  ...parity,
  ...minimums,
  ...dots,
];
