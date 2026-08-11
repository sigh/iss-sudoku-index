// Title: Caduceus
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=EucaxJ42MAo
// Source: https://app.crackingthecryptic.com/sudoku/jRhnH89mNm
//
// Standard sudoku plus two undrawn snakes, A and B: orthogonally-connected
// cell sets, each visiting every 3x3 box, neither touching itself even
// diagonally (they may touch each other, but never occupy the same cell).
// One snake is a German Whisper Line (adjacent snake digits differ by >= 5);
// the other is an Equal Sum Line (digits sum to a common N within each box
// the line passes through). Which snake is which is not stated, so the
// Whisper rule is applied disjunctively to whichever snake satisfies it.
// Outside clues give the sum of non-snake cells in that row/column; the
// marked cell in each box holds the count of non-snake cells in that box.
//
// Omission: the Equal Sum Line's box-total arithmetic is not encoded -- only
// the shared topology (both-visit-every-box, no self touch, connectivity)
// and the disjunctive Whisper rule are enforced.
//
// Membership: one Var per grid cell (prefix 'VM'), value OFF/A/B. A cell
// orthogonally adjacent to a same-value cell is *always* a path edge here,
// because each on-snake cell's same-value orthogonal-neighbour count is
// pinned to exactly 1 (its two global endpoints) or 2 (every other on-snake
// cell) by the degree NFAs below -- so no same-snake pair can be adjacent
// without being a path edge. That licenses reading the Whisper rule directly
// off grid adjacency, with no separate path-order representation needed.

const OFF = 1, A = 2, B = 3;

const ENDPOINTS_A = ['R1C3', 'R4C4'];
const ENDPOINTS_B = ['R6C4', 'R8C9'];
const ENDPOINTS = new Set([...ENDPOINTS_A, ...ENDPOINTS_B]);

// Index-for-index with graph.boxes() (reading order: TL, TM, TR, ML, MM, MR,
// BL, BM, BR), the box's marker cell -- the underlay square drawn in the
// source, converted from its cell-center coordinates.
const BOX_MARKERS = ['R1C1', 'R2C6', 'R2C8', 'R4C1', 'R6C5', 'R4C7', 'R9C3', 'R8C5', 'R8C7'];

// Outside clues: [row, target] / [col, target] sums of non-snake cells,
// transcribed from the six off-grid text overlays.
const OUTSIDE_ROW_CLUES = [[6, 4], [8, 7], [9, 45]];
const OUTSIDE_COL_CLUES = [[1, 45], [2, 23], [3, 5]];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes();

const membership = graph.makeOverlay('VM');
const originCell = membership.cells()[0];

// --- Membership domain and fixed endpoints. ---
const setup = [
  membership.makeReplicate(new Given(originCell, OFF, A, B)),
  ...ENDPOINTS_A.map(cell => new Given(membership.at(cell), A)),
  ...ENDPOINTS_B.map(cell => new Given(membership.at(cell), B)),
];

