// Title: Foggy Banren
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=11ycmkh_xB8
// Source: https://sudokupad.app/2s9gi1de7p

// Rules encoded below:
//  - Place the digits 0 to 9 once into each row, column and 3x3 box. One cell
//    in each row, column and box is an S-cell containing two digits, so nine
//    cells carry ten digits.
//  - The value of an S-cell is the sum of its digits (any other cell's value is
//    its digit); no two S-cells contain the same pair of digits.
//  - A renban loop (thick coloured line) contains a set of consecutive values.
//  - The value in a circle equals the sum of the values along its arrow.
//  - The values in the cells surrounding an X sum to 10, around a V to 5.
//  - A cell with a grey square contains an even value.
// Display only, so not encoded: the fog and the six fog-light markers. The
// clauses "each loop is a different colour of thick line, and does not cross or
// intersect itself" and "each arrow is a different colour of thin line, and does
// not branch" describe the drawn art; they are what lets the four thick strokes
// be read as four separate loops and the four thin strokes as four unbranched
// arrows, and both readings are transcribed literally below.

// Model. Two digits never fit in one cell and a value runs to 8 + 9 = 17, past
// any ISS value range, so the value is carried by two cells: the main grid holds
// one digit per cell and the VE overlay holds an S-cell's second digit (0 at
// every non-S-cell), making a cell's value (grid digit + overlay digit)
// everywhere. Which digit of an S-cell pair goes in which layer is a choice this
// model introduces, not something the puzzle asks; it is pinned below so the two
// arrangements do not both count.
// The shape is widened to 16 values only so the renban base variables can reach
// 15; the grid and each overlay are restricted back to their real ranges.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const extra = graph.makeOverlay('VE');

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// An S-cell's second digit is the smaller of the pair, so at most 8.
const EXTRA_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// A cell's value is carried by two cells: the grid digit plus the overlay digit.
const valueCells = (cell) => [cell, extra.at(cell)];
// The same, as signed coefficient terms for a Sum.
const value = (cell, sign = 1) => [[cell, sign], [extra.at(cell), sign]];

// Per row: which column holds that row's S-cell, and the S-cell's two digits.
const sCol = new Var('P', 'S-cell column', 9);
const sHigh = new Var('G', 'S-cell grid digit', 9);
const sLow = new Var('S', 'S-cell smaller digit', 9);
const base = new Var('B', 'renban lowest value', 4);

// Exactly one digit pair per cell, canonically ordered: the overlay digit is 0
// (no second digit, or the pair {0, d}) or strictly smaller than the grid digit.
// Both halves of a pair are digits of the same unit, so they always differ.
const orderKey = Pair.fnToKey((ve, digit) => ve === 0 || ve < digit, shape);
const pairOrder = graph.cells().map(
  cell => new Pair(orderKey, 'S-cell digit order', extra.at(cell), cell));

// Only the S-cell of a row may carry a second digit. One key per column index.
const sCellOnlyKeys = COLUMNS.map(
  col => Pair.fnToKey((ve, column) => ve === 0 || column === col, shape));
const sCellOnly = graph.rows().flatMap((cells, r) => cells.map(
  (cell, c) => new Pair(
    sCellOnlyKeys[c], 'second digit only in the S-cell',
    extra.at(cell), sCol.cell(r + 1))));

// One S-cell per column: the nine per-row columns are all different.
// One S-cell per box: within a band of three rows they land in three different
// stacks of three columns.
const bandKey = Pair.fnToKey(
  (a, b) => Math.ceil(a / 3) !== Math.ceil(b / 3), shape);
const sCellBoxes = [0, 3, 6].flatMap(band => [[1, 2], [1, 3], [2, 3]].map(
  ([i, j]) => new Pair(
    bandKey, 'one S-cell per box',
    sCol.cell(band + i), sCol.cell(band + j))));

// Each row, column and box holds all ten digits across its nine cells. Counted
// over the unit's nine grid cells and their nine overlay cells that is each of
// 0-9 once, plus the eight overlay cells that are not the unit's S-cell and so
// hold 0: nine 0s and one each of 1-9.
const NON_S_DIGITS = DIGITS.length - 2;   // overlay cells that are not the S-cell
const UNIT_DIGITS = [
  ...Array(NON_S_DIGITS + 1).fill(0), ...DIGITS.slice(1)].join('_');
