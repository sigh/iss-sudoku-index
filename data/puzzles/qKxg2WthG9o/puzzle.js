// Title: RAT RUN 19: Brainwaves
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=qKxg2WthG9o
// Source: https://sudokupad.app/oj8y6yrx16

// Nine letters (not stated) fill the grid, one per row/column/box, and are
// deduced from the CUE CARD and TEST rules below rather than given. Finkz
// walks a path from R6C1 to R5C6, orthogonally or diagonally through an open
// 2x2 space, never through a thick maze wall or a round wall-spot corner,
// never revisiting or crossing a cell, and visiting all 11 monitor cells.
// CUE CARDS: each pink card sits on the edge between two cells, and both
// cells' letters appear in the card's printed word. TEST CONSTRAINT: 3x3 box
// borders cut the path into segments, and any segment of more than one cell
// must be visited in alphabetical order.
//
// Nothing is omitted. DYNAMIC FOG is solving UI, not a final-grid rule.

// The alphabet is widened to 16 (CellGeometry.MAX_SIZE) so the Var layers can
// carry path state and position counters; the 81 grid cells are pinned back
// to 1-9. A letter rank (1-26, a=1..z=26) does not fit in 16 either, so it is
// split as 13*(H-1)+L with H in {1,2}, L in 1..13 -- an exact partition of
// 1..26, unlike the 9*(H-1)+L split used elsewhere for a 1..27 range.
const NV = 16;
const RANK_HALF = 13;
const joinRank = (h, l) => RANK_HALF * (h - 1) + l;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
// A split-rank NFA must not carry a raw Hi/Lo read as state: values outside
// the intended {1,2}/1..13 range are impossible (Given pins the domain
// elsewhere) but the compiler still enumerates all NV=16 branches per read,
// so an uncapped (h, l) pair multiplies out past the 4096-state limit.
// Clamping every read collapses the dead branches onto a live one first.
const clampHi = v => Math.min(v, 2);
const clampLo = v => Math.min(v, RANK_HALF);

const MOD_A = 15, MOD_B = 11;      // coprime; lcm 165 > 81 cells
const OFF = 1;                     // counter value for a cell the path misses
const FIRST = 2;                   // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const RAT_CELL = 'R6C1';
const CUPCAKE = 'R5C6';

// --- The drawn maze --------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj; the lattice runs 1..10.
// WALLS holds the 13 thick brown polylines exactly as drawn (including the
// grid boundary); SPOTS holds the 37 round brown wall-spots, each on a
// lattice corner.
const WALLS = [
  [[4, 2], [4, 1], [10, 1], [10, 10], [1, 10], [1, 1], [4, 1]],
  [[7, 1], [7, 2]],
  [[10, 4], [9, 4]],
  [[5, 10], [5, 9]],
  [[4, 4], [4, 5]],
  [[6, 8], [6, 7], [4, 7], [4, 8]],
  [[6, 7], [6, 6]],
  [[4, 7], [3, 7]],
  [[5, 2], [6, 2], [6, 3]],
  [[6, 4], [7, 4], [7, 5]],
  [[7, 6], [7, 7], [9, 7], [9, 8]],
  [[7, 3], [8, 3]],
  [[3, 4], [3, 5]],
];
const SPOTS = [
  [2, 5], [2, 6], [2, 7], [2, 8], [3, 4], [3, 5], [3, 6],
  [3, 7], [3, 8], [4, 2], [4, 3], [4, 4], [4, 5], [4, 8],
  [4, 9], [5, 2], [5, 9], [6, 2], [6, 3], [6, 4], [6, 6],
  [6, 8], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
  [7, 8], [7, 9], [8, 3], [8, 4], [8, 6], [9, 3], [9, 4],
  [9, 7], [9, 8],
];

// The 11 blue brainwave monitors, seen through the fog as a scattered pair of
// colour clusters that a self-triggering fog-reveal entry confirms are one set.
const MONITORS = [
  'R1C3', 'R2C6', 'R2C7', 'R3C4', 'R3C8', 'R4C5',
  'R4C8', 'R5C2', 'R6C6', 'R6C8', 'R7C5',
];

