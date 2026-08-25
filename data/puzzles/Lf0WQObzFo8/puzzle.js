// Title: SVS (297) - Palindrome Snake Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=Lf0WQObzFo8
// Source: https://app.crackingthecryptic.com/webapp/rJt3468PBN

// Normal sudoku. A snake starts and ends at the two circled cells, moves
// orthogonally cell to cell, and never touches itself -- not even diagonally
// -- so two snake cells may be orthogonally or diagonally adjacent only when
// they are consecutive along the snake. The digits on the snake, read from
// one end to the other, form a palindrome. The eleven grey cells are never
// part of the snake, and each grey cell's own digit is the count of its
// (up to eight) horizontal/vertical/diagonal neighbours that are on the
// snake. All grey cells are drawn; there are no hidden ones.
//
// The snake's cells, length and route are solver-discovered, so they are
// carried in two full-grid Var overlays:
//   VT      this cell's successor step along the snake (0 = not on the
//           snake / snake's far end), codes 1-4 below
//   VH, VL  this cell's 1-based position along the snake from R5C1,
//           split as 9*VH + VL (0/0 = not on the snake) because a single
//           Var caps out at 16 values (CellGeometry.MAX_SIZE) while the
//           snake can reach up to 70 cells
// The value range is widened to 0-9 to hold VT's codes and the 0 "off
// snake" sentinel; grid cells are restricted back to 1-9.
//
// R5C1 and R8C2 are the snake's two ends. Which one is numbered from is an
// encoding choice, not a rule: the palindrome and no-touch rules are
// symmetric in the snake's direction, so R5C1 is fixed as position 1
// without loss of generality.

const START = 'R5C1';
const END = 'R8C2';

// Grey (non-snake) cells, from the eleven grey-filled cells drawn on the grid.
const GREY = [
  'R2C4', 'R3C9', 'R4C2', 'R6C6', 'R6C7',
  'R7C2', 'R7C3', 'R7C8', 'R9C1', 'R9C2', 'R9C4',
];

// Givens, from the drawn digits.
const GIVENS = [
  ['R1C1', 5], ['R1C4', 3], ['R3C1', 7], ['R4C6', 8], ['R5C3', 1],
  ['R5C7', 2], ['R6C4', 5], ['R7C9', 3], ['R9C6', 3], ['R9C9', 9],
].map(([cell, value]) => new Given(cell, value));

// Successor step codes: 0 = none; 1-4 are the orthogonal steps (up, down,
// left, right). OPP pairs each step with its reverse (1<->2, 3<->4).
const STEPS = [null, [-1, 0], [1, 0], [0, -1], [0, 1]];
const DIRS = [1, 2, 3, 4];
const OPP = (d) => (d % 2 === 1 ? d + 1 : d - 1);

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();
const greySet = new Set(GREY);
// Free cells: neither grey (forced off) nor a circled end (forced on, fixed
// role). Their on/off state and, if on, their role in the chain are what
// the solver discovers.
const freeCells = cells.filter((c) => !greySet.has(c) && c !== START && c !== END);

const T = graph.makeOverlay('VT');
const H = graph.makeOverlay('VH');
const L = graph.makeOverlay('VL');

// Every step that stays on the grid, per cell, as direction codes.
const stepsFrom = new Map(cells.map((cell) => [
  cell, DIRS.filter((d) => graph.step(cell, ...STEPS[d]) !== null),
]));

// -- Position propagation and no-branching machinery ------------------------
//
// A cell's own combined position is 9*VH+VL. Reading [VH, VL, T of each
// in-grid orthogonal neighbour], this asserts that a cell needs exactly one
// neighbour stepping into it once its position is 2 or later (i.e. it is on
// the snake and is not R5C1), and none otherwise (off the snake, or R5C1
// itself).
const predSpecCache = new Map();
const predSpecFor = (codes) => {
  const key = codes.join(',');
  if (!predSpecCache.has(key)) {
    predSpecCache.set(key, NFA.encodeSpec({
      startState: { phase: 'h' },
      transition: (s, v) => {
        if (s.phase === 'h') return { phase: 'l', h: v };
        if (s.phase === 'l') {
          const pos = 9 * s.h + v;
          return { phase: 'scan', i: 0, count: 0, need: pos >= 2 ? 1 : 0 };
        }
        const count = s.count + (v === codes[s.i] ? 1 : 0);
        return count > s.need ? undefined : { phase: 'scan', i: s.i + 1, count, need: s.need };
      },
      accept: (s) => s.phase === 'scan' && s.i === codes.length && s.count === s.need,
      maxDepth: codes.length + 2,
    }, shape));
  }
  return predSpecCache.get(key);
};
const predecessorChecks = cells.map((cell) => {
  const present = stepsFrom.get(cell);
  return new NFA(
    predSpecFor(present.map(OPP)), 'one predecessor once on the snake',
    [H.at(cell), L.at(cell), ...present.map((d) => T.at(graph.step(cell, ...STEPS[d])))]);
});