const unitDigits = graph.rowsColumnsBoxes().map(
  cells => new ContainExact(UNIT_DIGITS, ...cells, ...extra.at(cells)));

// Read each row's S-cell pair out into (sHigh, sLow) so the pairs can be
// compared: the S-cell sits in column sCol, and copies its two digits across.
const sCellPairs = graph.rows().map((cells, r) => new Or(
  cells.map((cell, c) => new And([
    new Given(sCol.cell(r + 1), c + 1),
    new SameValues(2, sHigh.cell(r + 1), cell),
    new SameValues(2, sLow.cell(r + 1), extra.at(cell))]))));

// No two S-cells contain the same pair of digits: the nine (high, low) pairs
// differ in at least one component.
const distinctPairs = COLUMNS.flatMap((i) => COLUMNS.slice(i).map(
  (j) => new Or([
    new AllDifferent(sHigh.cell(i), sHigh.cell(j)),
    new AllDifferent(sLow.cell(i), sLow.cell(j))])));

// Renban loops, from the four thick strokes (orchid, limegreen, orange,
// darkturquoise); each closed stroke is listed once round, without repeating its
// first cell.
const LOOPS = [
  ['R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C5', 'R7C4', 'R6C4', 'R6C3',
    'R5C2', 'R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C5', 'R2C6', 'R3C7', 'R4C8'],
  ['R8C8', 'R9C8', 'R8C9'],
  ['R3C5', 'R4C5', 'R5C6', 'R4C6'],
  ['R6C2', 'R7C2', 'R6C1'],
];

// A loop of n cells holding a set of consecutive values means each of
// base, base+1, ..., base+n-1 appears on it; with only n cells to hold them that
// forces one of each, which is the set. base is a variable per loop because the
// rules fix no starting value.
const renban = LOOPS.flatMap((cells, i) => cells.map(
  (_, k) => new Or(cells.map(
    cell => new Sum(k, ...value(cell), [base.cell(i + 1), -1])))));
// A value is at most 17, so a loop of n cells starts no higher than 18-n. The
// 18-cell loop therefore holds every value from 0 to 17.
const renbanBases = LOOPS.map((cells, i) => new Given(
  base.cell(i + 1),
  ...Array.from({ length: 19 - cells.length }, (_, v) => v)));

// Arrows, from the four thin strokes: bulb (the circle) then the arm cells in
// drawn order, ending at the cell holding the arrowhead.
const ARROWS = [
  ['R8C2', 'R7C3', 'R6C4', 'R7C5', 'R8C4', 'R9C3'],   // tomato
  ['R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4'],   // blue
  ['R5C3', 'R4C3', 'R4C4', 'R4C5', 'R5C4'],           // grey
  ['R3C7', 'R3C6', 'R2C7', 'R1C6', 'R1C5'],           // darkkhaki
];
const arrows = ARROWS.map(([bulb, ...arm]) => new EqualSum(
  valueCells(bulb), arm.flatMap(valueCells)));

// The X on the R9C5/R9C6 border and the V on the R3C8/R3C9 border. Both are sums
// of values, not of digits, so neither is the built-in X/V class.
const xvMarks = [
  new Sum(10, ...valueCells('R9C5'), ...valueCells('R9C6')),
  new Sum(5, ...valueCells('R3C8'), ...valueCells('R3C9')),
];

// The grey square under R6C3.
const evenKey = Pair.fnToKey((digit, ve) => (digit + ve) % 2 === 0, shape);
const greySquare = new Pair(evenKey, 'even value', 'R6C3', extra.at('R6C3'));

return [
  shape,
  extra.toVar('second digit'),
  sCol, sHigh, sLow, base,
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  extra.makeReplicate(new Given(extra.cells()[0], ...EXTRA_DIGITS)),
  ...COLUMNS.map(r => new Given(sCol.cell(r), ...COLUMNS)),
  ...COLUMNS.map(r => new Given(sHigh.cell(r), ...DIGITS)),
  ...COLUMNS.map(r => new Given(sLow.cell(r), ...EXTRA_DIGITS)),
  ...renbanBases,
  ...pairOrder,
  ...sCellOnly,
  new AllDifferent(...sCol.cells()),
  ...sCellBoxes,
  ...unitDigits,
  ...sCellPairs,
  ...distinctPairs,
  ...renban,
  ...arrows,
  ...xvMarks,
  greySquare,
];