// The 18 pink cue cards, each drawn on the edge between two cells and
// carrying a printed word. Both cells' letters must be among the word's own
// letters.
const CUE_CARDS = [
  ['R5C1', 'R6C1', 'FINKZ'],
  ['R4C6', 'R5C6', 'CAKE'],
  ['R5C3', 'R6C3', 'BRAIN'],
  ['R6C3', 'R7C3', 'WAVES'],
  ['R5C7', 'R5C8', 'EASY'],
  ['R5C8', 'R5C9', 'HARD'],
  ['R3C2', 'R4C2', 'CAGE'],
  ['R7C7', 'R8C7', 'TAIL'],
  ['R7C8', 'R8C8', 'DOOR'],
  ['R8C8', 'R8C9', 'FOOD'],
  ['R4C4', 'R5C4', 'LEARN'],
  ['R7C4', 'R8C4', 'TEST'],
  ['R8C4', 'R8C5', 'TASK'],
  ['R8C2', 'R8C3', 'RAT'],
  ['R8C3', 'R9C3', 'RUN'],
  ['R9C7', 'R9C8', 'MAZE'],
  ['R9C5', 'R9C6', 'READ'],
  ['R7C6', 'R8C6', 'MIND'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // path position mod 15 (1 = off path)
const posB = graph.makeOverlay('VB');   // path position mod 11
const rankHi = graph.makeOverlay('VH'); // this cell's letter rank, split
const rankLo = graph.makeOverlay('VI');
const alphaHi = n => 'VC' + n;          // digit n's letter rank, split
const alphaLo = n => 'VD' + n;

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

// A diagonal step passes through the one corner its two cells share. It needs
// a 2x2 space, whose only internal edges are the four wall slots meeting at
// that corner, and it may not pass through a wall-spot.
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

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.ceil(row / 3) * 10 + Math.ceil(col / 3);
};

// --- Step variables ---------------------------------------------------------
// One Var per legal move; moves the maze forbids get no variable at all.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other, sameBox: boxOf(cell) === boxOf(other) });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell off the path uses no step; a visited plain cell is entered
// once and left once; Finkz's own cell is only left; the cupcake is only
// entered.
function cellNFA(incident, role) {
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
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
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in: s.in, out: s.out };
      if (value === step.in) next.in++;
      else if (value === step.out) next.out++;
      else if (value !== UNUSED) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'start') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'end') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = cell === RAT_CELL ? 'start' : cell === CUPCAKE ? 'end' : 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters for subtour elimination: numbering a real
// path 1, 2, 3, ... from Finkz's cell is always possible, so "the arriving
// cell's counter is the leaving cell's plus one" adds nothing; a closed cycle
// of steps beside the path would need a length divisible by 15 and by 11,
// i.e. 165, and there are only 81 cells.
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
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and the path may not
// cross itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1, d2));
}

// --- Letters, deduced -------------------------------------------------------
// A cell's letter rank is the rank of the letter its digit stands for. One
// small machine per digit d: if the cell's digit is d ("hit"), its (rankHi,
// rankLo) must equal digit d's own (alphaHi(d), alphaLo(d)); scanning all 9
// alphaHi/alphaLo pairs from one generic machine instead would multiply out
// past the 4096-state compile cap, so d is baked in and the machine is
// replicated per digit per cell instead.
const digitRankKey = d => cached('digit-rank|' + d, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, hit: value === d };
    if (s.k === 1) return { k: 2, hit: s.hit, h: value };
    if (s.k === 2) return { k: 3, hit: s.hit, h: s.h, l: value };
    if (s.k === 3) {
      if (!s.hit) return { k: 4, hit: false };
      return value === s.h ? { k: 4, hit: true, l: s.l } : undefined;
    }
    if (s.k !== 4) return undefined;
    return (!s.hit || value === s.l) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const rankOf = gridCells.flatMap(cell => range(1, 9).map(d =>
  new NFA(digitRankKey(d), 'letter-rank',
    cell, alphaHi(d), alphaLo(d), rankHi.at(cell), rankLo.at(cell))));

// The 9 letters differ: no built-in AllDifferent reads a split (Hi, Lo) pair,
// so every one of the 36 pairs gets its own inequality machine.
const distinctRankKey = cached('distinct-rank', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, aH: clampHi(value) };
    if (s.k === 1) return { k: 2, aH: s.aH, aL: clampLo(value) };
    if (s.k === 2) return { k: 3, aH: s.aH, aL: s.aL, bH: clampHi(value) };
    if (s.k !== 3) return undefined;
    const bL = clampLo(value);
    return (s.aH !== s.bH || s.aL !== bL) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const alphabetDistinct = [];
