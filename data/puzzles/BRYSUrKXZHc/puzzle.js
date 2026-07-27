// Title: RAT RUN: 51 Years Later
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=BRYSUrKXZHc
// Source: https://sudokupad.app/b7mlk88xmf

// Every row, every column, and every marked 4x2 box of the 8x8 grid holds each
// of the digits 0, 1, 2 and 3 exactly twice.
// Thick walls run along some cell edges and have to be reconstructed; the wall
// around the maze perimeter is drawn already.
// The digit in a circled cell counts the walls on that cell's own four edges.
// The rat on R1C4 walks to the cupcake on R1C1, stepping between orthogonally
// adjacent cell centres, through no wall, and visiting no cell more than once.
// Diagonal steps are impossible.
// A purple arrow sits on an edge that holds no wall, separates two different
// digits, points at the smaller of them, and may only be walked in the
// direction it points.
// Two digits visited consecutively along the walk sum to at least 3.
//
// Nothing is omitted.
//
// Rows and columns repeat digits, which an ISS main grid cannot do, so the
// answer lives in the row-major VD group and the 1x1 main grid is a pinned
// placeholder contributing only the widened alphabet.

// The 43 pale-orange circles drawn in cells.
const CIRCLES = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5',
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6',
  'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8',
  'R5C1', 'R5C2', 'R5C3', 'R5C5', 'R5C6', 'R5C7', 'R5C8',
  'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C1', 'R7C4', 'R7C7',
  'R8C1', 'R8C3', 'R8C5', 'R8C8',
];
// The 16 purple arrows, each named by the pair of cells its edge separates, in
// the direction it points: from the larger digit to the smaller, and the only
// direction the walk may cross that edge.
const DOORS = [
  ['R1C1', 'R1C2'], ['R1C3', 'R2C3'], ['R1C4', 'R1C5'], ['R1C7', 'R1C6'],
  ['R2C5', 'R2C6'], ['R2C6', 'R3C6'], ['R2C8', 'R2C7'], ['R3C5', 'R3C4'],
  ['R3C7', 'R4C7'], ['R3C8', 'R3C7'], ['R6C2', 'R6C1'], ['R6C4', 'R6C5'],
  ['R7C2', 'R8C2'], ['R7C5', 'R7C6'], ['R8C4', 'R8C5'], ['R8C6', 'R8C7'],
];
const RAT = 'R1C4';       // the red R
const CUPCAKE = 'R1C1';   // the blue C
// Round brown wall spots, the same brown as the perimeter wall, sit on all 49
// interior corners: that is the drawn form of "no diagonal moves are possible
// in this maze", since a diagonal step passes through the corner its two cells
// share and every such corner carries a spot. Hence the orthogonal-only edges
// below, and no spot list is needed.

// Edge states. An edge is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const WALL = 0, OPEN = 1, FWD = 2, BWD = 3;
// Walk position counters. Coprime moduli: a closed cycle of steps beside the
// walk would need a length divisible by both, i.e. 72, and the grid holds only
// 64 cells.
const MOD_A = 9, MOD_B = 8;
const OFF = 0;    // counter value for a cell the rat does not visit
const FIRST = 1;  // counter value of the walk's first cell

// The alphabet is widened to ten values so the larger counter layer fits; the
// 0-9 form keeps the puzzle's own 0-3 digits playable.
const shape = new Shape('1x1', '0-9');
const REF = cellGraph('8x8');
const cells = REF.cells();
const dig = REF.makeOverlay('VD');    // the answer digits
const posA = REF.makeOverlay('VA');   // walk position mod MOD_A
const posB = REF.makeOverlay('VB');   // walk position mod MOD_B

