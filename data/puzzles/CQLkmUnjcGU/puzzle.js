// Title: Blackadder
// Author: udukos
// Video: https://www.youtube.com/watch?v=CQLkmUnjcGU
// Source: https://tinyurl.com/2p85dfpe

// Normal sudoku, no givens. Ten clued cells are each one end of a snake -- a
// one-cell-wide orthogonal path whose route the solver discovers. Each clue
// belongs to its own snake, and no cell lies on two snakes.
//
// A clue value is the sum of every digit on its snake, the clued cell
// included; "?" means that total is not given.
//
// Box borders cut a snake into segments (maximal runs of consecutive snake
// cells inside one box) and every segment of one snake sums to the same N,
// re-visits of a box counting separately. Every snake spans at least two
// boxes, hence has at least two segments.
//
// No snake touches itself orthogonally or diagonally, and no two snakes share
// a cell (different snakes may touch).
//
// Reading of the no-touch rule. Read literally, "not diagonally" would forbid
// every 90-degree turn, because the cells either side of a turn are always
// diagonally adjacent while being two apart along the snake; every snake would
// be a straight line, reaching at most three boxes and so at most three equal
// segments. R5C5's 49 needs at least two equal segments dividing 49, i.e.
// seven segments of 7 (49 segments of 1 needs 49 cells), so the literal
// reading leaves the puzzle with no solution. The reading encoded here is
// therefore: two cells of one snake that are orthogonally or diagonally
// adjacent are at most two apart along it -- orthogonal neighbours are
// consecutive, and diagonal neighbours are the two arms of one turn.
//
// Solver-discovered state, four full-grid Var overlays plus a Var per snake:
//   VS  which snake this cell is on, 0 = none, 1-10 = the clue's index below
//   VT  the step to this cell's successor along its snake, 0 = none
//       (off-snake, or the snake's far end), 1-4 = up/down/left/right
//   VA, VB  the running sum of the current segment up to and including this
//       cell, counted from the clued end, as 9*VA + VB; 0 off-snake. Split
//       across two Vars because one Var caps at 16 values while a segment can
//       reach the box maximum of 45.
//   VNH, VNL  one cell per clued cell: that snake's segment target N,
//       again as 9*VNH + VNL
// The value range is widened to 0-10 to carry VS's ten snake ids and the 0
// sentinels; grid cells are restricted back to 1-9.

// The ten clues, read from the single-cell cages drawn on the grid: the cell
// the clue sits in, and its printed value (null for "?").
const CLUES = [
  ['R2C8', null],
  ['R3C5', 20],
  ['R5C1', 12],
  ['R5C5', 49],
  ['R5C7', 38],
  ['R6C4', null],
  ['R6C6', 18],
  ['R8C9', null],
  ['R9C2', 22],
  ['R9C5', 12],
];

const OFF = 0;
const NO_STEP = 0;
// Step codes: 1 up, 2 down, 3 left, 4 right. OPP flips each (1<->2, 3<->4).
const STEPS = [null, [-1, 0], [1, 0], [0, -1], [0, 1]];
const DIRS = [1, 2, 3, 4];
const OPP = (d) => (d % 2 === 1 ? d + 1 : d - 1);

// Segment sums are held as 9*hi + lo, so lo is a base-9 digit.
const BASE = 9;
const MAX_SEGMENT_SUM = 45;   // nine distinct digits, the most one box holds
const hiOf = (n) => Math.floor(n / BASE);
const loOf = (n) => n % BASE;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const cells = graph.cells();

const S = graph.makeOverlay('VS');
const T = graph.makeOverlay('VT');
const A = graph.makeOverlay('VA');
const B = graph.makeOverlay('VB');
const snakeIds = CLUES.map((_, i) => i + 1);
const clueCells = CLUES.map(([cell]) => cell);
// One pair of Vars per snake, held on a sparse overlay over the clued cells,
// for that snake's segment target N as 9*VNH + VNL.
const NH = graph.makeOverlay('VNH', clueCells);
const NL = graph.makeOverlay('VNL', clueCells);
const nHi = (k) => NH.at(clueCells[k - 1]);
const nLo = (k) => NL.at(clueCells[k - 1]);

// Which box each cell is in, from the solver's own box regions.
const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach((cell) => boxOf.set(cell, i)));

// The in-grid steps out of each cell, as direction codes.
const stepsFrom = new Map(cells.map((cell) => [
  cell, DIRS.filter((d) => graph.step(cell, ...STEPS[d]) !== null),
]));
const target = (cell, d) => graph.step(cell, ...STEPS[d]);
// Every directed in-grid step, as [from, code, to].
const directedSteps = cells.flatMap(
  (cell) => stepsFrom.get(cell).map((d) => [cell, d, target(cell, d)]));

// A cell's own value of VA/VB combined, as Sum terms.
const segSum = (cell, sign) => [[A.at(cell), sign * BASE], [B.at(cell), sign]];