// -- Palindrome mirror check --------------------------------------------
//
// For two distinct candidate cells a, b: with posA, posB their combined
// positions and posEnd the position at the fixed end R8C2 (i.e. the snake's
// length), a and b are the palindrome's mirrored pair exactly when
// posA + posB = posEnd + 1. Reading [VH(a), VL(a), VH(b), VL(b), VH(end),
// VL(end), digit(a), digit(b)] and folding each term into a running signed
// total as it is read keeps the state a single bounded integer instead of a
// pair of independent 0-80 positions, which would multiply. A cell that is
// off the snake has posA (or posB) = 0, and no on-snake position exceeds
// posEnd, so 0 can never satisfy posA + posB = posEnd + 1 -- an off cell in
// the pair never forces a match.
const mirrorSpec = NFA.encodeSpec({
  startState: { phase: 0, acc: 0 },
  transition: (s, v) => {
    switch (s.phase) {
      case 0: return { phase: 1, acc: 9 * v }; // VH(a)
      case 1: return { phase: 2, acc: s.acc + v }; // VL(a) -> posA
      case 2: return { phase: 3, acc: s.acc + 9 * v }; // VH(b)
      case 3: return { phase: 4, acc: s.acc + v }; // VL(b) -> posA+posB
      case 4: return { phase: 5, acc: s.acc - 9 * v }; // VH(end)
      case 5: return { phase: 6, mustMatch: (s.acc - v - 1) === 0 }; // VL(end)
      case 6: return { phase: 7, mustMatch: s.mustMatch, digitA: v };
      case 7: return { phase: 8, ok: !s.mustMatch || v === s.digitA };
      default: return undefined;
    }
  },
  accept: (s) => s.phase === 8 && s.ok,
  maxDepth: 8,
}, shape);
// All candidate (non-grey) cells, in a fixed order, checked pairwise once
// each (i < j) -- the relation above is already symmetric in a/b.
const candidates = cells.filter((c) => !greySet.has(c));
const mirrorChecks = [];
for (let i = 0; i < candidates.length; i++) {
  for (let j = i + 1; j < candidates.length; j++) {
    const a = candidates[i];
    const b = candidates[j];
    mirrorChecks.push(new NFA(
      mirrorSpec, 'palindrome mirror',
      H.at(a), L.at(a), H.at(b), L.at(b), H.at(END), L.at(END), a, b));
  }
}

// -- Grey cell snake-neighbour counts -------------------------------------
//
// Reads [VH, VL of each king-move neighbour interleaved, own digit], and
// requires the digit to equal how many of those neighbours are on the
// snake (VH=0 and VL=0 both hold exactly when a cell is off the snake).
const greyCountSpecCache = new Map();
const greyCountSpecFor = (k) => {
  if (!greyCountSpecCache.has(k)) {
    greyCountSpecCache.set(k, NFA.encodeSpec({
      startState: { stage: 'H', idx: 0, count: 0 },
      transition: (s, v) => {
        if (s.idx < k) {
          if (s.stage === 'H') return { stage: 'L', idx: s.idx, count: s.count, h: v };
          const onSnake = !(s.h === 0 && v === 0);
          return { stage: 'H', idx: s.idx + 1, count: s.count + (onSnake ? 1 : 0) };
        }
        return { stage: 'done', count: s.count, digit: v };
      },
      accept: (s) => s.stage === 'done' && s.digit === s.count,
      maxDepth: 2 * k + 1,
    }, shape));
  }
  return greyCountSpecCache.get(k);
};
const greyCounts = GREY.map((cell) => {
  const neighbours = graph.kingNeighbours(cell);
  return new NFA(
    greyCountSpecFor(neighbours.length), 'grey cell snake-neighbour count',
    ...neighbours.flatMap((n) => [H.at(n), L.at(n)]), cell);
});

// -- Position increments along the drawn step -----------------------------
//
// For each directed step (from, d, to): either T(from) is not d (this
// step's arithmetic does not apply), or it is d and to's position is
// exactly one more than from's.
const directedSteps = cells.flatMap(
  (cell) => stepsFrom.get(cell).map((d) => [cell, d, graph.step(cell, ...STEPS[d])]));
