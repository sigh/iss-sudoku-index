// Title: Smorg
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=WDWRT9W1cXc
// Source: https://app.crackingthecryptic.com/sudoku/LjtD6LjLRF

// Rules, on a 10x10 board whose cells each hold a digit 1-9 or are left empty:
//  - no digit repeats in a row or column;
//  - all empty cells are orthogonally connected;
//  - every digit belongs to a region of nine orthogonally connected cells,
//    digits do not repeat in a region, and regions do not touch each other
//    orthogonally;
//  - a clue outside the grid is the sum of the digits before the first empty
//    cell seen from that direction;
//  - a digit in a circle is how many of the cells surrounding it are empty, and
//    a circled cell holds a digit. Circles are not exhaustive, so an uncircled
//    cell carries no counting rule.
//
// The board is a Raw grid over 0-9 with 0 meaning "empty": rows and columns
// repeat 0 freely, so every rule below - rows and columns included - is stated
// explicitly.
//
// Regions may not touch, so two orthogonally adjacent filled cells are always
// in the same region and the regions are exactly the orthogonally connected
// groups of filled cells. The three region clauses are therefore encoded as:
// every filled cell carries a region label, adjacent filled cells carry the
// same label, each label occupies exactly nine connected cells, and no label
// holds any digit twice.

const EMPTY = 0;
const REGION_SIZE = 9;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// At most nine regions, so nine labels suffice. Each of the ten rows holds at
// most nine digits, so every row and every column contains an empty cell. With
// e empty cells and at least one in each of the ten rows, at most e - 10 pairs
// of empty cells are side by side in a row, and likewise at most e - 10 in a
// column; connecting e cells needs e - 1 such pairs, so e >= 19 and at most 81
// cells are filled.
const LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The label layer. Rows 1-10 shadow the board. Row 11 is a permanent gap, and
// rows 12-20 give each label nine parking cells of its own: ConnectedValues
// asserts a non-empty region for every value it is given, while the rules leave
// the number of regions open, so a label with no region on the board takes its
// parking row instead. The gap row keeps a label from spanning board and
// parking, so each label is either nine board cells or nine parking cells.
const labels = new Var('L', 'Region labels', '20x10');
const GAP_ROW = 11;
const parkingRow = (label) => GAP_ROW + label;
// The first 100 cells of the layer are its board shadow, so a grid-shaped
// overlay addresses them and supplies the locator the shifted copies below use.
const labelOverlay = graph.makeOverlay('VL');
const boardLabels = labelOverlay.cells();

// A digit may appear once per line; EMPTY is not a digit and may repeat.
const distinctDigits = PairX.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || a !== b, shape);
// A board cell is empty exactly when its label cell carries no label.
const labelledIffFilled = Pair.fnToKey(
  (digit, label) => (digit === EMPTY) === (label === EMPTY), shape);
// Adjacent filled cells share a region; either being empty says nothing.
const sameRegion = Pair.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || a === b, shape);

const outsideClue = (total, cells, name) => new NFA(NFA.encodeSpec({
  // Count the clue down over the leading run of digits; `done` is the sink
  // entered at the first empty cell, after which the line is unconstrained.
  startState: { left: total, done: false },
  transition: ({ left, done }, value) => {
    if (done) return { left: 0, done: true };
    if (value === EMPTY) return left === 0 ? { left: 0, done: true } : undefined;
    return value > left ? undefined : { left: left - value, done: false };
  },
  accept: ({ left }) => left === 0,
}, shape), name, cells);

const circleClue = (cell) => new NFA(NFA.encodeSpec({
  // The first cell is the circle: its digit sets the number of empty cells to
  // be found among the surrounding cells that follow, counted down to zero.
  startState: { left: null },
  transition: ({ left }, value) => {
    if (left === null) return value === EMPTY ? undefined : { left: value };
    if (value !== EMPTY) return { left };
    return left === 0 ? undefined : { left: left - 1 };
  },
  accept: ({ left }) => left === 0,
}, shape), `circle ${cell}`, [cell, ...graph.kingNeighbours(cell)]);

