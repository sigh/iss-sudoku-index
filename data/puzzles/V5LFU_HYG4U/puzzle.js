// Title: Deflection
// Author: Myxo
// Video: https://www.youtube.com/watch?v=V5LFU_HYG4U
// Source: https://app.crackingthecryptic.com/sudoku/RJDghqH248

// Rules encoded here, in full:
//   Normal sudoku rules apply.
//   Each row, column and box contains exactly one "deflection" cell.
//   Each deflection cell contains a different digit.
//   Clues outside the grid give the sum of the digits on the indicated
//   diagonal. Digits may repeat along this sum.
//   When a diagonal hits a deflection cell, the diagonal gets deflected
//   clockwise by 90 degrees ("makes a right-turn").
//   If a diagonal passes the same cell multiple times, that cell's value is
//   counted multiple times towards the clue sum.
// Nothing is omitted.

// The value range is widened by one so the deflection overlay can use 0 as its
// "not a deflection cell" marker; the playable grid is restricted back to 1-9
// below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

// One overlay cell per grid cell. It holds 0 when its grid cell is not a
// deflection cell, and otherwise repeats that cell's own digit -- so the one
// overlay carries both which cells deflect and what digits they hold, and
// "each deflection cell contains a different digit" becomes a count over it.
const defl = graph.makeOverlay('VD');
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NOT_DEFLECTION = 0;

const gridDomain = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// VD is 0, or else equal to the digit of the cell it shadows.
const overlayDigit = Pair.fnToKey(
  (marker, digit) => marker === NOT_DEFLECTION || marker === digit, shape);
const overlayRules = graph.cells().map(
  cell => new Pair(overlayDigit, 'deflection digit', defl.at(cell), cell));

// Exactly one deflection cell per row, column and box: exactly eight of the
// nine overlay cells of each unit are the not-a-deflection marker.
const eightBlanks = Array(geometry.numRows - 1).fill(NOT_DEFLECTION).join('_');
const onePerUnit = graph.rowsColumnsBoxes().map(
  unit => new ContainExact(eightBlanks, ...defl.at(unit)));

// Each deflection cell contains a different digit: across the whole overlay
// each digit is carried exactly once.
const distinctDigits = new ContainExact(DIGITS.join('_'), ...defl.cells());

// The six outside clues. Each is a text total in the margin with a small arrow
// drawn at the corner of its margin cell, pointing diagonally into the grid;
// `start` is the first grid cell the arrow points at and `dir` its heading.
const CLUES = [
  { total: 10, start: 'R4C1', dir: [1, 1] },   // left of R3/R4, pointing down-right
  { total: 15, start: 'R1C5', dir: [1, -1] },  // above C5/C6, pointing down-left
  { total: 6, start: 'R1C6', dir: [1, -1] },   // above C6/C7, pointing down-left
  { total: 135, start: 'R9C4', dir: [-1, 1] }, // below C3/C4, pointing up-right
  { total: 18, start: 'R9C5', dir: [-1, 1] },  // below C4/C5, pointing up-right
  { total: 8, start: 'R9C6', dir: [-1, 1] },   // below C5/C6, pointing up-right
];

// Rows increase downwards, so a clockwise quarter turn of a heading (dR, dC) is
// (dC, -dR): down-right -> down-left -> up-left -> up-right -> down-right.
const turnClockwise = ([dRow, dCol]) => [dCol, -dRow];

const boxOfCell = new Map();
graph.boxes().forEach(
  (cells, index) => cells.forEach(cell => boxOfCell.set(cell, index)));

// Enumerate every route a ray can take, by branching at each cell it reaches on
// whether that cell deflects. A branch that would put two deflection cells in
// the same row, column or box is dropped -- those are exactly the placements
// `onePerUnit` forbids, so no route allowed by the constraints is lost.
//
// Each branch fixes the overlay on precisely the cells its route visits, and
// that assignment alone replays the route, so the routes are mutually exclusive
// and cover every placement: the disjunction below is the rule, not a sample of
// it. The rays cannot cycle -- the step map is invertible, so a repeated state
// would have no entry point -- and `stateLimit` is the number of (cell,
// heading) states, an upper bound on a route that repeats no state.
const enumerateRoutes = (startCell, startDir) => {
  const stateLimit = 4 * graph.cells().length;
  const routes = [];
  const marker = new Map();   // visited cell -> does it deflect?
  const usedRows = new Set(), usedCols = new Set(), usedBoxes = new Set();
  const route = [];

  const walk = (cell, dir) => {
    if (cell === null) {
      routes.push({ cells: [...route], marker: new Map(marker) });
      return;
    }
    if (route.length >= stateLimit) throw new Error('ray failed to leave the grid');
    route.push(cell);
    const { row, col } = parseCellId(cell);
    const box = boxOfCell.get(cell);
    const seen = marker.has(cell);
    for (const deflects of seen ? [marker.get(cell)] : [false, true]) {
      if (!seen) {
        if (deflects &&
          (usedRows.has(row) || usedCols.has(col) || usedBoxes.has(box))) continue;
        marker.set(cell, deflects);
        if (deflects) { usedRows.add(row); usedCols.add(col); usedBoxes.add(box); }
      }
      const nextDir = deflects ? turnClockwise(dir) : dir;
      walk(graph.step(cell, nextDir[0], nextDir[1]), nextDir);
      if (!seen) {
        marker.delete(cell);
        if (deflects) { usedRows.delete(row); usedCols.delete(col); usedBoxes.delete(box); }
      }
    }
    route.pop();
  };

  walk(startCell, startDir);
  return routes;
};

const clueRules = CLUES.map(({ total, start, dir }) => new Or(
  enumerateRoutes(start, dir).map(({ cells, marker }) => {
    // A cell crossed n times contributes n copies of its digit to the total.
    const visits = new Map();
    for (const cell of cells) visits.set(cell, (visits.get(cell) || 0) + 1);
    return new And([
      ...[...marker].map(([cell, deflects]) => new Given(
        defl.at(cell), ...(deflects ? DIGITS : [NOT_DEFLECTION]))),
      new Sum(total, ...[...visits].map(
        ([cell, count]) => count === 1 ? cell : [cell, count])),
    ]);
  })));

return [
  shape,
  defl.toVar('deflection'),
  gridDomain,
  ...overlayRules,
  ...onePerUnit,
  distinctDigits,
  ...clueRules,
];
