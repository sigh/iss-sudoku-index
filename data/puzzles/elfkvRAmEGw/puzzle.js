// Title: Mathemagics
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=elfkvRAmEGw
// Source: https://sudokupad.app/7BghrPt24L

// Rules encoded (the grid starts empty; every clue below is a global rule):
//  1. Normal Sudoku.
//  2. Draw a one-cell-wide loop moving orthogonally through cell centres. It
//     does not branch, intersect itself, or touch itself orthogonally or
//     diagonally.
//  3. The loop visits every box at least once.
//  4. Box k (reading order) holds at most k loop cells.
//  5. In box k, the cell whose digit is k is on the loop.
//  6. Two orthogonally adjacent cells may hold digits summing to 7 or 10 only
//     when both cells are off the loop.
//  7. Exactly 24 cells are enclosed by the loop, and they contain two magic
//     squares: a 3x3 block holding 1-9 once each whose three rows, three
//     columns and two diagonals all share one sum.
// Nothing is omitted.

const ON = 1;                 // VL: loop membership
const OFF = 2;
const IN = 1;                 // VE: enclosed by the loop
const OUT = 2;
const CHOSEN = 2;             // VM: this 3x3 block is one of the two magic squares
const UNCHOSEN = 1;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// One Var cell per grid cell for loop membership (VL1..VL81, grid order) and
// one for enclosure (VE1..VE81).
const loop = graph.makeOverlay('VL');
const enclosure = graph.makeOverlay('VE');

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  enclosure.makeReplicate(new Given(enclosure.cells()[0], IN, OUT)),
];

// --- Rule 2, degree: each on-loop cell has exactly two on-loop orthogonal
// neighbours. Reads the cell's own membership, then each neighbour's; an off
// cell is unconstrained.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- Rule 2, no diagonal self-touch: forbid a 2x2 block whose only on cells
// are one of its two diagonals. The other diagonal cell of a 90-degree turn is
// always diagonally adjacent, so the pattern is only illegal when neither
// orthogonal cell between them is on the loop. Reads the four membership cells
// of the block, left-to-right then top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, numValues);
// One template on the top-left 2x2 block, replicated onto every other block's
// top-left cell; cells on the bottom or right edge start no block.
const blockTopLefts = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(blockTopLefts[0], 2, 2))),
  loop.at(blockTopLefts));

// --- Rules 3 and 4: box k holds between 1 and k loop cells. One machine per
// box, counting on-loop cells and dying as soon as the box's cap is passed.
const boxCounts = graph.boxes().map((box, i) => {
  const cap = i + 1;                      // boxes are numbered in reading order
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, membership) => {
      const next = count + (membership === ON ? 1 : 0);
      return next > cap ? undefined : { count: next };
    },
    accept: ({ count }) => count >= 1,
  }, numValues);
  return new NFA(machine, `box-${cap}-loop-cells`, ...loop.at(box));
});

// --- Rule 5: in box k, the cell holding digit k is on the loop. One relation
// per cell between its digit and its membership: the digit being k forces ON.
const boxDigitOnLoop = graph.boxes().flatMap((box, i) => {
  const boxNumber = i + 1;
  const key = Pair.fnToKey(
    (digit, membership) => digit !== boxNumber || membership === ON, geometry);
  return box.map(cell => new Pair(
    key, `box-${boxNumber}-digit-on-loop`, cell, loop.at(cell)));
});

// --- Rule 6: an orthogonally adjacent pair summing to 7 or 10 needs both cells
// off the loop. Scans a whole row or column as (membership, digit) per cell,
// carrying the previous cell's pair so each adjacency is tested once.
const forbiddenSums = [7, 10];
const adjacentSumMachine = NFA.encodeSpec({
  startState: { phase: 'membership', prevOn: null, prevDigit: null },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return {
        phase: 'digit', prevOn: state.prevOn, prevDigit: state.prevDigit,
        on: value === ON,
      };
    }
    const { prevOn, prevDigit, on } = state;
    if (prevDigit !== null && (prevOn || on)
      && forbiddenSums.includes(prevDigit + value)) return undefined;
    return { phase: 'membership', prevOn: on, prevDigit: value };
  },
  accept: ({ phase }) => phase === 'membership',
}, numValues);
const adjacentSums = [...graph.rows(), ...graph.columns()].map(line =>
  new NFA(adjacentSumMachine, 'sum-7-10',
    ...line.flatMap(cell => [loop.at(cell), cell])));