const positionIncrements = directedSteps.map(([from, d, to]) => new Or([
  new And([
    new Given(T.at(from), d),
    new Sum(1, [H.at(to), 9], [L.at(to), 1], [H.at(from), -9], [L.at(from), -1]),
  ]),
  new Given(T.at(from), 0, ...stepsFrom.get(from).filter((e) => e !== d)),
]));

// -- On/off membership consistency ----------------------------------------
//
// For a free cell: off the snake (VH=0, VL=0) forces no successor; on the
// snake forces some real successor (T restricted away from 0). R5C1 and
// R8C2 are pinned directly below; grey cells are pinned off directly.
const off = (cell) => new And([new Given(H.at(cell), 0), new Given(L.at(cell), 0)]);
const membershipChecks = freeCells.flatMap((cell) => [
  new Or([new Given(H.at(cell), ...range(1, 8)), new Given(L.at(cell), ...range(1, 8)), new Given(T.at(cell), 0)]),
  new Or([off(cell), new Given(T.at(cell), ...stepsFrom.get(cell))]),
  // Only R5C1 may sit at position 1: without this, a second free cell
  // could seed its own degree-0-predecessor chain.
  new Or([new Given(H.at(cell), ...range(1, 8)), new Given(L.at(cell), 0, ...range(2, 8))]),
]);

// -- No touching, not even diagonally --------------------------------------
//
// Orthogonally-adjacent cells: at least one is off the snake, or they are
// the actual drawn step between them (in either direction).
//
// Diagonally adjacent cells a, b: at least one is off the snake, or the
// snake turns a 90-degree corner through one of the (up to two) cells m
// orthogonally adjacent to both -- an unavoidable side effect of any turn,
// since a step in one orthogonal direction followed by a step in a
// perpendicular direction always leaves the cell before and the cell after
// diagonally adjacent. Any other diagonal adjacency is the snake
// approaching a non-consecutive part of itself, which is what the rule
// forbids.
const linked = (a, b, dAB) => new Or([new Given(T.at(a), dAB), new Given(T.at(b), OPP(dAB))]);
const orthogonalTouches = [];
const diagonalTouches = [];
for (const cell of cells) {
  const right = graph.step(cell, 0, 1);
  if (right) orthogonalTouches.push([cell, right, 4, 3]);
  const down = graph.step(cell, 1, 0);
  if (down) orthogonalTouches.push([cell, down, 2, 1]);
  const se = graph.step(cell, 1, 1);
  if (se) {
    diagonalTouches.push([
      cell, se,
      [graph.step(cell, 0, 1), 4, 2], // via the cell right of a / above b
      [graph.step(cell, 1, 0), 2, 4], // via the cell below a / left of b
    ]);
  }
  const sw = graph.step(cell, 1, -1);
  if (sw) {
    diagonalTouches.push([
      cell, sw,
      [graph.step(cell, 0, -1), 3, 2], // via the cell left of a / above b
      [graph.step(cell, 1, 0), 2, 3], // via the cell below a / right of b
    ]);
  }
}
const orthogonalChecks = orthogonalTouches.map(([a, b, dAB, dBA]) => new Or([
  off(a), off(b), new Given(T.at(a), dAB), new Given(T.at(b), dBA),
]));
const diagonalChecks = diagonalTouches.map(([a, b, ...corners]) => new Or([
  off(a), off(b),
  ...corners
    .filter(([m]) => m !== null)
    .map(([m, dAM, dMB]) => new And([linked(a, m, dAM), linked(m, b, dMB)])),
]));

return [
  shape,
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  ...GIVENS,

  T.toVar('snake step'), H.toVar('snake position hi'), L.toVar('snake position lo'),
  ...cells.map((cell) => new Given(T.at(cell), 0, ...stepsFrom.get(cell))),
  H.makeReplicate(new Given(H.at(cells[0]), ...range(0, 8))),
  L.makeReplicate(new Given(L.at(cells[0]), ...range(0, 8))),

  // Grey cells: fixed off the snake.
  ...GREY.flatMap((cell) => [
    new Given(H.at(cell), 0), new Given(L.at(cell), 0), new Given(T.at(cell), 0),
  ]),
  // R5C1: position 1, must have a successor.
  new Given(H.at(START), 0), new Given(L.at(START), 1),
  new Given(T.at(START), ...stepsFrom.get(START)),
  // R8C2: the snake's far end, so no successor; still on the snake.
  new Given(T.at(END), 0),
  new Or([new Given(H.at(END), ...range(1, 8)), new Given(L.at(END), ...range(1, 8))]),

  ...membershipChecks,
  ...predecessorChecks,
  ...positionIncrements,
  ...orthogonalChecks,
  ...diagonalChecks,
  ...greyCounts,
  ...mirrorChecks,
];
