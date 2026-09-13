// Title: Feeding Friendsy
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=U7oPU_hZUeY
// Source: https://sudokupad.app/l50613nsxb

// Normal sudoku. Each box holds a themed character who walks a self-avoiding
// path from a fixed start cell to a fixed target cell, staying inside its own
// box, without visiting a cell twice and without crossing itself. A step may
// be orthogonal, or diagonal through a clear 2x2 corner (no thick wall on any
// of that corner's four edges, and no wall may be crossed at all). A purple
// one-way door may be crossed only from the box's larger digit toward the
// smaller one; the digits either side of a door are unconditionally ordered by
// that fact regardless of whether the path uses the door. A boxed extra-item
// marker (independent of whether its cells are ever visited) requires one of
// its two digits to be double the other.
//
// OMITTED: "every character visits exactly the same sequence of digits, in
// the same order" (MATCHING PATHS) is only partially encoded. What IS encoded:
// every box's path is a real self-avoiding, wall/diagonal-legal route from its
// start to its target (so its digit sequence is some genuine walk of the
// box's own permutation); all nine paths are forced to the same length (tying
// each box's path-length counter together); and the first digit (the nine
// start cells) and the last digit (the nine target cells) are forced equal
// across all nine boxes. What is NOT verified: digit equality at every
// intermediate step of the walk.

// The alphabet is widened to 10 so the per-box position counter can carry an
// OFF sentinel (1) plus nine positions (2..10, one more than the box's own 9
// cells); real grid cells are then pinned back down to 1-9.
const NV = 10;
const OFF = 1, START_POS = 2;             // position-counter values
const UNUSED = 1, FWD = 2, BWD = 3;       // step values

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const pos = graph.makeOverlay('VP');      // per-cell path position, one per box

// --- Box data --------------------------------------------------------------
// r0/c0: 0-indexed box origin. wall: the one cell-pair a thick wall separates
// (or null). door: {tail, head} -- the one-way arrow points at `head` (the
// smaller digit) and may be crossed only tail->head (or null). extra: the two
// cells an extra-item marker (double relationship) sits between (or null).
const BOXES = [
  { n: 1, r0: 0, c0: 0, start: 'R3C1', target: 'R2C3',
    wall: ['R2C2', 'R3C2'], door: { tail: 'R3C1', head: 'R3C2' }, extra: null },
  { n: 2, r0: 0, c0: 3, start: 'R1C6', target: 'R3C6',
    wall: ['R1C6', 'R2C6'], door: null, extra: ['R1C4', 'R2C4'] },
  { n: 3, r0: 0, c0: 6, start: 'R2C7', target: 'R1C9',
    wall: ['R2C7', 'R2C8'], door: { tail: 'R1C8', head: 'R1C9' }, extra: null },
  { n: 4, r0: 3, c0: 0, start: 'R4C2', target: 'R5C1',
    wall: ['R5C2', 'R5C3'], door: null, extra: ['R6C2', 'R6C3'] },
  { n: 5, r0: 3, c0: 3, start: 'R5C5', target: 'R6C4',
    wall: null, door: null, extra: ['R5C6', 'R6C6'] },
  { n: 6, r0: 3, c0: 6, start: 'R6C9', target: 'R4C8',
    wall: ['R4C8', 'R5C8'], door: null, extra: null },
  { n: 7, r0: 6, c0: 0, start: 'R7C3', target: 'R7C2',
    wall: null, door: null, extra: ['R7C1', 'R8C1'] },
  { n: 8, r0: 6, c0: 3, start: 'R8C4', target: 'R9C5',
    wall: null, door: null, extra: null },
  { n: 9, r0: 6, c0: 6, start: 'R9C8', target: 'R8C7',
    wall: null, door: { tail: 'R8C8', head: 'R8C9' }, extra: null },
];

// --- Per-box legal-move geometry --------------------------------------------
// A 3x3 box has 4 interior lattice corners (local (i,j), i,j in {1,2}), each
// bridging a 2x2 sub-square and carrying two diagonal step candidates. A wall
// removes its one orthogonal step and blocks diagonal crossing at every
// interior corner it touches (a wall on any of a corner's four edges blocks
// both diagonals through it).
function wallCorners(box) {
  if (!box.wall) return new Set();
  const [a, b] = box.wall.map(parseCellId);
  const corners = [];
  if (a.row === b.row) {                       // horizontal neighbours -> vertical border
    const col = Math.max(a.col, b.col) - 1;     // 0-indexed border column
    corners.push([a.row - 1 - box.r0, col - box.c0], [a.row - box.r0, col - box.c0]);
  } else {                                      // vertical neighbours -> horizontal border
    const row = Math.max(a.row, b.row) - 1;     // 0-indexed border row
    corners.push([row - box.r0, a.col - 1 - box.c0], [row - box.r0, a.col - box.c0]);
  }
  return new Set(corners.map(([i, j]) => i + ',' + j));
}