// --- Rule 7, enclosure: a loop through cell centres crosses a cell border only
// between two cells it occupies, so a ray cast leftward from just above a
// cell's centre meets the loop exactly at the cells of that row that are joined
// to the cell above them. The cell is inside the loop when that crossing count
// is odd. One machine per row reads, for each column left to right, the
// membership above, the membership here, and the enclosure flag here; it
// carries the running crossing parity and forces the flag at every column.
const enclosureMachine = NFA.encodeSpec({
  startState: { parity: 0, phase: 'above' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'above':
        return { parity: state.parity, phase: 'self', above: value === ON };
      case 'self': {
        const self = value === ON;
        return {
          // A crossing is a loop edge joining this cell to the one above it.
          parity: state.parity ^ (state.above && self ? 1 : 0),
          phase: 'flag',
          // Cells on the loop are on the loop, not inside it.
          expectIn: !self && state.parity === 1,
        };
      }
      case 'flag':
        return (value === IN) === state.expectIn
          ? { parity: state.parity, phase: 'above' }
          : undefined;
    }
  },
  accept: ({ phase }) => phase === 'above',
}, numValues);
const rows = graph.rows();
const enclosureScans = rows.slice(1).map((row, i) => new NFA(
  enclosureMachine, 'enclosure',
  ...row.flatMap((cell, c) => [loop.at(rows[i][c]), loop.at(cell), enclosure.at(cell)])));
// No loop edge can cross above row 1, so its crossing count is always empty.
const topRowOutside = rows[0].map(cell => new Given(enclosure.at(cell), OUT));
// Exactly 24 enclosed cells: the flags sum to 2*81 - 24.
const enclosedCount = new Sum(
  OUT * gridCells.length - (OUT - IN) * 24, ...enclosure.cells());

// --- Rule 7, magic squares: one flag Var per 3x3 block position (49 of them,
// top-left corners R1C1..R7C7 in reading order); exactly two flags are chosen,
// and a chosen block is wholly enclosed and magic. A 3x3 block holding 1-9 once
// each with equal row, column and diagonal sums has all eight sums equal to 15,
// so AllDifferent plus EqualSum states the rule without naming the total.
const magicTopLefts = gridCells.filter(cell => graph.block(cell, 3, 3));
const magicFlags = new Var('M', 'magic', magicTopLefts.length);
const magicFlagCells = magicFlags.cells();
const magicSquares = magicTopLefts.map((topLeft, i) => {
  const block = graph.block(topLeft, 3, 3);
  const blockRows = [0, 1, 2].map(r => block.slice(3 * r, 3 * r + 3));
  const blockCols = [0, 1, 2].map(c => [block[c], block[c + 3], block[c + 6]]);
  const diagonals = [[block[0], block[4], block[8]], [block[2], block[4], block[6]]];
  return new Or([
    new Given(magicFlagCells[i], UNCHOSEN),
    new And([
      ...block.map(cell => new Given(enclosure.at(cell), IN)),
      new AllDifferent(...block),
      new EqualSum(...blockRows, ...blockCols, ...diagonals),
    ]),
  ]);
});
const magicFlagDomain = magicFlagCells.map(
  cell => new Given(cell, UNCHOSEN, CHOSEN));
const magicFlagCount = new Sum(
  UNCHOSEN * magicFlagCells.length + (CHOSEN - UNCHOSEN) * 2, ...magicFlagCells);

return [
  shape,
  loop.toVar('loop'),
  enclosure.toVar('enclosed'),
  magicFlags,
  ...membership,
  // Rule 2, single loop: the on-loop cells form one orthogonally-connected
  // region. With every on cell 2-regular, one connected region is one cycle.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...boxCounts,
  ...boxDigitOnLoop,
  ...adjacentSums,
  ...enclosureScans,
  ...topRowOutside,
  enclosedCount,
  ...magicFlagDomain,
  magicFlagCount,
  ...magicSquares,
];
