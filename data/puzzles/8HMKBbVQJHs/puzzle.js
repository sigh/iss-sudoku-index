// Title: Mousetrap?
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=8HMKBbVQJHs
// Source: https://sudokupad.app/06vt5y9nwu

// Normal sudoku. Mus the mouse walks from R9C2 to the cupcake on R9C5, and
// Felix the cat walks from R8C8 to the escape hole on R4C7. Neither path enters
// a cell twice, crosses itself, or passes through a thick maze wall. A step is
// orthogonal, or diagonal when the 2x2 block it cuts across is free of walls and
// carries no round wall-spot on the corner the two cells share. The two paths
// may share a cell only when that cell's digit is even, and then both paths must
// run straight on through it. A black arrow may be passed only in the direction
// it points, and it points to the smaller of the two digits it sits between.
// Two cells joined by a blackcurrant have one digit double the other; two cells
// joined by a grape differ by at least 5. Neither fruit is exhaustive, so an
// unmarked edge is not constrained. Mus's path inside a box is a thermometer
// read in visiting order, a fresh one for each return to the box, so two
// consecutive Mus cells in the same box increase. Consecutive Felix cells differ
// in parity.
//
// Nothing is omitted.

// The alphabet is widened to 11 so the Var layers can carry the path state; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime moduli: a cycle of steps beside a path would need a length divisible
// by 90, and there are only 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell that animal misses
const FIRST = 2;                // counter value of a path's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the animal walked a->b and BWD b->a, which is what the counters read.
const UNUSED = 1;
const M_FWD = 2, M_BWD = 3, F_FWD = 4, F_BWD = 5;

const MUS_START = 'R9C2', CUPCAKE = 'R9C5';    // the mouse and cupcake emoji
const FELIX_START = 'R8C8', HOLE = 'R4C7';     // the cat and escape-hole emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the fifteen thick purple polylines exactly as drawn, including the
// boundary; SPOTS holds the 44 round purple wall-spots, each on a lattice corner.
const WALLS = [
  [[1, 1], [10, 1], [10, 10], [1, 10], [1, 1]],
  [[10, 2], [9, 2], [9, 3], [8, 3]],
  [[8, 2], [7, 2], [7, 3], [5, 3]],
  [[10, 4], [8, 4]],
  [[7, 5], [7, 4], [4, 4], [4, 3], [3, 3]],
  [[3, 2], [4, 2]],
  [[6, 9], [7, 9], [7, 8]],
  [[9, 6], [9, 7], [8, 7]],
  [[7, 6], [7, 7], [4, 7], [4, 8]],
  [[1, 6], [3, 6]],
  [[5, 2], [6, 2]],
  [[8, 8], [9, 8], [9, 9]],
  [[4, 6], [4, 5], [3, 5]],
  [[3, 7], [3, 8]],
  [[1, 8], [2, 8]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 5], [2, 8], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [3, 7], [3, 8], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8],
  [5, 2], [5, 3], [5, 6], [6, 2], [6, 9], [7, 2], [7, 3], [7, 4], [7, 5],
  [7, 6], [7, 7], [7, 8], [7, 9], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7],
  [8, 8], [9, 2], [9, 3], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
];
// The five black one-way arrows, each written as [from, to] with `to` the cell
// the drawn arrowhead points at. The glyph is the letter V, whose apex points
// down, and SudokuPad's `angle` turns a glyph clockwise: the three arrows drawn
// at angle 0 point down, the two drawn at angle 90 point left.
const DOORS = [
  ['R7C4', 'R7C3'], ['R6C5', 'R7C5'], ['R6C7', 'R7C7'],
  ['R8C2', 'R8C1'], ['R4C1', 'R5C1'],
];
// The drawn fruit, each on the edge between the two cells it joins.
const BLACKCURRANTS = [
  ['R6C3', 'R7C3'], ['R6C9', 'R7C9'], ['R5C9', 'R6C9'], ['R5C4', 'R5C5'],
];
const GRAPES = [['R1C1', 'R1C2'], ['R7C5', 'R8C5'], ['R4C7', 'R5C7']];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const musA = graph.makeOverlay('VA');    // Mus position mod MOD_A
const musB = graph.makeOverlay('VB');    // Mus position mod MOD_B
const felA = graph.makeOverlay('VC');    // Felix position mod MOD_A
const felB = graph.makeOverlay('VD');    // Felix position mod MOD_B

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1), 'V|i|j' from (i, j) to (i+1, j).
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

// --- Step variables -------------------------------------------------------
// One Var per legal king move; moves the maze forbids get no variable at all.
// Both animals share the layer, so no edge can carry both of them. That is not
// an extra rule: at a shared cell each path must run straight on through, so two
// paths along one edge would have to stay collinear cell by cell out to both
// ends of both paths, and the two paths start on different cells.
const ALL_DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1],
                  [0, 1], [1, -1], [1, 0], [1, 1]];   // index d, opposite 7 - d
