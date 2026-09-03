// Title: Smallhat
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=p-pIPG7WnVs
// Source: https://tinyurl.com/ysuszmhy

// Rules encoded here, over an 11x11 board:
//  - Nine non-overlapping 3x3 square regions sit somewhere in the grid. Each
//    holds 1-9 once each. No digit repeats in a row or a column. Cells outside
//    every region hold no digit.
//  - Each pink line holds a set of consecutive digits in any order with no
//    repeats. Line cells outside every region hold no digit and do not count
//    towards the line's set, and a line may hold no digits at all.
//  - A circled cell's digit is the number of cells of that cell's own region
//    that its pink line passes through. Every circle holds a digit.
// Nothing is omitted.
//
// Model: BLANK marks a cell in no region. Because the same rows and columns
// carry both digits and blanks, the board is a Raw grid and the row/column
// rules are stated explicitly.
const BLANK = 10;
const NUM_REGIONS = 9;
const shape = new Shape('11x11', BLANK, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Drawn geometry, as [row, col]. The art draws twelve pink figures; each is one
// pink line, listed as the cells it passes through. A closed figure is drawn as
// two or three overlapping strokes, so the strokes are joined back into the one
// figure they draw: the rules' worked example -- a 6 in R3C3 meaning its region
// covers that whole line -- only reaches 6 over the joined figure through R3C3,
// which the strokes draw as a closed hexagon of six cells.
const LINES = [
  [[6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 10], [11, 9], [11, 8], [11, 7], [11, 6]],
  [[9, 10], [10, 10], [10, 9]],
  [[6, 10], [6, 9], [6, 8], [7, 9]],
  [[10, 2], [10, 3], [9, 3], [8, 3], [8, 4], [8, 5], [7, 5], [6, 5], [5, 5], [5, 6],
  [6, 6], [7, 6], [7, 7], [6, 7], [5, 7], [4, 7], [4, 8], [4, 9], [3, 9], [2, 9], [2, 10]],
  [[2, 7], [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [5, 4], [6, 4], [6, 3], [6, 2], [7, 2]],
  [[3, 2], [4, 3], [3, 3], [3, 4], [2, 3], [2, 2]],
  [[8, 6], [9, 6], [10, 6], [9, 7]],
  [[8, 9], [8, 8], [9, 8], [9, 9]],
  [[1, 8], [2, 8]],
  [[8, 1], [8, 2]],
  [[11, 3], [10, 4], [11, 5]],
  [[3, 11], [4, 10], [5, 11]],
];
const CIRCLES = [[3, 3], [3, 6], [3, 9], [6, 3], [6, 6], [6, 9], [9, 3], [9, 6], [9, 9]];

const cellOf = ([row, col]) => makeCellId(row, col);
const lineCells = LINES.map(line => line.map(cellOf));

// --- Region layout overlay. Each cell holds its position inside its own 3x3
// region, numbered 1-9 in reading order (so code p means row offset ROW(p) and
// column offset COL(p) from the region's top-left cell), or BLANK for a cell in
// no region. A cell's region is therefore its own code read as an offset, which
// is what lets the layout be constrained one adjacent pair at a time.
const pos = graph.makeOverlay('VP');
const ROW = p => ((p - 1) / 3) | 0;
const COL = p => (p - 1) % 3;
const CODES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// A region must lie inside the grid, so a cell near an edge cannot hold a code
// that would put its region's top-left corner off the board.
const codeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const fits = p =>
    row - ROW(p) >= 1 && row - ROW(p) + 2 <= geometry.numRows &&
    col - COL(p) >= 1 && col - COL(p) + 2 <= geometry.numCols;
  return CODES.every(fits) ? null : new Given(pos.at(cell), ...CODES.filter(fits), BLANK);
}).filter(g => g !== null);