// --- Degree: an on-snake cell has exactly 1 (endpoint) or 2 (otherwise)
// same-value orthogonal neighbours; off cells are unconstrained. Reads own
// membership, then each neighbour's. Two machines (by expected degree),
// reused across all cells and both snake values.
const degreeMachine = (expectedDegree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, own, count }, v) => {
    if (phase === 'start') {
      return v === OFF ? { phase: 'off' } : { phase: 'on', own: v, count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (v === own ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', own, count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === expectedDegree,
}, geometry.numValues);
const degree1 = degreeMachine(1);
const degree2 = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  ENDPOINTS.has(cell) ? degree1 : degree2, 'degree',
  ...membership.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch, per snake value: forbid a 2x2 block whose only
// cells equal to X are the two diagonal ones. Reads the block's four
// memberships, top-left to bottom-right.
const noTouchMachine = (X) => NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, v) => {
    if (block === null) return { block: null };
    const next = [...block, v === X];
    if (next.length < 4) return { block: next };
    const [tl, tr, bl, br] = next;
    const diagonalOnly = (tl && br && !tr && !bl) || (tr && bl && !tl && !br);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template per snake, anchored at the overlay's own origin cell (VM1,
// i.e. R1C1's 2x2 block), replicated onto every other valid 2x2 top-left --
// all 64 are the same shape, just shifted.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouchTemplate = (X) => new NFA(noTouchMachine(X), 'no-touch',
  ...membership.at(graph.block(blockOrigins[0], 2, 2)));
const noDiagonalTouches = [
  membership.makeReplicate(noTouchTemplate(A), membership.at(blockOrigins)),
  membership.makeReplicate(noTouchTemplate(B), membership.at(blockOrigins)),
];

// --- Connectivity: each snake's cells form one connected region. ---
const connectivity = [
  new ConnectedValues('VM', A),
  new ConnectedValues('VM', B),
];

// --- Visits every box: each snake has at least one cell in every box. ---
const visitsEveryBox = boxes.flatMap(box => [
  new ContainAtLeast(String(A), ...membership.at(box)),
  new ContainAtLeast(String(B), ...membership.at(box)),
]);

// --- German Whisper Line, applied to whichever snake turns out to hold it:
// for every grid-adjacent pair, if both cells are on the target snake their
// digits differ by >= 5 (see the module comment for why grid adjacency is
// exactly path adjacency here). Reads membership/digit for one cell, then
// the other; off-target cells are skipped without constraining their digit.
const whisperMachine = (X) => NFA.encodeSpec({
  startState: { phase: 'm1' },
  transition: (state, v) => {
    switch (state.phase) {
      case 'm1': return v === X ? { phase: 'd1' } : { phase: 'skip', left: 3 };
      case 'd1': return { phase: 'm2', d1: v };
      case 'm2': return v === X
        ? { phase: 'd2', d1: state.d1 }
        : { phase: 'skip', left: 1 };
      case 'd2':
        return Math.abs(state.d1 - v) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whisperA = whisperMachine(A);
const whisperB = whisperMachine(B);
// Each undirected orthogonal edge once (right and down steps from each cell).
const edges = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => [cell, other]));
const whisperEdges = (machine) => edges.map(([a, b]) => new NFA(
  machine, 'whisper', membership.at(a), a, membership.at(b), b));
const whichIsWhisper = new Or([
  new And(whisperEdges(whisperA)),
  new And(whisperEdges(whisperB)),
]);

// --- Outside clues: sum of non-snake digits in a row/column equals target.
// Reads (membership, digit) pairs down the line; only OFF cells contribute.
const outsideSumMachine = (target) => NFA.encodeSpec({
  startState: { sum: 0, mem: null },
  transition: ({ sum, mem }, v) => {
    if (mem === null) return { sum, mem: v };
    const next = sum + (mem === OFF ? v : 0);
    return next > target ? undefined : { sum: next, mem: null };
  },
  accept: ({ sum, mem }) => mem === null && sum === target,
}, geometry.numValues);
const outsideClues = [
  ...OUTSIDE_ROW_CLUES.map(([row, target]) => {
    const cells = graph.row(row);
    return new NFA(outsideSumMachine(target), 'outside-row',
      ...cells.flatMap(c => [membership.at(c), c]));
  }),
  ...OUTSIDE_COL_CLUES.map(([col, target]) => {
    const cells = graph.column(col);
    return new NFA(outsideSumMachine(target), 'outside-col',
      ...cells.flatMap(c => [membership.at(c), c]));
  }),
];

// --- Box markers: the marked cell's own digit equals the count of non-snake
// cells in its box. Reads the marked cell's digit first, then the box's nine
// memberships.
const boxCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, v) => {
    if (target === null) return { target: v, count: 0 };
    const next = count + (v === OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const boxCounts = boxes.map((box, i) => new NFA(boxCountMachine, 'box-off-count',
  BOX_MARKERS[i], ...membership.at(box)));

return [
  new Shape('9x9'),
  membership.toVar('M'),
  ...setup,
  ...degrees,
  ...noDiagonalTouches,
  ...connectivity,
  ...visitsEveryBox,
  whichIsWhisper,
  ...outsideClues,
  ...boxCounts,
];