const dirIndex = (dRow, dCol) =>
  ALL_DIRS.findIndex(([r, c]) => r === dRow && c === dCol);
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    const d = dirIndex(dRow, dCol);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push(
      { id, mOut: M_FWD, mIn: M_BWD, fOut: F_FWD, fIn: F_BWD, dir: d });
    stepsAt.get(other).push(
      { id, mOut: M_BWD, mIn: M_FWD, fOut: F_BWD, fIn: F_FWD, dir: 7 - d });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) =>
  stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's four counters, then every step it is an end
// of. A cell an animal misses takes the OFF counter in both of that animal's
// layers and uses none of that animal's step values; a cell it visits is entered
// once and left once. The four named cells are the ends of a path, so they are
// only left or only entered -- and, since a crossing must continue on through
// the cell, the other animal cannot stand on them at all.
const ROLE_OF = new Map([[MUS_START, 'mus-start'], [CUPCAKE, 'mus-end'],
[FELIX_START, 'felix-start'], [HOLE, 'felix-end']]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.mOut).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, m: value !== OFF };
      if (s.k === 1) return (value !== OFF) === s.m ? { k: 2, m: s.m } : undefined;
      if (s.k === 2) return { k: 3, m: s.m, f: value !== OFF };
      if (s.k === 3) {
        if ((value !== OFF) !== s.f) return undefined;
        return { k: 4, m: s.m, f: s.f, mi: 0, mo: 0, fi: 0, fo: 0 };
      }
      const n = s.k - 4;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, m: s.m, f: s.f,
        mi: s.mi, mo: s.mo, fi: s.fi, fo: s.fo,
      };
      if (value === step.mIn) next.mi++;
      else if (value === step.mOut) next.mo++;
      else if (value === step.fIn) next.fi++;
      else if (value === step.fOut) next.fo++;
      else if (value !== UNUSED) return undefined;
      if (next.mi > 1 || next.mo > 1 || next.fi > 1 || next.fo > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 4 + incident.length) return false;
      const mus = role === 'mus-start' ? (s.m && s.mo === 1 && s.mi === 0)
        : role === 'mus-end' ? (s.m && s.mi === 1 && s.mo === 0)
          : s.m ? (s.mi === 1 && s.mo === 1) : (s.mi === 0 && s.mo === 0);
      const fel = role === 'felix-start' ? (s.f && s.fo === 1 && s.fi === 0)
        : role === 'felix-end' ? (s.f && s.fi === 1 && s.fo === 0)
          : s.f ? (s.fi === 1 && s.fo === 1) : (s.fi === 0 && s.fo === 0);
      const alone = (role === 'mus-start' || role === 'mus-end') ? !s.f
        : (role === 'felix-start' || role === 'felix-end') ? !s.m : true;
      return mus && fel && alone;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell', musA.at(cell),
    musB.at(cell), felA.at(cell), felB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from the animal's own
// cell is always possible, so "the arriving cell's counter is the leaving cell's
// plus one" adds nothing on the path itself; what it buys is that a closed cycle
// of steps beside the path would need a length divisible by MOD_A and by MOD_B,
// i.e. by 90, and there are only 81 cells. Degree alone cannot rule one out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = (mod, fwd, bwd) => cached(`counter|${mod}|${fwd}`, () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, dir: value };
      if (s.k === 1) return { k: 2, dir: s.dir, a: value };
      if (s.k !== 2) return undefined;
      if (s.dir !== fwd && s.dir !== bwd) return { done: true };
      if (s.a === OFF || value === OFF) return undefined;
      if (s.dir === fwd) {
        return value === nextPos(s.a, mod) ? { done: true } : undefined;
      }
      return s.a === nextPos(value, mod) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A, M_FWD, M_BWD), 'mus-order',
    s.id, musA.at(s.a), musA.at(s.b)),
  new NFA(counterNFA(MOD_B, M_FWD, M_BWD), 'mus-order',
    s.id, musB.at(s.a), musB.at(s.b)),
  new NFA(counterNFA(MOD_A, F_FWD, F_BWD), 'felix-order',
    s.id, felA.at(s.a), felA.at(s.b)),
  new NFA(counterNFA(MOD_B, F_FWD, F_BWD), 'felix-order',
    s.id, felB.at(s.a), felB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other at its middle corner. A path
// may not cross itself, and the one crossing the two paths are allowed is a
// shared cell -- a corner is not a cell -- so at most one of the pair is walked.
const noCrossKey = cached('no-crossing',
  () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV));
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepBetween(cell, diag);
  const d2 = stepBetween(right, down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
}

