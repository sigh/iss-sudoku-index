// Title: No '0' In Adder
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=ZS_PWQHNFcI
// Source: https://app.crackingthecryptic.com/sudoku/BJ7MgMnT9f

// Rules encoded below:
//   Normal sudoku, digits 1-9.
//   A single snake of orthogonally-connected cells begins at the given 1
//   (R2C1), does not branch, does not touch itself even diagonally, and
//   visits every 3x3 box. Each snake digit (from the 3rd cell on) is the sum
//   of the previous two snake digits modulo 10; the 2nd snake digit is free.
//   Grey-shaded cells are never on the snake; each one's own digit equals the
//   count of its up-to-8 king neighbours that ARE on the snake.
//   Cells joined by a white dot hold consecutive digits (positive-only:
//   "not all possible dots are given" forbids no other pair).
//   The snake does not touch (occupy) either cell of a white-dot edge -- the
//   same "touch" used two clauses earlier for its own no-self-touch rule,
//   read here as "a snake cell may not be one of a dot's two cells".
//
// The snake's unknown shape is carried in one Var overlay VP: for each cell,
// OFF (not on the snake), START (the given 1), or FROM_x (on the snake,
// arrived from the neighbour in direction x). A cell's own FROM_x code is
// its predecessor pointer, so a 3-cell digit relation (this cell, its
// predecessor, its predecessor's predecessor) is read directly off two
// chained VP values -- see the recurrence NFAs below.

const OFF = 1, START = 2, FROM_N = 3, FROM_E = 4, FROM_S = 5, FROM_W = 6;
const DIRS = [
  { code: FROM_N, dr: -1, dc: 0, back: FROM_S },
  { code: FROM_E, dr: 0, dc: 1, back: FROM_W },
  { code: FROM_S, dr: 1, dc: 0, back: FROM_N },
  { code: FROM_W, dr: 0, dc: -1, back: FROM_E },
];
const ON_CODES = [START, FROM_N, FROM_E, FROM_S, FROM_W];

const START_CELL = 'R2C1';

// Grey-shaded "count" cells, transcribed from the drawn grey cell shading.
const GREY_CELLS = ['R3C2', 'R5C1', 'R5C2', 'R3C5', 'R5C5', 'R4C7', 'R8C7', 'R8C9'];

// White-dot edges, transcribed from the drawn dot marks.
const WHITE_DOTS = [
  ['R9C2', 'R9C3'],
  ['R4C3', 'R5C3'],
  ['R2C5', 'R2C6'],
  ['R3C3', 'R4C3'],
];
const DOT_CELLS = [...new Set(WHITE_DOTS.flat())];

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const path = graph.makeOverlay('VP');

const neighbourDirs = (cell) => DIRS
  .map((d) => ({ ...d, cell: graph.step(cell, d.dr, d.dc) }))
  .filter((d) => d.cell);

// --- Path domains: START fixed; every other cell OFF or FROM_x toward an
// in-grid neighbour. ---
const pathDomains = gridCells.map((cell) => (cell === START_CELL
  ? new Given(path.at(cell), START)
  : new Given(path.at(cell), OFF, ...neighbourDirs(cell).map((d) => d.code))));

// --- No orthogonal self-touch / no branching: two orthogonally adjacent
// on-snake cells must be direct predecessor/successor of each other. ---
const adjacentKey = (into, outOf) => Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || b === into || a === outOf, shape);
const noTouchOrth = [
  [0, 1, FROM_W, FROM_E],   // a = west cell, b = east cell
  [1, 0, FROM_N, FROM_S],   // a = north cell, b = south cell
].map(([dr, dc, into, outOf]) => {
  const anchors = gridCells.filter((c) => graph.step(c, dr, dc));
  return path.makeReplicate(
    new Pair(adjacentKey(into, outOf), 'adjacent pair',
      path.at(anchors[0]), path.at(graph.step(anchors[0], dr, dc))),
    path.at(anchors));
});