// The board read as (label, digit) pairs. `phase` says whether the next cell is
// a label or a digit, and for a digit whether its label was the one counted.
const labelDigitScan = gridCells.flatMap(cell => [labelOverlay.at(cell), cell]);
const regionDigitOnce = (label, digit) => new NFA(NFA.encodeSpec({
  startState: { phase: 'label', seen: 0 },
  transition: ({ phase, seen }, value) => {
    if (phase === 'label') {
      return { phase: value === label ? 'countThis' : 'skipThis', seen };
    }
    if (phase === 'skipThis' || value !== digit) return { phase: 'label', seen };
    return seen ? undefined : { phase: 'label', seen: 1 };
  },
  accept: ({ phase }) => phase === 'label',
}, shape), `region ${label} digit ${digit}`, labelDigitScan);

// Clue tables transcribed from the drawn grid: the two filled cells, the ten
// black-bordered circles, and the thirteen numbers printed outside the frame.
const GIVENS = [[1, 7, 6], [6, 6, 2]];
const CIRCLES = [
  [2, 1], [2, 2], [2, 6], [2, 9], [3, 9],
  [5, 8], [6, 2], [8, 4], [9, 7], [9, 10],
];
const OUTSIDE_CLUES = [
  [18, graph.row(1), 'left R1'],
  [15, graph.row(4), 'left R4'],
  [8, graph.row(8), 'left R8'],
  [13, graph.row(10), 'left R10'],
  [8, [...graph.row(1)].reverse(), 'right R1'],
  [10, graph.column(3), 'top C3'],
  [8, graph.column(5), 'top C5'],
  [17, graph.column(6), 'top C6'],
  [8, graph.column(10), 'top C10'],
  [5, [...graph.column(5)].reverse(), 'bottom C5'],
  [8, [...graph.column(6)].reverse(), 'bottom C6'],
  [14, [...graph.column(8)].reverse(), 'bottom C8'],
  [20, [...graph.column(10)].reverse(), 'bottom C10'],
];

return [
  shape,
  labels,
  ...GIVENS.map(([row, col, digit]) => new Given(makeCellId(row, col), digit)),

  // Rows and columns.
  ...graph.rows().map(
    (cells, i) => new PairX(distinctDigits, `row ${i + 1}`, ...cells)),
  ...graph.columns().map(
    (cells, i) => new PairX(distinctDigits, `column ${i + 1}`, ...cells)),

  // The empty cells are one orthogonally connected group.
  new ConnectedValues('', EMPTY),

  // Label layer geometry: the gap row, and each label's parking row, whose
  // cells may hold only that label.
  ...Array.from({ length: 10 },
    (_, i) => new Given(labels.cell(GAP_ROW, i + 1), EMPTY)),
  ...LABELS.flatMap(label => [
    ...Array.from({ length: REGION_SIZE },
      (_, i) => new Given(labels.cell(parkingRow(label), i + 1), EMPTY, label)),
    new Given(labels.cell(parkingRow(label), 10), EMPTY),
  ]),

  // Every digit belongs to a region and no empty cell does.
  ...gridCells.map(
    cell => new Pair(labelledIffFilled, 'labelled', cell, labelOverlay.at(cell))),

  // Regions do not touch: orthogonally adjacent digits share a region. One
  // shifted copy per board cell that has a right (resp. lower) neighbour.
  ...[[0, 1], [1, 0]].map(([dRow, dCol]) => labelOverlay.makeReplicate(
    new Pair(sameRegion, 'no touching regions',
      labelOverlay.at(gridCells[0]),
      labelOverlay.at(graph.step(gridCells[0], dRow, dCol))),
    labelOverlay.at(
      gridCells.filter(cell => graph.step(cell, dRow, dCol) !== null)))),

  // A region is nine orthogonally connected cells.
  ...LABELS.map(label => new ConnectedValues('VL', label, REGION_SIZE)),

  // Digits do not repeat in a region.
  ...LABELS.flatMap(label => DIGITS.map(digit => regionDigitOnce(label, digit))),

  // Labels are interchangeable, so pin one representative: reading the board in
  // row-major order, a label may first appear only after every smaller one has.
  new NFA(NFA.encodeSpec({
    startState: 0,
    transition: (maxSeen, label) => label === EMPTY ? maxSeen
      : label > maxSeen + 1 ? undefined : Math.max(maxSeen, label),
    accept: () => true,
  }, shape), 'canonical labels', boardLabels),

  ...OUTSIDE_CLUES.map(([total, cells, name]) => outsideClue(total, cells, name)),
  ...CIRCLES.map(([row, col]) => circleClue(makeCellId(row, col))),
];