// Codes of horizontally adjacent cells. Inside a region the column offset steps
// up by one; at a region's right-hand column the next cell starts a new region
// or is blank, and the same holds after a blank cell. Together with the vertical
// rule this makes every maximal run of coded cells an exact 3x3 block.
const acrossKey = Pair.fnToKey((a, b) => {
  if (a !== BLANK && COL(a) < 2) return b === a + 1;
  return b === BLANK || COL(b) === 0;
}, shape);
const downKey = Pair.fnToKey((a, b) => {
  if (a !== BLANK && ROW(a) < 2) return b === a + 3;
  return b === BLANK || ROW(b) === 0;
}, shape);
const layoutChains = [
  ...graph.rows().map(row => new Pair(acrossKey, 'code-across', ...pos.at(row))),
  ...graph.columns().map(col => new Pair(downKey, 'code-down', ...pos.at(col))),
];

// Exactly nine regions: nine cells are the top-left cell of a region (code 1).
const regionCount = new ContainExact(
  new Array(NUM_REGIONS).fill(1).join('_'), ...pos.at(gridCells));

// A cell holds a digit exactly when it is in a region.
const blankKey = Pair.fnToKey((a, b) => (a === BLANK) === (b === BLANK), shape);
const blankAgreement = gridCells.map(
  cell => new Pair(blankKey, 'digit-iff-region', cell, pos.at(cell)));

// No digit repeats in a row or a column; blanks are not digits and may repeat.
const distinctKey = PairX.fnToKey(
  (a, b) => a === BLANK || b === BLANK || a !== b, shape);
const rowsAndColumns = [...graph.rows(), ...graph.columns()].map(
  line => new PairX(distinctKey, 'no-repeat', ...line));

// Each region holds 1-9 once each: wherever a cell is a region's top-left cell,
// the 3x3 block starting there is all-different.
const NOT_TOP_LEFT = [...CODES.slice(1), BLANK];
const regionDigits = gridCells
  .map(cell => ({ cell, block: graph.block(cell, 3, 3) }))
  .filter(({ block }) => block !== null)
  .map(({ cell, block }) => new Or([
    new Given(pos.at(cell), ...NOT_TOP_LEFT),
    new AllDifferent(...block),
  ]));

// Renban over a line whose membership is unknown: skip blanks, and require the
// digits actually placed to be distinct and to fill a contiguous range. The
// state is the set of digits seen so far, as a bitmask.
const isContiguous = seen => ((seen + (seen & -seen)) & seen) === 0;
const renbanSpec = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (value === BLANK) return { seen };
    const bit = 1 << (value - 1);
    if (seen & bit) return undefined;
    return { seen: seen | bit };
  },
  accept: ({ seen }) => isContiguous(seen),
}, shape);
const renbans = lineCells.map(cells => new NFA(renbanSpec, 'renban', ...cells));

// A circle's digit counts the cells of its own region that its line passes
// through. Its code fixes where its region sits, and the line is a known cell
// list, so each code makes the count a constant; codes sharing a count share a
// branch. A code whose count would be zero has no branch: no digit could match.
const circleClues = CIRCLES.map(([row, col]) => {
  const cell = makeCellId(row, col);
  const line = lineCells.find(cells => cells.includes(cell));
  const byCount = new Map();
  for (const p of CODES) {
    const block = graph.block(makeCellId(row - ROW(p), col - COL(p)), 3, 3);
    if (block === null) continue;
    const count = block.filter(b => line.includes(b)).length;
    if (count === 0) continue;
    if (!byCount.has(count)) byCount.set(count, []);
    byCount.get(count).push(p);
  }
  return new Or([...byCount].map(([count, codes]) => new And([
    new Given(pos.at(cell), ...codes),
    new Given(cell, count),
  ])));
});

return [
  shape,
  pos.toVar('region position'),
  new Given('R2C4', 9),
  new Given('R4C2', 8),
  ...codeDomains,
  ...layoutChains,
  regionCount,
  ...blankAgreement,
  ...rowsAndColumns,
  ...regionDigits,
  ...renbans,
  ...circleClues,
];