// -- Domains ---------------------------------------------------------------

const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  A.makeReplicate(new Given(A.cells()[0], ...range(0, hiOf(MAX_SEGMENT_SUM)))),
  B.makeReplicate(new Given(B.cells()[0], ...range(0, BASE - 1))),
  ...cells.map((cell) => new Given(T.at(cell), NO_STEP, ...stepsFrom.get(cell))),
  ...snakeIds.flatMap((k) => [
    new Given(nHi(k), ...range(0, hiOf(MAX_SEGMENT_SUM))),
    new Given(nLo(k), ...range(0, BASE - 1)),
  ]),
];

// -- Snake membership ------------------------------------------------------

// Each clue is one end of its own snake, so its cell carries that snake's id
// and is the cell the numbering starts from.
const clueIndex = new Map(CLUES.map(([cell], i) => [cell, i + 1]));
const clueGivens = CLUES.map(([cell], i) => new Given(S.at(cell), i + 1));

// Every snake's cells form one orthogonally connected region.
const connectivity = snakeIds.map((k) => new ConnectedValues('VS', k));

// A snake reaches at least two boxes, so at least one of its cells lies
// outside the box its clue sits in.
const spansTwoBoxes = CLUES.map(([cell], i) => new ContainAtLeast(
  String(i + 1),
  ...S.at(cells.filter((c) => boxOf.get(c) !== boxOf.get(cell)))));

// -- Snake as a chain ------------------------------------------------------

// A step leads to a cell of the same snake, and only an on-snake cell steps.
const stepConsistency = directedSteps.map(([from, d, to]) => new Or([
  new Given(T.at(from), NO_STEP, ...stepsFrom.get(from).filter((e) => e !== d)),
  new And([
    new Given(T.at(from), d),
    new SameValues(2, S.at(from), S.at(to)),
  ]),
]));
const offCellsDoNotStep = cells.map((cell) => new Or([
  new Given(S.at(cell), ...snakeIds),
  new Given(T.at(cell), NO_STEP),
]));

// Predecessor count. Reading [VS of the cell, VT of each in-grid orthogonal
// neighbour], an on-snake cell that is not a clued cell needs exactly one
// neighbour stepping into it, and any other cell exactly none. With every
// non-clued snake cell holding one predecessor and every clued cell none, the
// steps of one snake form a chain from its clue; a cell's single VT value
// then also caps its successors at one.
const predSpecCache = new Map();
const predSpecFor = (codes, isClue) => {
  const key = `${codes.join(',')}|${isClue}`;
  if (!predSpecCache.has(key)) {
    predSpecCache.set(key, NFA.encodeSpec({
      startState: { phase: 'id' },
      transition: (s, v) => {
        if (s.phase === 'id') {
          return { phase: 'scan', i: 0, count: 0, need: (v !== OFF && !isClue) ? 1 : 0 };
        }
        const count = s.count + (v === codes[s.i] ? 1 : 0);
        return count > s.need
          ? undefined
          : { phase: 'scan', i: s.i + 1, count, need: s.need };
      },
      accept: (s) => s.phase === 'scan' && s.i === codes.length && s.count === s.need,
      maxDepth: codes.length + 1,
    }, shape));
  }
  return predSpecCache.get(key);
};
const predecessorCounts = cells.map((cell) => {
  const present = stepsFrom.get(cell);
  return new NFA(
    predSpecFor(present.map(OPP), clueIndex.has(cell)),
    'one predecessor off the clued end',
    S.at(cell), ...present.map((d) => T.at(target(cell, d))));
});

// -- The snake does not touch itself ---------------------------------------

// True when two cells are not on one snake together.
const differentSnakes = Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || a !== b, shape);
const apart = (a, b) => new Pair(differentSnakes, 'different snakes', a, b);
// a and b are consecutive: whichever way round, one steps to the other.
const linked = (a, b, dAB) => new Or([
  new Given(T.at(a), dAB),
  new Given(T.at(b), OPP(dAB)),
]);

const orthogonalPairs = [];
const diagonalPairs = [];
for (const cell of cells) {
  const right = graph.step(cell, 0, 1);
  if (right) orthogonalPairs.push([cell, right, 4]);
  const down = graph.step(cell, 1, 0);
  if (down) orthogonalPairs.push([cell, down, 2]);
  // Each diagonal pair with the (up to two) cells orthogonally adjacent to
  // both, which are the only cells a turn between them could pass through.
  const se = graph.step(cell, 1, 1);
  if (se) {
    diagonalPairs.push([cell, se,
      [graph.step(cell, 0, 1), 4, 2],
      [graph.step(cell, 1, 0), 2, 4]]);
  }
  const sw = graph.step(cell, 1, -1);
  if (sw) {
    diagonalPairs.push([cell, sw,
      [graph.step(cell, 0, -1), 3, 2],
      [graph.step(cell, 1, 0), 2, 3]]);
  }
}

