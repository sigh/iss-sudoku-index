// Title: Corners and Sum Lines
// Author: Jolly Rogers
// Video: https://www.youtube.com/watch?v=e0A6XymJpeM
// Source: https://sudokupad.app/7FngrT9ftq

// Rules encoded here:
//   1. Normal sudoku rules apply.
//   2. The grid divides into non-overlapping square-shaped regions; every cell
//      belongs to one, and a 1x1 square region is not valid.
//   3. The sum of a square's four corner cells is divisible by the number of
//      cells that square contains (n*n for an n x n square).
//   4. The cell containing the red circle, R7C7, is not a corner of any square
//      region.
//   5. Orthogonally adjacent cells separated by a square region border have the
//      same parity.
//   6. Square region borders divide each blue line into segments with the same
//      sum, and each line is divided at least once.
// There are no givens. Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The undrawn square partition is carried by three overlays over the grid:
//   SZ = the side length of the square containing the cell, 2..9 (rule 2 rules
//        out side 1, and the grid caps it at 9),
//   RE = 1 when the cell is in the rightmost column of its square, else 2,
//   BE = 1 when the cell is in the bottom row of its square, else 2.
// So a square region border sits between a cell and its right neighbour exactly
// when that cell's RE reads 1, and between a cell and the cell below it exactly
// when its BE reads 1. Rules 3-6 all read borders off RE/BE.
const SZ = graph.makeOverlay('VS');
const RE = graph.makeOverlay('VE');
const BE = graph.makeOverlay('VD');
const domain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// Run scan (rule 2, part one). Reading a line of cells as side length followed
// by edge flag, side length followed by edge flag, ..., a run of cells sharing
// one side length s must close exactly at the sth cell: the flag reads 1 there
// and 2 on the earlier cells of the run, and the following cell starts a fresh
// run. `owed` counts the cells the current run still needs and `sz` is the
// length it committed to; because the countdown resets at exactly s no matter
// what the next cell holds, two equal-size squares placed back to back stay two
// runs instead of merging into one long one.
const runNFA = NFA.encodeSpec({
  startState: { onSize: true, owed: 0 },
  transition: (state, value) => {
    if (state.onSize) {
      if (state.owed === 0) return { onSize: false, sz: value, left: value - 1 };
      if (value !== state.sz) return undefined;
      return { onSize: false, sz: state.sz, left: state.owed - 1 };
    }
    // A flag cell: it must read 1 on the run's last cell and 2 on every other.
    if (value !== (state.left === 0 ? 1 : 2)) return undefined;
    return state.left === 0
      ? { onSize: true, owed: 0 }
      : { onSize: true, owed: state.left, sz: state.sz };
  },
  accept: (state) => state.onSize && state.owed === 0,
}, shape);

const interleave = (a, b) => a.flatMap((cell, i) => [cell, b[i]]);
const rowRuns = graph.rows().map((_, i) =>
  new NFA(runNFA, `row${i + 1}`,
    ...interleave(SZ.row(i + 1), RE.row(i + 1))));
const colRuns = graph.columns().map((_, i) =>
  new NFA(runNFA, `col${i + 1}`,
    ...interleave(SZ.column(i + 1), BE.column(i + 1))));

// Run scan (rule 2, part two): cells of one square agree on where its edges
// are. Two cells one above the other in the same square (BE reads 2 between
// them) sit in the same column of that square, so their RE flags match; two
// cells side by side in the same square sit in the same row of it, so their BE
// flags match. The row and column scans alone do not imply this: without it
// they also accept pinwheel arrangements where four overlapping blocks each
// scan correctly but tile nothing. Checked exhaustively over 9x9 -- with these
// added, the accepted assignments are exactly the 50 partitions of a 9x9 into
// squares of side 2 or more.
const flagsAgree = [
  ...graph.cells().flatMap((cell) => {
    const below = graph.step(cell, 1, 0);
    return below === null ? [] : [new Or([
      new Given(BE.at(cell), 1),
      new SameValues(2, RE.at(cell), RE.at(below)),
    ])];
  }),
  ...graph.cells().flatMap((cell) => {
    const right = graph.step(cell, 0, 1);
    return right === null ? [] : [new Or([
      new Given(RE.at(cell), 1),
      new SameValues(2, BE.at(cell), BE.at(right)),
    ])];
  }),
];

