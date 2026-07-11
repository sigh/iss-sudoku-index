// Title: Campfire Whispers
// Author: ZagOnEm
// Video: https://www.youtube.com/watch?v=ok-r1oK0fSk
// Source: https://sudokupad.app/nmhixakego

// Normal sudoku rules apply. White dots join two orthogonally consecutive
// digits. The grid contains 16 fixed trees. Each tree is paired 1-to-1 with
// an orthogonally adjacent tent; tents may not touch each other, even
// diagonally. A digit written in a tent tells exactly how many tents (in the
// whole grid) contain that digit. A tent's digit differs from its paired
// tree's digit by at least 5.
//
// Encoding notes:
// - Tree positions are fixed and known. Tent positions are not: for every
//   tree we add a small "pairDir" Var (values 1=LEFT,2=RIGHT,3=UP,4=DOWN)
//   restricted to directions that lead to an in-grid, non-tree neighbour.
//   That Var records which neighbour is this tree's paired tent.
// - Every grid cell has a matching "isTent" Var (1=no,2=yes). For a cell
//   next to k trees, an NFA reads the k neighbouring trees' pairDir values
//   plus the cell's own isTent value; it dies if two trees claim the same
//   cell (enforcing the 1-to-1 pairing) and otherwise forces isTent to agree
//   with whether exactly one neighbouring tree points here. Cells with no
//   neighbouring tree, and the tree cells themselves, are simply given
//   isTent = 1 (not a tent).
// - No-touch is a Pair forbidding isTent = 2 on any king-adjacent cell pair.
// - The "differs by >= 5" rule is an NFA per tree/direction candidate: it
//   only constrains the digit difference when that tree's pairDir equals
//   that direction.
// - The self-referential counting rule ("digit d in a tent means exactly d
//   tents hold d") is the standard collapse count(d) in {0, d}: one NFA per
//   digit scans every cell's (isTent, digit) pair and dies once count(d)
//   would exceed d.

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const numValues = graph.gridGeometry().numValues;

const constraints = [new Shape('9x9')];
const add = (...cs) => constraints.push(...cs);

// --- Givens -----------------------------------------------------------
const givenDigits = {
  R1C3: 6, R1C6: 4, R2C9: 8, R3C1: 7, R7C3: 1,
};
for (const [cell, value] of Object.entries(givenDigits)) {
  add(new Given(cell, value));
}

// --- White dots (Kropki consecutive) -----------------------------------
const whiteDots = [
  ['R5C2', 'R5C3'],
  ['R5C4', 'R5C5'],
  ['R3C7', 'R3C8'],
  ['R2C2', 'R2C3'],
  ['R1C8', 'R2C8'],
  ['R8C4', 'R8C5'],
];
for (const [a, b] of whiteDots) add(new WhiteDot(a, b));

// --- Trees and tents ----------------------------------------------------
const treeCells = [
  'R1C1', 'R1C2', 'R1C5', 'R3C5', 'R3C8', 'R4C4', 'R5C8', 'R5C9',
  'R6C1', 'R6C4', 'R7C1', 'R7C8', 'R8C3', 'R8C5', 'R8C7', 'R8C9',
];
const treeSet = new Set(treeCells);

const LEFT = 1, RIGHT = 2, UP = 3, DOWN = 4;
const DIR_STEPS = [
  { code: LEFT, dRow: 0, dCol: -1 },
  { code: RIGHT, dRow: 0, dCol: 1 },
  { code: UP, dRow: -1, dCol: 0 },
  { code: DOWN, dRow: 1, dCol: 0 },
];

// pairDir: one Var per tree, values are direction codes toward its tent.
const pairDirOverlay = graph.makeOverlay('VD', treeCells);
add(pairDirOverlay.toVar('tree pair direction'));
const pairDirCell = (tree) => pairDirOverlay.at(tree);

// isTent: one Var per grid cell, 1 = not a tent, 2 = a tent.
const tentOverlay = graph.makeOverlay('VT');
add(tentOverlay.toVar('is tent'));
const tentCell = (cell) => tentOverlay.at(cell);