// Orthogonal neighbours on one snake must be consecutive along it.
const noOrthogonalTouch = orthogonalPairs.map(([a, b, dAB]) => new Or([
  apart(S.at(a), S.at(b)),
  linked(a, b, dAB),
]));
// Diagonal neighbours on one snake must be the two arms of one turn.
const noDiagonalTouch = diagonalPairs.map(([a, b, ...corners]) => new Or([
  apart(S.at(a), S.at(b)),
  ...corners.filter(([m]) => m !== null).map(([m, dAM, dMB]) => new And([
    linked(a, m, dAM),
    linked(m, b, dMB),
  ])),
]));

// -- Clue totals -----------------------------------------------------------

// Reading [VS, digit] for every cell in turn, the digits on snake k total the
// clue. The running total is a sink once it passes the clue, which bounds the
// state.
const totalSpecFor = (k, total) => NFA.encodeSpec({
  startState: { phase: 'id', sum: 0 },
  transition: (s, v) => {
    if (s.phase === 'id') return { phase: 'digit', sum: s.sum, on: v === k };
    const sum = s.sum + (s.on ? v : 0);
    return sum > total ? undefined : { phase: 'id', sum };
  },
  accept: (s) => s.phase === 'id' && s.sum === total,
  maxDepth: 2 * cells.length,
}, shape);
const clueTotals = CLUES.flatMap(([, total], i) => total === null ? [] : [
  new NFA(totalSpecFor(i + 1, total), `snake ${i + 1} totals ${total}`,
    ...cells.flatMap((cell) => [S.at(cell), cell])),
]);

// -- Equal segment sums ----------------------------------------------------

// VA/VB carry the current segment's running sum. It starts at the clued cell,
// restarts whenever a step crosses a box border, and must equal the snake's
// target N wherever a segment ends -- at the snake's far end, or on the last
// cell before a step out of the box.
const offCellsHaveNoSum = cells.map((cell) => new Or([
  new Given(S.at(cell), ...snakeIds),
  new And([new Given(A.at(cell), 0), new Given(B.at(cell), 0)]),
]));
const clueStartsASegment = clueCells.map(
  (cell) => new Sum(0, ...segSum(cell, 1), [cell, -1]));
const segmentSums = directedSteps.map(([from, d, to]) => {
  const crosses = boxOf.get(from) !== boxOf.get(to);
  return new Or([
    new Given(T.at(from), NO_STEP, ...stepsFrom.get(from).filter((e) => e !== d)),
    new And([
      new Given(T.at(from), d),
      crosses
        ? new Sum(0, ...segSum(to, 1), [to, -1])
        : new Sum(0, ...segSum(to, 1), ...segSum(from, -1), [to, -1]),
    ]),
  ]);
});
const segmentEnds = cells.map((cell) => {
  const stays = stepsFrom.get(cell).filter(
    (d) => boxOf.get(target(cell, d)) === boxOf.get(cell));
  const leaves = stepsFrom.get(cell).filter(
    (d) => boxOf.get(target(cell, d)) !== boxOf.get(cell));
  return new Or([
    new Given(S.at(cell), OFF),
    new Given(T.at(cell), ...stays),
    new And([
      new Given(T.at(cell), NO_STEP, ...leaves),
      new Or(snakeIds.map((k) => new And([
        new Given(S.at(cell), k),
        new Sum(0, ...segSum(cell, 1), [nHi(k), -BASE], [nLo(k), -1]),
      ]))),
    ]),
  ]);
});

// A clued snake's total is N per segment over at least two segments, so N
// divides the clue and is at most half of it. Implied by the rules above;
// stated here because it is what makes the targets searchable.
const targetsDivideClues = CLUES.flatMap(([, total], i) => {
  if (total === null) return [];
  const divisors = range(1, Math.floor(total / 2)).filter((n) => total % n === 0);
  return [new Or(divisors.map((n) => new And([
    new Given(nHi(i + 1), hiOf(n)),
    new Given(nLo(i + 1), loOf(n)),
  ])))];
});

return [
  shape,
  S.toVar('snake id'),
  T.toVar('step to successor'),
  A.toVar('segment sum, high'),
  B.toVar('segment sum, low'),
  NH.toVar('segment target, high'),
  NL.toVar('segment target, low'),
  ...domains,
  ...clueGivens,
  ...connectivity,
  ...spansTwoBoxes,
  ...stepConsistency,
  ...offCellsDoNotStep,
  ...predecessorCounts,
  ...noOrthogonalTouch,
  ...noDiagonalTouch,
  ...clueTotals,
  ...offCellsHaveNoSum,
  ...clueStartsASegment,
  ...segmentSums,
  ...segmentEnds,
  ...targetsDivideClues,
];
