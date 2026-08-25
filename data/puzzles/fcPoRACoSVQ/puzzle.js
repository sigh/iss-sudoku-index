// Title: The Night Before Christmas Sudoku
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=fcPoRACoSVQ
// Source: https://app.crackingthecryptic.com/sudoku/B87B8q8m2q
//
// Normal sudoku (default 9x9 rows/columns/boxes).
//
// Row/column indexing: for every row, the digit X in column 1 places digit 1
// at column X of that row; for every column, the digit X in row 1 places
// digit 1 at row X of that column. This is exactly `Indexing` applied to
// column 1 (COL_INDEXING) and to row 1 (ROW_INDEXING).
//
// Santa's path: a single orthogonal path between the two circled cells that
// never touches itself (orthogonally or diagonally), never enters the red
// region, and never crosses a cell holding digit 1; the path's digits total
// 165. Grey "house" cells are off the path, and each house's own digit (never
// 1) counts how many of its up-to-8 king neighbours lie on the path.
//
// Path membership and the "digit contributed to the path total" are the same
// fact, so they share one overlay `VP` (path digit): 0 means off-path, and a
// value 2-9 means on-path holding that digit (1 is excluded from the overlay
// domain, see below). The grid is widened to 0-9 for this overlay; the real
// grid cells are restricted back to 1-9.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Restrict the real grid cells back to the true 1-9 digit range.
const digitRestriction = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const givens = [
  new Given('R3C9', 7),
  new Given('R4C3', 9), new Given('R4C4', 7), new Given('R4C6', 6),
  new Given('R6C9', 6),
  new Given('R7C7', 9),
  new Given('R8C4', 8),
  new Given('R9C2', 6),
  new Given('R9C9', 4),
];

// Row 1 begins column indexing (COL_INDEXING) with column 1's own cells;
// column 1 begins row indexing (ROW_INDEXING) with row 1's own cells -- see
// js/solver/sudoku_builder.js: each control cell in the list gets its own
// Indexing handler over its own row/column, keyed by the control cell's own
// column/row identity (here always 1, since every control cell sits in
// column 1 / row 1), which forces digit 1 in that unit to the position named
// by the control cell's value.
const rowIndexing = new Indexing(Indexing.COL_INDEXING, ...graph.column(1));
const colIndexing = new Indexing(Indexing.ROW_INDEXING, ...graph.row(1));

// --- Path digit overlay -----------------------------------------------
const OFF = 0;
const pd = graph.makeOverlay('VP');

// Every VP cell is 0 (off) or the grid digit at large (2-9); value 1 is
// excluded from the overlay's own domain (never claimed as an on-path digit)
// -- this is what makes "the path may not contain a 1" hold: a cell whose
// grid digit is 1 can then only satisfy the link below with VP = 0.
const pdRestriction = pd.makeReplicate(new Given(pd.cells()[0], 0, 2, 3, 4, 5, 6, 7, 8, 9));

// Link each cell's VP to its own grid digit: VP is 0, or equal to the digit.
const linkKey = Pair.fnToKey((digit, extra) => extra === OFF || extra === digit, shape);
const links = gridCells.map(cell => new Pair(linkKey, 'path digit link', cell, pd.at(cell)));

// Red region: all of row 1 and column 1 (17 cells) -- never on the path.
const redRegion = [...new Set([...graph.row(1), ...graph.column(1)])];
const redOff = redRegion.map(cell => new Given(pd.at(cell), OFF));

// Houses: the grey-shaded cells; never on the path.
const houses = ['R2C6', 'R2C8', 'R3C3', 'R4C7', 'R6C3', 'R6C5', 'R7C1', 'R7C6', 'R8C9'];
const housesOff = houses.map(cell => new Given(pd.at(cell), OFF));
// A house's own digit is the neighbour count, and the rules say it is never 1.
const houseDigitRestriction = houses.map(cell => new Given(cell, 2, 3, 4, 5, 6, 7, 8, 9));

// Path endpoints: the two circled cells.
const circles = ['R2C2', 'R2C7'];
const circlesOn = circles.map(cell => new Given(pd.at(cell), 2, 3, 4, 5, 6, 7, 8, 9));

// --- Degree: on-path cells have exactly 2 on-path orthogonal neighbours,
// except the two endpoints, which have exactly 1. Off-path cells are free.
// Reads this cell's VP, then each orthogonal neighbour's VP.
function makeDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, pdValue) => {
      if (phase === 'start') {
        return pdValue !== OFF ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (pdValue !== OFF ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, shape);
}
const degreeTwo = makeDegreeMachine(2);
const degreeOne = makeDegreeMachine(1);
const degrees = gridCells.map(cell => new NFA(
  circles.includes(cell) ? degreeOne : degreeTwo, 'degree',
  ...pd.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells
// are a diagonal pair.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, pdValue) => {
    if (block === null) return { block: null };
    const next = [...block, pdValue !== OFF];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
// One template (over the origin cell's own 2x2 block), replicated onto every
// other in-grid 2x2 block's top-left position.
const touchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...pd.at(graph.block(gridCells[0], 2, 2)));
const touchTargets = pd.at(gridCells.filter(cell => graph.block(cell, 2, 2)));
const noDiagonalTouches = [pd.makeReplicate(touchTemplate, touchTargets)];

// --- House counts: a house's own digit equals the number of its king
// neighbours that are on the path.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value !== OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, shape);
const houseCounts = houses.map(cell => new NFA(countMachine, 'count',
  cell, ...pd.at(graph.kingNeighbours(cell))));

return [
  shape,
  digitRestriction,
  ...givens,
  rowIndexing,
  colIndexing,
  pd.toVar('path digit'),
  pdRestriction,
  ...links,
  // Single connected path: with the degree rule above (1 at the two
  // endpoints, 2 elsewhere), one connected on-path region is one simple path.
  new ConnectedValues('VP', [2, 3, 4, 5, 6, 7, 8, 9]),
  ...redOff,
  ...housesOff,
  ...houseDigitRestriction,
  ...circlesOn,
  ...degrees,
  ...noDiagonalTouches,
  ...houseCounts,
  // Santa's path totals 165: off-path cells contribute 0, on-path cells
  // contribute their own digit.
  new Sum(165, ...pd.cells()),
];