function buildBoxGeometry(box) {
  const cellAt = (r, c) => makeCellId(box.r0 + r, box.c0 + c);   // r,c local 1-3
  const wallSet = box.wall ? new Set(box.wall) : null;
  const isWall = (a, b) => !!wallSet && wallSet.has(a) && wallSet.has(b);
  const blocked = wallCorners(box);

  const edges = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      if (c < 3) {
        const a = cellAt(r, c), b = cellAt(r, c + 1);
        if (!isWall(a, b)) edges.push({ a, b });
      }
      if (r < 3) {
        const a = cellAt(r, c), b = cellAt(r + 1, c);
        if (!isWall(a, b)) edges.push({ a, b });
      }
    }
  }
  const corners = [];
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 2; j++) {
      if (blocked.has(i + ',' + j)) continue;
      const nw = cellAt(i, j), ne = cellAt(i, j + 1);
      const sw = cellAt(i + 1, j), se = cellAt(i + 1, j + 1);
      const d1 = { a: nw, b: se }, d2 = { a: ne, b: sw };
      edges.push(d1, d2);
      corners.push([d1, d2]);
    }
  }
  // A door's edge participates like any other, but is oriented tail->head so
  // FWD is the only crossable direction; its domain is restricted below.
  return { edges, corners };
}

// --- Step variables (one per legal directed move, across all boxes) --------
let stepCount = 0;
const allEdges = [];              // {id, a, b, box}
const incidentAt = new Map(gridCells.map(c => [c, []]));
const doorRestrict = [];          // step ids restricted to UNUSED/FWD

for (const box of BOXES) {
  const { edges, corners } = buildBoxGeometry(box);
  const doorKey = box.door && (box.door.tail + '|' + box.door.head);
  for (const e of edges) {
    let a = e.a, b = e.b;
    // Orient the door edge tail->head so FWD is the legal crossing direction.
    if (doorKey && ((a + '|' + b) === doorKey || (b + '|' + a) === doorKey)) {
      a = box.door.tail; b = box.door.head;
    }
    stepCount++;
    const id = 'VS' + stepCount;
    allEdges.push({ id, a, b, box: box.n });
    incidentAt.get(a).push({ id, out: FWD, in: BWD });
    incidentAt.get(b).push({ id, out: BWD, in: FWD });
    if (doorKey && ((a + '|' + b) === doorKey)) doorRestrict.push(id);
  }
}

// --- Compact machines (cached by shape, not by identity) --------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// Position counter: an edge used FWD (a->b) or BWD (b->a) advances the
// position by exactly one along the direction of travel. With both path
// endpoints pinned to distinct cells, this alone forecloses every subtour: a
// closed cycle needs its length to be 0 mod 9 (the counter wraps mod 9), so
// only a 9-cell cycle survives the arithmetic, and a 9-cell cycle would have
// to include both the start (out=1,in=0) and target (in=1,out=0) cells, whose
// degree pattern is incompatible with cycle membership. A single modulus
// suffices at this box size; a bigger maze spanning many cells with only one
// endpoint fixed would need a second, coprime modulus to rule out a
// same-size subtour.
const nextPos = v => 2 + ((v - 2 + 1) % 9);
const counterNFA = cached('counter', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a) ? { done: true } : undefined;
    return s.a === nextPos(value) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Per-cell degree machine: reads this cell's own position first, then every