// Rule 3, as divisibility rather than a list of reachable totals: walk the four
// corner cells carrying the running total modulo the square's cell count, and
// accept only a zero residue. One machine per side length, reused at every
// position that side length could sit at.
const divisibleNFA = (cellCount) => NFA.encodeSpec({
  startState: { mod: 0 },
  transition: ({ mod }, value) => ({ mod: (mod + value) % cellCount }),
  accept: ({ mod }) => mod === 0,
}, shape);

const SIDES = [2, 3, 4, 5, 6, 7, 8, 9];
const cornerSums = SIDES.flatMap((side) => {
  const nfa = divisibleNFA(side * side);
  return graph.cells().flatMap((topLeft) => {
    const block = graph.block(topLeft, side, side);
    if (block === null) return [];
    // The square of side `side` with this top-left cell exists exactly when the
    // cell reports that side length and has a border above it and to its left;
    // the grid edge counts as one, so a missing neighbour drops that branch.
    // Negating each condition gives the "no such square here" branches of the
    // implication.
    const leftNeighbour = RE.step(RE.at(topLeft), 0, -1);
    const upNeighbour = BE.step(BE.at(topLeft), -1, 0);
    const absent = [
      new Given(SZ.at(topLeft), ...SIDES.filter((s) => s !== side)),
      ...(leftNeighbour === null ? [] : [new Given(leftNeighbour, 2)]),
      ...(upNeighbour === null ? [] : [new Given(upNeighbour, 2)]),
    ];
    const corners = [
      block[0], block[side - 1],
      block[side * (side - 1)], block[side * side - 1],
    ];
    return [new Or([...absent, new NFA(nfa, `sq${side}`, ...corners)])];
  });
});

// Rule 4. R7C7 is a corner of its square when it is in that square's leftmost
// or rightmost column AND in its top or bottom row; it is in the leftmost
// column when a border runs down its left side, i.e. R7C6's RE reads 1, and in
// the top row when R6C7's BE reads 1. Denying that conjunction leaves two ways
// out: neither vertical border is present, or neither horizontal one is.
const circleNotCorner = new Or([
  new And([new Given(RE.at('R7C6'), 2), new Given(RE.at('R7C7'), 2)]),
  new And([new Given(BE.at('R6C7'), 2), new Given(BE.at('R7C7'), 2)]),
]);

// Rule 5.
const sameParity = Pair.fnToKey((a, b) => (a % 2) === (b % 2), shape);
const borderParity = graph.cells().flatMap((cell) => [
  [graph.step(cell, 0, 1), RE.at(cell)],
  [graph.step(cell, 1, 0), BE.at(cell)],
].flatMap(([neighbour, borderFlag]) => neighbour === null ? [] : [new Or([
  new Given(borderFlag, 2),
  new Pair(sameParity, 'border-parity', cell, neighbour),
])]));