// --- Crossings ------------------------------------------------------------
// A cell both animals visit is a crossing, so its digit is even and each animal
// enters and leaves it in opposite directions. Each machine below reads the two
// animals' MOD_A counters for the cell first, which is how it learns whether the
// cell is shared at all.
const crossEvenKey = cached('crossing-even', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, m: value !== OFF };
    if (s.k === 1) return { k: 2, shared: s.m && value !== OFF };
    if (s.k !== 2) return undefined;
    return (!s.shared || value % 2 === 0) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
// `dir` is the direction of a step as seen from this cell, and ALL_DIRS is
// ordered so that d and 7 - d are opposites. `d` holds the first direction this
// animal was seen on; 8 marks "two already read", so a third direction fails.
function straightNFA(incident, animal) {
  const mine = s => animal === 'mus' ? [s.mIn, s.mOut] : [s.fIn, s.fOut];
  const sig = 'straight|' + incident.map(s => mine(s)[1] + ':' + s.dir).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, m: value !== OFF };
      if (s.k === 1) return { k: 2, shared: s.m && value !== OFF, d: -1, ok: false };
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const [vIn, vOut] = mine(step);
      let { d, ok } = s;
      if (value === vIn || value === vOut) {
        if (d < 0) { d = step.dir; } else { ok = step.dir === 7 - d; d = 8; }
      }
      return { k: s.k + 1, shared: s.shared, d, ok };
    },
    accept: s => s.k === 2 + incident.length && (!s.shared || s.ok),
  }, NV));
}
const crossings = gridCells.filter(cell => !ROLE_OF.has(cell)).flatMap(cell => {
  const incident = stepsAt.get(cell);
  const heads = [musA.at(cell), felA.at(cell)];
  return [
    new NFA(crossEvenKey, 'crossing-even', ...heads, cell),
    new NFA(straightNFA(incident, 'mus'), 'crossing-straight',
      ...heads, ...incident.map(s => s.id)),
    new NFA(straightNFA(incident, 'felix'), 'crossing-straight',
      ...heads, ...incident.map(s => s.id)),
  ];
});

// --- One-way doors --------------------------------------------------------
// The arrow points at the smaller digit, and its edge may only be walked the way
// the arrow points, which drops the two reverse values from that step variable.
const doorInequalities = DOORS.map(([from, to]) => new GreaterThan(from, to));
const doorDirections = DOORS.map(([from, to]) => {
  const step = stepBetween(from, to);
  return step.a === from
    ? new Given(step.id, UNUSED, M_FWD, F_FWD)
    : new Given(step.id, UNUSED, M_BWD, F_BWD);
});

// --- Digits along the two paths -------------------------------------------
// One machine per step: a Mus step whose two cells share a box climbs, because
// Mus's run through a box is a thermometer read in visiting order, and a Felix
// step changes parity. A step neither animal walks says nothing.
const boxOf = new Map();
graph.boxes().forEach((box, n) => box.forEach(cell => boxOf.set(cell, n)));
const stepDigitNFA = sameBox => cached('step-digits|' + sameBox, () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, dir: value };
      if (s.k === 1) return { k: 2, dir: s.dir, a: value };
      if (s.k !== 2) return undefined;
      const { dir, a } = s, b = value;
      if (dir === M_FWD) return (!sameBox || a < b) ? { done: true } : undefined;
      if (dir === M_BWD) return (!sameBox || b < a) ? { done: true } : undefined;
      if (dir === F_FWD || dir === F_BWD) {
        return (a % 2) !== (b % 2) ? { done: true } : undefined;
      }
      return { done: true };
    },
    accept: s => s.done === true,
  }, NV));
const stepDigits = steps.map(s => new NFA(
  stepDigitNFA(boxOf.get(s.a) === boxOf.get(s.b)), 'path-digits', s.id, s.a, s.b));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  musA.toVar('Mus position mod ' + MOD_A),
  musB.toVar('Mus position mod ' + MOD_B),
  felA.toVar('Felix position mod ' + MOD_A),
  felB.toVar('Felix position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // The MOD_A layers need no domain of their own: the sentinel plus MOD_A
  // residues is exactly the 11-value alphabet.
  musB.makeReplicate(new Given(musB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  felB.makeReplicate(new Given(felB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept no
  // value on them but unused / in / out, for either animal.
  // Each animal's own cell is the first cell of its path, which also stops the
  // whole numbering from rotating.
  new Given(musA.at(MUS_START), FIRST), new Given(musB.at(MUS_START), FIRST),
  new Given(felA.at(FELIX_START), FIRST), new Given(felB.at(FELIX_START), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y)),
  ...GRAPES.map(([x, y]) => new Whisper(5, x, y)),
  ...doorInequalities,
  ...doorDirections,
  ...pathShape,
  ...counters,
  ...noCross,
  ...crossings,
  ...stepDigits,
];
