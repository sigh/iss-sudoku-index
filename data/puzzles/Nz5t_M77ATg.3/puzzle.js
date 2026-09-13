// Title: Slitherlink: The Puzzle You've Requested For 2 Years! (3)
// Author: Palmer Mebane
// Video: https://www.youtube.com/watch?v=Nz5t_M77ATg
// Source: http://pzv.jp/p.html?slither/10/10/8638168bjbh716616cn3811162cn827738dhcj8616388b

// Slitherlink. Draw a single loop along the grid lines (cell edges, including
// the outer frame) that never crosses or touches itself. Each numbered cell's
// clue is the count of its four edges the loop uses. Nothing is omitted.
//
// The board carries no digits, so the whole puzzle is this loop; there is no
// Sudoku layer to disable beyond dropping every implicit row/column rule.
//
// Modelled as the loop's inside/outside side rather than one variable per
// edge: each cell is OUT or IN, and an edge lies on the loop exactly where
// its two cells differ. A clue then reads as "N of my four neighbours differ
// from me", never mentioning edges directly, and every lattice vertex on the
// IN/OUT boundary
// is automatically even-degree (0, 2 or 4) with no separate degree rule
// needed. Two further checks close the topology to exactly one simple loop:
// no diagonal self-touch (else a vertex reaches degree 4, i.e. the loop
// crosses itself) and no enclosed hole (else the boundary is two loops, an
// outer one and one round the hole).

const ROWS = 10, COLS = 10;
const OUT = 1, IN = 2;   // the board's only two values: which side of the loop a cell is on

// Clues transcribed from the source's clue grid (row, col, value); cells with
// no printed number are simply absent from this list.
const CLUES = [
  [1, 1, 3], [1, 3, 1], [1, 5, 3], [1, 6, 3], [1, 8, 1], [1, 9, 1],
  [2, 1, 3], [2, 3, 1], [2, 10, 1],
  [3, 5, 2], [3, 7, 1], [3, 8, 1], [3, 10, 1],
  [4, 2, 1], [4, 3, 1], [4, 5, 2],
  [5, 6, 3], [5, 7, 3], [5, 9, 1], [5, 10, 1],
  [6, 1, 1], [6, 2, 1], [6, 4, 2], [6, 5, 2],
  [7, 6, 3], [7, 8, 2], [7, 9, 2],
  [8, 1, 2], [8, 3, 3], [8, 4, 3], [8, 6, 3],
  [9, 1, 2], [9, 8, 3], [9, 10, 1],
  [10, 2, 1], [10, 3, 1], [10, 5, 3], [10, 6, 3], [10, 8, 3], [10, 10, 1],
];

// No row/column/box rule at all: Raw drops every implicit Sudoku constraint.
const shape = new Shape(`${ROWS}x${COLS}`, `${OUT}-${IN}`, 'Raw');
const graph = cellGraph(shape);

// A 12x12 side layer padding the board with a 1-cell OUT ring on every side,
// built over a bare 12x12 parent so the overlay inherits its row/col
// adjacency (step, block, neighbours) instead of hand-rolled index math. The
// ring stands in for "outside the board is not enclosed", which both lets
// every clue read a uniform 4 neighbours (no boundary special-casing) and
// lets a single hole-freedom check (below) see the true exterior.
const padGraph = cellGraph(12, 12);
const pad = padGraph.makeOverlay('VP');
const padNative = padGraph.cells();
const padAt = (row, col) => pad.at(padNative[(row - 1) * 12 + (col - 1)]);

// Ring givens: pad row/col 1 and 12 are always OUT. Board R{r}C{c} lives at
// pad position (r+1, c+1), so the ring is exactly pad rows/cols 1 and 12.
const ringGivens = [];
for (let col = 1; col <= 12; col++) {
  ringGivens.push(new Given(padAt(1, col), OUT));
  ringGivens.push(new Given(padAt(12, col), OUT));
}
for (let row = 2; row <= 11; row++) {
  ringGivens.push(new Given(padAt(row, 1), OUT));
  ringGivens.push(new Given(padAt(row, 12), OUT));
}

// The pad's interior always equals the board: pad(r+1, c+1) === R{r}C{c}.
// SameValues(2, a, b) splits its two cells into two 1-cell sets and requires
// them to hold the same value, i.e. plain equality -- one call per cell pair,
// same as a two-cell Pair would need, but without hand-building an
// equality key.
const mirrors = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    mirrors.push(new SameValues(2, padAt(r + 1, c + 1), makeCellId(r, c)));
  }
}

// No diagonal self-touch: a 2x2 block whose only IN cells are a diagonal
// pair is a vertex the loop passes through twice (degree 4), which is a
// crossing/touching loop, not a simple one. Checked over every 2x2 block of
// the padded layer (121 of them); ring-only blocks are never a checkerboard,
// so including them costs nothing.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === IN];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
const blockOrigins = [];
for (let row = 1; row <= 11; row++) {
  for (let col = 1; col <= 11; col++) blockOrigins.push(padAt(row, col));
}
const noDiagonalTouches = pad.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'no diagonal touch', ...pad.block(blockOrigins[0], 2, 2))],
  blockOrigins);

// Closing the loop: IN cells form one connected region (the loop's inside),
// and OUT cells (padded ring included) form one connected region (the loop's
// outside, with no enclosed hole -- a hole would show up as a second,
// unreachable OUT component walled off by IN, which this rejects). Both
// together, with no self-touch above, force the IN/OUT boundary to be
// exactly one simple loop. Checked on the pad layer, not the bare board, so
// "reaches outside" is a real component rather than an edge case at the
// frame -- see the ring comment above.
const connectivity = [
  new ConnectedValues('VP', IN),
  new ConnectedValues('VP', OUT),
];

// Each clue reads its own pad cell plus its four orthogonal neighbours
// (always present in the padded layer, even at the board's own edge) and
// counts how many differ from it. One compiled machine per distinct clue
// value actually used (1, 2 or 3 here), shared across every cell with that
// clue.
const clueMachines = new Map();
function clueMachine(target) {
  if (!clueMachines.has(target)) {
    clueMachines.set(target, NFA.encodeSpec({
      startState: { self: null, count: 0, seen: 0 },
      transition: (state, value) => {
        if (state.self === null) return { self: value, count: 0, seen: 0 };
        return {
          self: state.self,
          count: state.count + (value !== state.self ? 1 : 0),
          seen: state.seen + 1,
        };
      },
      accept: (state) => state.seen === 4 && state.count === target,
      maxDepth: 5,   // self + 4 neighbours, fixed length; without this seen/count climb forever
    }, shape));
  }
  return clueMachines.get(target);
}
const clueRules = CLUES.map(([r, c, value]) => {
  const self = padAt(r + 1, c + 1);
  const neighbours = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dr, dc]) => pad.step(self, dr, dc));
  return new NFA(clueMachine(value), 'slitherlink clue', self, ...neighbours);
});

return [
  shape,
  pad.toVar('board padded with a 1-cell OUT ring'),
  ...ringGivens,
  ...mirrors,
  noDiagonalTouches,
  ...connectivity,
  ...clueRules,
];
