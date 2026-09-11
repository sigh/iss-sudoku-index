// Title: Sharing Is Caring
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=8jEYvkM1ak0
// Source: https://sudokupad.app/qxrgza5nro

// Rules encoded, in full:
//   Place the digits 0-9 once each into every row, column and 2x2 box. Cells
//   may contain up to four digits simultaneously, and cells in the same
//   row/column/box may not contain the same number of digits. A cell's value is
//   the sum of the digits it contains. Values separated by a white dot are
//   consecutive. Values separated by a black dot are in a 1:2 ratio. Values
//   separated by an X sum to 10.
//
// Model. The board is 4x4 but a cell holds a set of digits, so each puzzle cell
// is spread over the 2x2 block of sub-cells of an 8x8 grid: a sub-cell holds one
// of the cell's digits (0-9) or the marker 10 (printed 'a') for "no digit here".
// A puzzle row is then two grid rows, a puzzle column two grid columns, and a
// puzzle 2x2 box a 4x4 quadrant -- 16 sub-cells apiece, holding the ten digits
// plus six markers. The grid is Raw so that only the rules below apply to it.
const shape = new Shape('8x8', '0-10', 'Raw');
const graph = cellGraph(shape);
const NO_DIGIT = 10;
const SIZES = [1, 2, 3, 4];

// Puzzle coordinates (the 4x4 board the rules and the dots are drawn on) are
// used throughout; cellBlock maps one to its four sub-cells in reading order.
const cellBlock = (row, col) =>
  graph.block(makeCellId(2 * row - 1, 2 * col - 1), 2, 2);
const puzzleCells = SIZES.flatMap(row => SIZES.map(col => [row, col]));
const houses = [
  ...SIZES.map(row => SIZES.map(col => [row, col])),
  ...SIZES.map(col => SIZES.map(row => [row, col])),
  ...[[1, 1], [1, 3], [3, 1], [3, 3]].map(([r, c]) =>
    [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]),
];

// VN<n> is the number of digits in a puzzle cell, laid out as the 4x4 board.
const counts = new Var('N', 'digits in cell', '4x4');
const countAt = ([row, col]) => counts.cell(row, col);

// Ten digits and six markers per house.
const houseContents =
  [...Array(10).keys(), ...Array(6).fill(NO_DIGIT)].join('_');
const houseDigits = houses.map(cells => new ContainExact(
  houseContents, ...cells.flatMap(cell => cellBlock(...cell))));

// A cell's digits are unordered, so the sub-cells within a block are written in
// ascending reading order with the markers last. That is a naming convention for
// this encoding rather than a rule: it gives each set of digits exactly one
// spelling, and it is what makes the count below readable off the block.
const ascending = Pair.fnToKey((a, b) => a <= b, shape);
const blockSpelling = puzzleCells.map(cell =>
  new Pair(ascending, 'ascending', ...cellBlock(...cell)));

// With markers sorting last, the block's j-th sub-cell holds a digit exactly
// when the cell has at least j of them, which pins VN to the digit count.
const countReadsBlock = SIZES.map(
  j => Pair.fnToKey((n, v) => (n >= j) === (v < NO_DIGIT), shape));
const countLinks = puzzleCells.flatMap(cell =>
  cellBlock(...cell).map((sub, j) => new Pair(
    countReadsBlock[j], `holds ${j + 1} or more`, countAt(cell), sub)));
const countRange = puzzleCells.map(
  cell => new Given(countAt(cell), 0, 1, 2, 3, 4));
const countsDiffer = houses.map(
  cells => new AllDifferent(...cells.map(countAt)));

// A cell's value is the sum of its digits. Every marker sub-cell reads 10, so a
// block's four sub-cells overshoot the value by 10 for each of its 4 - VN
// markers: value = sum(block) + 10*VN - 40. valueTerms(cell, k) is k times that
// sum, without the -40k, which the clue totals below absorb.
const valueTerms = (id, k) => {
  const cell = [parseCellId(id).row, parseCellId(id).col];
  return [
    ...cellBlock(...cell).map(sub => [sub, k]),
    [countAt(cell), 10 * k],
  ];
};

// The drawn edge clues, transcribed from the puzzle's dots and X markers.
const WHITE_DOTS = [['R2C1', 'R2C2'], ['R3C2', 'R4C2']];
const BLACK_DOTS = [
  ['R2C1', 'R1C1'], ['R2C1', 'R3C1'], ['R3C1', 'R4C1'], ['R3C2', 'R2C2']];
const X_MARKS = [['R2C2', 'R2C3'], ['R3C4', 'R4C4']];

// a + b = 10, so terms(a) + terms(b) = 10 + 40 + 40.
const xMarks = X_MARKS.map(([a, b]) => new Sum(
  90, ...valueTerms(a, 1), ...valueTerms(b, 1)));
// |a - b| = 1; the two -40s cancel in the difference.
const whiteDots = WHITE_DOTS.map(([a, b]) => new Or([
  new Sum(1, ...valueTerms(a, 1), ...valueTerms(b, -1)),
  new Sum(1, ...valueTerms(b, 1), ...valueTerms(a, -1))]));
// One value is twice the other: 2b - a = 0 leaves 2*40 - 40 on the total.
const blackDots = BLACK_DOTS.map(([a, b]) => new Or([
  new Sum(40, ...valueTerms(b, 2), ...valueTerms(a, -1)),
  new Sum(40, ...valueTerms(a, 2), ...valueTerms(b, -1))]));

return [
  shape,
  counts,
  ...countRange,
  ...houseDigits,
  ...blockSpelling,
  ...countLinks,
  ...countsDiffer,
  ...xMarks,
  ...whiteDots,
  ...blackDots,
];