// --- Edges ----------------------------------------------------------------
// One Var per orthogonally adjacent pair of cells, recording whether that edge
// holds a wall and, if not, whether the walk crosses it and in which direction.
// The perimeter is wall throughout, so it gets no variable; each cell's missing
// edges are instead counted as walls by the circle machines below.
const edges = [];
const edgesAt = new Map(cells.map(cell => [cell, []]));
for (const cell of cells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0]]) {
    const other = REF.step(cell, dRow, dCol);
    if (!other) continue;
    const id = 'VE' + (edges.length + 1);
    edges.push({ id, a: cell, b: other });
    edgesAt.get(cell).push({ id, out: FWD, in: BWD });
    edgesAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const edgeIndex = new Map(edges.map(e => [e.a + '|' + e.b, e]));
const edgeBetween = (p, q) => edgeIndex.get(p + '|' + q) || edgeIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Circles --------------------------------------------------------------
// Reads the cell's digit, then each of its edge Vars. The digit is the cell's
// wall budget; the perimeter edges the cell has are already walls, so they come
// off that budget before any Var is read.
const circleNFA = (numEdges, perimeter) => cached(
  'circle|' + numEdges + '|' + perimeter, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        const need = value - perimeter;
        return (need < 0 || need > numEdges) ? undefined : { k: 1, need };
      }
      if (s.k > numEdges) return undefined;
      const need = s.need - (value === WALL ? 1 : 0);
      return need < 0 ? undefined : { k: s.k + 1, need };
    },
    accept: s => s.k === numEdges + 1 && s.need === 0,
  }, shape));
const circles = CIRCLES.map(cell => {
  const incident = edgesAt.get(cell);
  return new NFA(circleNFA(incident.length, 4 - incident.length), 'wall-count',
    dig.at(cell), ...incident.map(e => e.id));
});

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every edge it is an end
// of. A cell the rat does not visit takes the OFF counter in both layers and
// walks none of its edges; any other cell is entered once and left once. The
// rat's own cell is only left, the cupcake only entered.
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
function cellNFA(incident, role) {
  // The values a cell sees depend on whether it is the edge's a or b end, so the
  // machine is keyed on that pattern, not just on the edge count.
  const sig = 'cell|' + role + '|' + incident.map(e => e.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const edge = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in: s.in, out: s.out };
      if (value === edge.in) next.in++;
      else if (value === edge.out) next.out++;
      else if (value !== WALL && value !== OPEN) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      if (!s.vis) return s.in === 0 && s.out === 0;
      return s.in === 1 && s.out === 1;
    },
  }, shape));
}
const walkShape = cells.map(cell => {
  const incident = edgesAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
    posA.at(cell), posB.at(cell), ...incident.map(e => e.id));
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
    if (s.dir !== FWD && s.dir !== BWD) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    return (s.dir === FWD ? value === nextPos(s.a, mod) : s.a === nextPos(value, mod))
      ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const counters = edges.flatMap(e => [
  new NFA(counterNFA(MOD_A), 'walk-order', e.id, posA.at(e.a), posA.at(e.b)),
  new NFA(counterNFA(MOD_B), 'walk-order', e.id, posB.at(e.a), posB.at(e.b)),
]);

// --- Consecutive digits ---------------------------------------------------
// Reads the edge, then the two digits it joins; an edge the walk does not cross
// says nothing about them.
const consecutiveNFA = cached('consecutive', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, walked: value === FWD || value === BWD };
    if (s.k === 1) return { k: 2, walked: s.walked, a: value };
    if (s.k !== 2) return undefined;
    return (!s.walked || s.a + value >= 3) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const consecutive = edges.map(
  e => new NFA(consecutiveNFA, 'walk-sum', e.id, dig.at(e.a), dig.at(e.b)));

// --- Houses and doors -----------------------------------------------------
const houses = [...REF.rows(), ...REF.columns(), ...REF.boxes()].map(
  house => new ContainExact('0_0_1_1_2_2_3_3', ...dig.at(house)));
// An arrow's edge holds no wall and may only be crossed towards the cell it
// points at, so its Var keeps only OPEN and that one direction.
const doors = DOORS.flatMap(([from, to]) => {
  const edge = edgeBetween(from, to);
  return [
    new GreaterThan(dig.at(from), dig.at(to)),
    new Given(edge.id, OPEN, edge.a === from ? FWD : BWD),
  ];
});

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  dig.toVar('Digits'),
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  new Var('E', 'maze edges', edges.length),
];
const domains = [
  dig.makeReplicate(new Given(dig.at(cells[0]), ...range(0, 3))),
  // The edge Vars need no domain of their own: the walk-cell machines accept no
  // value on them but WALL / OPEN / FWD / BWD.
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(cells[0]), ...range(OFF, MOD_B))),
  // The rat's own cell is the first cell of the walk; without this the whole
  // numbering of the walk could rotate freely through the residues.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
];

return [
  shape,
  // The main grid carries no part of the answer.
  ...cellGraph(shape).cells().map((cell, n) => new Given(cell, n)),
  ...layers,
  ...domains,
  ...houses,
  ...circles,
  ...walkShape,
  ...counters,
  ...consecutive,
  ...doors,
];
