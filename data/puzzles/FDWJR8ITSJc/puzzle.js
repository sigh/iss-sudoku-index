// Title: The Snake Nest
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=FDWJR8ITSJc
// Source: https://app.crackingthecryptic.com/webapp/LJQfd6G3JQ

// Rules:
//  * Normal sudoku rules apply, and some snakes are hiding in the grid. A snake
//    is a one-cell-wide path with a head cell and a tail cell; it may touch
//    itself diagonally but not orthogonally, and never revisits a cell.
//  * The cells not covered by snakes form exactly 8 orthogonally connected
//    areas, one of each size from 1 to 8 cells. These are the snake eggs.
//  * An egg of size n contains the digits 1 to n exactly once.
//  * Eggs must not touch orthogonally, but they may touch diagonally.
//  * The given digits mark the position of the highest number of each egg.
//  * The snakes connect to each other into a single orthogonally connected area
//    of snake cells, in which no 2x2 region is entirely snake cells. Separate
//    snakes may connect orthogonally anywhere, including at head cells.
//  * A snake's head and tail cell contain the same digit (which may differ
//    between snakes). Digits along a snake are otherwise unrestricted.
//
// Omitted: how the snake area divides into individual snakes. Nothing here
// requires the snake cells to be coverable by simple paths that never touch
// themselves orthogonally, and the head/tail same-digit rule is dropped with
// them, because the heads and tails are only defined by that division. What the
// snakes impose on the *area* they cover -- one orthogonally connected region,
// no 2x2 fully covered -- is encoded below.
//
// The eight givens hold 1 to 8 with no repeat, and an egg of size n has n as its
// highest digit, so the given holding n is the highest number of the size-n egg
// and lies in it. That pairing is the ANCHORS table; nothing else fixes which
// egg is which, and no other cell may be pinned to an egg.

const SNAKE = 9;                     // VE value for a cell covered by snakes
const EGG_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

// Drawn givens: the digit in each of the eight clued cells.
const GIVENS = [
  ['R2C1', 6], ['R2C3', 7], ['R2C8', 2], ['R3C7', 3],
  ['R4C8', 4], ['R7C3', 8], ['R8C7', 5], ['R9C5', 1],
];

// egg size -> the cell holding that egg's highest digit, read off the givens.
const ANCHORS = new Map(GIVENS.map(([cell, digit]) => [digit, cell]));

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// VE: which area covers this cell -- 1..8 for the egg of that size, 9 for the
// snakes. Eggs are the connected components of the non-snake cells, so one
// value per egg size names each egg uniquely and carries its size as well.
const ve = graph.makeOverlay('VE');

const distance = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};

// An egg of size n is orthogonally connected and holds its anchor, so each of
// its cells is at most n-1 steps from that anchor.
const eggCandidates = (n) =>
  gridCells.filter(cell => distance(cell, ANCHORS.get(n)) <= n - 1);

const labelDomains = gridCells.map(cell => {
  const given = GIVENS.find(([c]) => c === cell);
  if (given) return new Given(ve.at(cell), given[1]);
  return new Given(ve.at(cell), SNAKE,
    ...EGG_SIZES.filter(n => distance(cell, ANCHORS.get(n)) <= n - 1));
});

// --- The areas -----------------------------------------------------------
// One connected area per egg size, and one connected area of snake cells over
// the 81 - (1+2+...+8) cells the eggs leave.
const eggCells = EGG_SIZES.reduce((a, b) => a + b, 0);
const areas = [
  ...EGG_SIZES.map(n => new ConnectedValues('VE', n, n)),
  new ConnectedValues('VE', SNAKE, gridCells.length - eggCells),
];

// --- Eggs must not touch orthogonally ------------------------------------
// Two orthogonally adjacent cells are never in two different eggs.
const eggsApartKey = Pair.fnToKey(
  (a, b) => a === SNAKE || b === SNAKE || a === b, shape);
// One template per direction, stamped onto every cell that has such a
// neighbour; together they cover each orthogonal edge of the grid once.
const eggsApart = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const origin = gridCells[0];
  const targets = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  return ve.makeReplicate(
    new Pair(eggsApartKey, 'eggs-apart',
      ...ve.at([origin, graph.step(origin, dRow, dCol)])),
    ve.at(targets));
});

// --- No 2x2 region is entirely snake cells -------------------------------
const no2x2 = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .map(block => new Or(
    ve.at(block).map(varCell => new Given(varCell, ...EGG_SIZES))));

// --- An egg of size n holds the digits 1 to n exactly once ---------------
// One machine per egg size, reading [VE, digit] of every cell that egg could
// reach. `seen` is the bitmask of digits already found on cells of this egg;
// a repeat or a digit above n rejects, and the scan must end holding all n
// digits -- which also makes the egg exactly n cells.
const eggDigitsMachine = (n) => NFA.encodeSpec({
  startState: { phase: 'label', seen: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { phase: 'digit', seen: state.seen, mine: value === n };
    }
    if (!state.mine) return { phase: 'label', seen: state.seen };
    if (value > n) return undefined;
    const bit = 1 << (value - 1);
    if (state.seen & bit) return undefined;
    return { phase: 'label', seen: state.seen | bit };
  },
  accept: (state) => state.phase === 'label' && state.seen === (1 << n) - 1,
}, geometry.numValues);

const eggDigits = EGG_SIZES.map(n => {
  const scan = eggCandidates(n).flatMap(cell => [ve.at(cell), cell]);
  // The size-1 egg has a single candidate cell, so the same rule reduces to a
  // relation on that cell's area and digit.
  if (scan.length === 2) {
    return new Pair(
      Pair.fnToKey((label, digit) => label === n && digit === n, shape),
      'egg-digits', ...scan);
  }
  return new NFA(eggDigitsMachine(n), 'egg-digits', ...scan);
});

return [
  shape,
  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),
  ve.toVar('area'),
  ...labelDomains,
  ...areas,
  ...eggsApart,
  ...no2x2,
  ...eggDigits,
];