// Rule 6. The five blue lines, transcribed from the payload's `lines` entries
// with each stroke's waypoints filled in cell by cell.
const blueLines = [
  ['R6C3', 'R7C3', 'R8C2'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4'],
  ['R6C4', 'R6C5', 'R5C5', 'R4C5', 'R5C6', 'R6C7', 'R7C6', 'R8C6'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R5C8', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
];

// Whether a line step crosses a square region border. An orthogonal step is
// separated by exactly one drawn border, so its flag is an existing RE or BE
// cell. A diagonal step passes through a lattice point instead: its two cells
// lie in the same square only when the whole 2x2 block round that point does,
// which is the block's top-left cell joining both right (RE = 2) and down
// (BE = 2). That needs two overlay cells to agree, so those steps get a flag
// cell of their own, tied to the pair by `diagonalFlagTies` below.
const diagonalSteps = blueLines.flatMap((line) =>
  line.slice(1).map((cell, i) => [line[i], cell])
    .filter(([a, b]) => parseCellId(a).row !== parseCellId(b).row
      && parseCellId(a).col !== parseCellId(b).col));
const diagonalCut = new Var('K', 'blue-line diagonal-step cut flags',
  String(diagonalSteps.length));
const diagonalFlag = new Map(diagonalSteps.map(
  ([a, b], i) => [`${a}/${b}`, diagonalCut.cell(i + 1)]));

// The top-left cell of the 2x2 block a diagonal step spans.
const blockCorner = (a, b) => {
  const pa = parseCellId(a);
  const pb = parseCellId(b);
  return makeCellId(Math.min(pa.row, pb.row), Math.min(pa.col, pb.col));
};

const diagonalFlagTies = diagonalSteps.map(([a, b]) => {
  const corner = blockCorner(a, b);
  const flag = diagonalFlag.get(`${a}/${b}`);
  return new Or([
    new And([
      new Given(flag, 2),
      new Given(RE.at(corner), 2),
      new Given(BE.at(corner), 2),
    ]),
    new And([
      new Given(flag, 1),
      new Or([new Given(RE.at(corner), 1), new Given(BE.at(corner), 1)]),
    ]),
  ]);
});

const stepFlag = (a, b) => {
  const pa = parseCellId(a);
  const pb = parseCellId(b);
  if (pa.row !== pb.row && pa.col !== pb.col) return diagonalFlag.get(`${a}/${b}`);
  if (pa.row === pb.row) return RE.at(pa.col < pb.col ? a : b);
  return BE.at(pa.row < pb.row ? a : b);
};

// Equal-sum segments over the discovered partition: scan the line as digit,
// cut flag, digit, cut flag, ..., digit. `total` is the running segment sum and
// `target` the sum the first completed segment fixed for all of them (0 while
// no cut has been seen yet). Accepting only with `target` set is the "each line
// must be divided at least once" clause. `maxSegment` bounds the state: with at
// least two segments the shortest holds at most half the line's cells, so no
// segment sum can exceed 9 times that.
const equalSegmentNFA = (maxSegment) => NFA.encodeSpec({
  startState: { onDigit: true, target: 0, total: 0 },
  transition: (state, value) => {
    if (state.onDigit) {
      const total = state.total + value;
      if (total > (state.target || maxSegment)) return undefined;
      return { onDigit: false, target: state.target, total };
    }
    // A cut flag: 1 = a border falls on this step, 2 = none does.
    if (value === 2) return { ...state, onDigit: true };
    if (value !== 1) return undefined;
    if (state.target === 0) return { onDigit: true, target: state.total, total: 0 };
    if (state.total !== state.target) return undefined;
    return { onDigit: true, target: state.target, total: 0 };
  },
  accept: (state) =>
    !state.onDigit && state.target > 0 && state.total === state.target,
}, shape);

const lineSums = blueLines.map((line, i) => {
  const scan = line.flatMap((cell, j) =>
    j === line.length - 1 ? [cell] : [cell, stepFlag(cell, line[j + 1])]);
  return new NFA(
    equalSegmentNFA(9 * Math.floor(line.length / 2)), `line${i + 1}`, ...scan);
});

return [
  shape,
  SZ.toVar('SquareSide'), RE.toVar('RightEdge'), BE.toVar('BottomEdge'),
  diagonalCut,
  domain(SZ, ...SIDES), domain(RE, 1, 2), domain(BE, 1, 2),
  ...diagonalCut.cells().map((cell) => new Given(cell, 1, 2)),
  ...rowRuns, ...colRuns, ...flagsAgree,
  ...cornerSums,
  circleNotCorner,
  ...borderParity,
  ...diagonalFlagTies, ...lineSums,
];