// incident step. `role` fixes which degree pattern the cell must show; the
// compiled machine only depends on (role, incident count), since every
// incident entry always compares against the same FWD/BWD constants.
function cellNFA(role, n) {
  return cached('cell|' + role + '|' + n, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (role === 'end' && value === OFF) return undefined;   // must be reached
        return { k: 1, vis: value !== OFF };
      }
      const idx = s.k - 1;
      if (idx >= n) return undefined;
      let inC = s.inC || 0, outC = s.outC || 0;
      // The step's in/out labels are always exactly FWD/BWD.
      if (value === BWD) inC++;
      else if (value === FWD) outC++;
      else if (value !== UNUSED) return undefined;
      if (inC > 1 || outC > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, inC, outC };
    },
    accept: s => {
      if (s.k !== 1 + n) return false;
      if (role === 'start') return s.vis && s.inC === 0 && s.outC === 1;
      if (role === 'end') return s.vis && s.inC === 1 && s.outC === 0;
      return s.vis ? (s.inC === 1 && s.outC === 1) : (s.inC === 0 && s.outC === 0);
    },
  }, NV));
}
// NB: the per-step in/out sentinel actually read is determined by which side
// (a or b) of the edge a given cell sits on -- FWD from a's viewpoint means
// "I am the source", so the incident-list entries below carry the concrete
// FWD/BWD tags; the cache key only needs the count because both tags are
// always drawn from the same two constants.

const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);

// A degree-1 cell's path machine only ever reads two cells (its own position
// plus its one incident step), so it is a Pair relation, not a scanning NFA.
function degree1Key(role) {
  return cached('pair|' + role, () => Pair.fnToKey((posVal, stepVal) => {
    if (role === 'end' && posVal === OFF) return false;
    const vis = posVal !== OFF;
    let inC = 0, outC = 0;
    if (stepVal === BWD) inC = 1;
    else if (stepVal === FWD) outC = 1;
    else if (stepVal !== UNUSED) return false;
    if (role === 'start') return vis && inC === 0 && outC === 1;
    if (role === 'end') return vis && inC === 1 && outC === 0;
    return vis ? (inC === 1 && outC === 1) : (inC === 0 && outC === 0);
  }, NV));
}

// --- Assemble constraints ---------------------------------------------------
const cellMachines = gridCells.map(cell => {
  const incident = incidentAt.get(cell);
  const box = BOXES.find(b => b.start === cell || b.target === cell);
  const role = box && box.start === cell ? 'start'
    : box && box.target === cell ? 'end' : 'normal';
  if (incident.length === 1) {
    return new Pair(degree1Key(role), 'friend-path', pos.at(cell), incident[0].id);
  }
  return new NFA(
    cellNFA(role, incident.length), 'friend-path',
    pos.at(cell), ...incident.map(s => s.id));
});

const counters = allEdges.map(e =>
  new NFA(counterNFA, 'path-position', e.id, pos.at(e.a), pos.at(e.b)));

const edgeIdByPair = new Map();
for (const e of allEdges) {
  edgeIdByPair.set(e.a + '|' + e.b, e.id);
  edgeIdByPair.set(e.b + '|' + e.a, e.id);
}
const noCross = [];
for (const box of BOXES) {
  const { corners } = buildBoxGeometry(box);
  for (const [d1, d2] of corners) {
    const id1 = edgeIdByPair.get(d1.a + '|' + d1.b);
    const id2 = edgeIdByPair.get(d2.a + '|' + d2.b);
    noCross.push(new Pair(noCrossKey, 'no-self-crossing', id1, id2));
  }
}

const starts = BOXES.map(box => new Given(pos.at(box.start), START_POS));

const doorDomains = doorRestrict.map(id => new Given(id, UNUSED, FWD));

// The arrow points at the smaller digit, so tail (the wide end) is greater.
const doorInequalities = BOXES.filter(b => b.door).map(b =>
  new GreaterThan(b.door.tail, b.door.head));

const doublers = BOXES.filter(b => b.extra).map(b =>
  new BlackDot(...b.extra));

// MATCHING PATHS, partially: same length (via each box's target position),
// same first digit (the nine start cells) and same last digit (the nine
// target cells). Intermediate steps are NOT tied -- see the header comment.
const lengthMatch = new SameValues(9, ...BOXES.map(b => pos.at(b.target)));
const firstDigitMatch = new SameValues(9, ...BOXES.map(b => b.start));
const lastDigitMatch = new SameValues(9, ...BOXES.map(b => b.target));

const domainRestrictions = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
];

return [
  shape,
  pos.toVar('friend path position'),
  new Var('S', 'friend path steps', stepCount),
  ...domainRestrictions,
  ...starts,
  ...cellMachines,
  ...counters,
  ...noCross,
  ...doorDomains,
  ...doorInequalities,
  ...doublers,
  lengthMatch,
  firstDigitMatch,
  lastDigitMatch,
];