for (let i = 1; i <= 9; i++) {
  for (let j = i + 1; j <= 9; j++) {
    alphabetDistinct.push(new NFA(distinctRankKey, 'alphabet-distinct',
      alphaHi(i), alphaLo(i), alphaHi(j), alphaLo(j)));
  }
}

// CUE CARDS: a card's word, restricted to A-Z, is a fixed set of ranks; both
// of the card's cells must land in it. Each application relates exactly the
// two cells holding one cell's own (rankHi, rankLo), so it is a Pair, not an
// NFA over an ordered list.
const letterRanksOf = word => {
  const set = new Set();
  for (const ch of word.toUpperCase()) {
    const code = ch.charCodeAt(0) - 64; // 'A' -> 1
    if (code >= 1 && code <= 26) set.add(code);
  }
  return [...set].sort((a, b) => a - b);
};
const cueCardKey = ranks => cached('cue|' + ranks.join(','),
  () => Pair.fnToKey((h, l) => ranks.includes(joinRank(h, l)), NV));
const cueCards = CUE_CARDS.flatMap(([a, b, word]) => {
  const key = cueCardKey(letterRanksOf(word));
  return [
    new Pair(key, 'cue-card', rankHi.at(a), rankLo.at(a)),
    new Pair(key, 'cue-card', rankHi.at(b), rankLo.at(b)),
  ];
});

// TEST CONSTRAINT: for a step whose two cells share a box, the step's
// direction says which cell the path visits first, and that cell's letter
// rank must be the lower one.
const rankOrderKey = cached('rank-order', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, aH: clampHi(value) };
    if (s.k === 2) return { k: 3, dir: s.dir, aH: s.aH, aL: clampLo(value) };
    if (s.k === 3) return { k: 4, dir: s.dir, aH: s.aH, aL: s.aL, bH: clampHi(value) };
    if (s.k !== 4) return undefined;
    const bL = clampLo(value);
    // Lexicographic (H, L) compare -- an exact stand-in for joinRank(H, L)
    // ordering, since L never reaches a second half (RANK_HALF is L's cap).
    const aLessB = s.aH < s.bH || (s.aH === s.bH && s.aL < bL);
    const bLessA = s.bH < s.aH || (s.bH === s.aH && bL < s.aL);
    if (s.dir === UNUSED) return { done: true };
    if (s.dir === FWD) return aLessB ? { done: true } : undefined;
    return bLessA ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const rankOrder = steps.filter(s => s.sameBox).map(s => new NFA(rankOrderKey,
  'rank-order', s.id, rankHi.at(s.a), rankLo.at(s.a), rankHi.at(s.b), rankLo.at(s.b)));

// --- Variables and domains --------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  rankHi.toVar('cell letter rank, half'),
  rankLo.toVar('cell letter rank, position in half'),
  new Var('S', 'path steps', steps.length),
  new Var('C', "digit's letter rank, half", 9),
  new Var('D', "digit's letter rank, position in half", 9),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(1, MOD_A + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  rankHi.makeReplicate(new Given(rankHi.at(gridCells[0]), 1, 2)),
  rankLo.makeReplicate(new Given(rankLo.at(gridCells[0]), ...range(1, RANK_HALF))),
  ...range(1, 9).map(n => new Given(alphaHi(n), 1, 2)),
  ...range(1, 9).map(n => new Given(alphaLo(n), ...range(1, RANK_HALF))),
  // Finkz's own cell is the first cell of the path.
  new Given(posA.at(RAT_CELL), FIRST), new Given(posB.at(RAT_CELL), FIRST),
  // Every monitor is on the path (its counter is not the off-path sentinel);
  // the path-cell machine above ties the other counter to the same fact.
  ...MONITORS.map(cell => new Given(posA.at(cell), ...range(FIRST, MOD_A + 1))),
];

return [
  shape,
  ...layers,
  ...domains,
  ...alphabetDistinct,
  ...rankOf,
  ...cueCards,
  ...pathShape,
  ...counters,
  ...noCross,
  ...rankOrder,
];