// For each tree, the candidate (direction, targetCell) pairs: an in-grid
// neighbour that is not itself a tree.
const treeCandidates = new Map();
for (const tree of treeCells) {
  const candidates = [];
  for (const { code, dRow, dCol } of DIR_STEPS) {
    const target = graph.step(tree, dRow, dCol);
    if (target !== null && !treeSet.has(target)) candidates.push({ code, target });
  }
  treeCandidates.set(tree, candidates);
  add(new Given(pairDirCell(tree), ...candidates.map(c => c.code)));
}

// Every non-tree cell next to at least one tree: collect the (tree, code)
// pairs that would point at it.
const incomingByCell = new Map();
for (const tree of treeCells) {
  for (const { code, target } of treeCandidates.get(tree)) {
    if (!incomingByCell.has(target)) incomingByCell.set(target, []);
    incomingByCell.get(target).push({ tree, code });
  }
}

// isTent domain restriction, plus fixed "not a tent" givens.
for (const cell of gridCells) {
  add(new Given(tentCell(cell), 1, 2));
}
for (const tree of treeCells) {
  add(new Given(tentCell(tree), 1));
}
for (const cell of gridCells) {
  if (treeSet.has(cell)) continue;
  if (!incomingByCell.has(cell)) add(new Given(tentCell(cell), 1));
}

// Matching NFA: reads the pairDir of each incoming tree, then this cell's
// isTent value. Dies if two trees claim the cell; otherwise forces isTent
// to match "exactly one incoming tree points here".
const matchNFA = (codes) => NFA.encodeSpec({
  startState: { idx: 0, count: 0 },
  transition: (state, value) => {
    if (state.idx < codes.length) {
      const matched = state.count + (value === codes[state.idx] ? 1 : 0);
      if (matched > 1) return undefined;
      return { idx: state.idx + 1, count: matched };
    }
    const wantsTent = state.count === 1;
    return value === (wantsTent ? 2 : 1) ? { done: true } : undefined;
  },
  accept: (s) => s.done === true,
}, numValues);

for (const [cell, incoming] of incomingByCell) {
  const codes = incoming.map(x => x.code);
  const args = incoming.map(x => pairDirCell(x.tree));
  args.push(tentCell(cell));
  add(new NFA(matchNFA(codes), 'tent-match', ...args));
}

// No-touch: no two king-adjacent cells are both tents.
const noBothTents = Pair.fnToKey((a, b) => !(a === 2 && b === 2), numValues);
const seenPairs = new Set();
for (const cell of gridCells) {
  for (const neighbour of graph.kingNeighbours(cell)) {
    const key = [cell, neighbour].sort().join('|');
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    add(new Pair(noBothTents, 'tent-no-touch', tentCell(cell), tentCell(neighbour)));
  }
}

// German whispers on the paired tree/tent edge: only checked when that
// direction is the chosen pairing.
const diffOnDirection = (code) => NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (state, value) => {
    if (state.phase === 'dir') return { phase: 'digitA', matched: value === code };
    if (state.phase === 'digitA') return { phase: 'digitB', matched: state.matched, digitA: value };
    if (!state.matched) return { done: true };
    return Math.abs(state.digitA - value) >= 5 ? { done: true } : undefined;
  },
  accept: (s) => s.done === true,
}, numValues);
const diffNFAByCode = new Map([LEFT, RIGHT, UP, DOWN].map(c => [c, diffOnDirection(c)]));

for (const tree of treeCells) {
  for (const { code, target } of treeCandidates.get(tree)) {
    add(new NFA(diffNFAByCode.get(code), 'pair-diff', pairDirCell(tree), tree, target));
  }
}

// Counting tents: for each digit d, the number of tents holding d is 0 or d.
const countingNFA = (target) => NFA.encodeSpec({
  startState: { phase: 'tent', count: 0, isTent: false },
  transition: (state, value) => {
    if (state.phase === 'tent') return { phase: 'digit', isTent: value === 2, count: state.count };
    const nextCount = state.count + ((state.isTent && value === target) ? 1 : 0);
    if (nextCount > target) return undefined;
    return { phase: 'tent', count: nextCount, isTent: false };
  },
  accept: (s) => s.phase === 'tent' && (s.count === 0 || s.count === target),
}, numValues);

for (let digit = 1; digit <= numValues; digit++) {
  const args = [];
  for (const cell of gridCells) { args.push(tentCell(cell), cell); }
  add(new NFA(countingNFA(digit), 'tent-count', ...args));
}

return constraints;