// --- No diagonal self-touch: a 2x2 block may not hold on-snake cells on
// exactly one diagonal with the other diagonal both off (a turn always also
// occupies one of the two connecting corners, so a real turn is unaffected).
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, v) => {
    if (block === null) return { block: null };
    const next = [...block, v !== OFF];
    if (next.length < 4) return { block: next };
    const [tl, tr, bl, br] = next;
    const diagonalOnly = (tl && br && !tr && !bl) || (tr && bl && !tl && !br);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
// One template (built at the grid's first cell) replicated across every
// valid 2x2 block origin, rather than one hand-stamped NFA per block.
const diagOrigins = gridCells.filter((cell) => graph.block(cell, 2, 2));
const noDiagonalTouchTemplate = new NFA(noDiagonalTouchMachine, 'no diagonal touch',
  ...path.at(graph.block(gridCells[0], 2, 2)));
const noDiagonalTouches = [path.makeReplicate(noDiagonalTouchTemplate, path.at(diagOrigins))];

// --- Successor count: each cell counts how many neighbours name it as their
// predecessor. Off cells: 0. The given start: exactly 1 (the snake spans
// more than one cell, since it must visit all 9 boxes). Any other on-snake
// cell: 0 or 1 (0 marks the snake's unknown far end). ---
const successorSpecs = new Map();
const successorSpec = (backCodes, exact1) => {
  const key = `${backCodes.join(',')}:${exact1}`;
  if (!successorSpecs.has(key)) {
    successorSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0, on: false, n: 0 },
      transition: (s, v) => {
        if (s.i === 0) return { i: 1, on: v !== OFF, n: 0 };
        const n = s.n + (v === backCodes[s.i - 1] ? 1 : 0);
        return n > 1 ? undefined : { i: s.i + 1, on: s.on, n };
      },
      accept: (s) => (s.on ? (exact1 ? s.n === 1 : s.n <= 1) : s.n === 0),
      maxDepth: 1 + backCodes.length,
    }, shape));
  }
  return successorSpecs.get(key);
};
const successorCounts = gridCells.map((cell) => {
  const dirs = neighbourDirs(cell);
  return new NFA(
    successorSpec(dirs.map((d) => d.back), cell === START_CELL),
    'successor count', path.at(cell), ...dirs.map((d) => path.at(d.cell)));
});

// --- Single connected snake (with the start forced to exactly one
// successor above, this also rules out the on-snake cells forming a
// separate closed loop instead of a path). ---
const connectivity = new ConnectedValues('VP', ON_CODES);

// --- Visits every 3x3 box: at least one on-snake cell per box. ---
const boxVisits = graph.boxes().map((box) => new Or(
  box.map((cell) => new Given(path.at(cell), ...ON_CODES))));

// --- Grey cells: off the snake; digit = count of on-snake king neighbours.
const greyOff = GREY_CELLS.map((cell) => new Given(path.at(cell), OFF));
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, v) => {
    if (target === null) return { target: v, count: 0 };
    const next = count + (v !== OFF ? 1 : 0);
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, shape);
const greyCounts = GREY_CELLS.map((cell) => new NFA(
  countMachine, 'grey count', cell, ...path.at(graph.kingNeighbours(cell))));

// --- White dots: consecutive digits, and neither dot cell is on the snake.
const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));
const dotsOffSnake = DOT_CELLS.map((cell) => new Given(path.at(cell), OFF));

// --- Recurrence: for every directed 2-hop walk grandparent(GP) -FROM_dP->
// parent(P) -FROM_dC-> cell(C), whenever both hops are actually the ones
// used by the snake, C's digit = (P's digit + GP's digit) mod 10. When P is
// the start cell (no grandparent), no dP matches, so the relation is
// vacuous there -- exactly the "2nd digit is free" rule. Cells for which
// (mod 10) would land on 0 simply have no legal digit for C, which is why
// the puzzle title promises the solution never needs one.
const recurrenceSpecs = new Map();
const recurrenceSpec = (dC, dP) => {
  const key = `${dC}:${dP}`;
  if (!recurrenceSpecs.has(key)) {
    recurrenceSpecs.set(key, NFA.encodeSpec({
      startState: 'start',
      transition: (s, v) => {
        if (s === 'skip') return 'skip';
        if (s === 'start') return v === dC ? { p: 1 } : 'skip';
        if (s.p === 1) return v === dP ? { p: 2 } : 'skip';
        if (s.p === 2) return { p: 3, gp: v };
        if (s.p === 3) return { p: 4, gp: s.gp, pd: v };
        return v === (s.gp + s.pd) % 10 ? 'ok' : [];
      },
      accept: (s) => s === 'ok' || s === 'skip',
      maxDepth: 5,
    }, shape));
  }
  return recurrenceSpecs.get(key);
};
const recurrences = gridCells.flatMap((C) => neighbourDirs(C).flatMap(({ code: dC, cell: P }) =>
  neighbourDirs(P).map((dp) => new NFA(
    recurrenceSpec(dC, dp.code), 'recurrence',
    path.at(C), path.at(P), dp.cell, P, C))));

return [
  shape,
  path.toVar('path'),
  new Given(START_CELL, 1),
  ...pathDomains,
  ...noTouchOrth,
  ...noDiagonalTouches,
  ...successorCounts,
  connectivity,
  ...boxVisits,
  ...greyOff,
  ...greyCounts,
  ...whiteDots,
  ...dotsOffSnake,
  ...recurrences,
];
