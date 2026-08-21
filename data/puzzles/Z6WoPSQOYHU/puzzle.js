// Title: Bookends
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=Z6WoPSQOYHU
// Source: https://sudokupad.app/e0yukfm7p9

// Rules encoded, in full:
//  - Normal 6x6 sudoku: 1-6 once each per row, column and 2x3 box.
//  - One cell in each row, column and box is a doubler, and each digit is
//    doubled once.
//  - Digits do not repeat in a cage.
//  - Each cage sums to a different total, a doubled digit counting twice.
//  - The totals are ranked 1 (lowest) to 6 (highest), and a number in a cage's
//    top left gives that cage's rank. Ranks 6 and 1 are printed; the other four
//    cages carry no label, so only "strictly between" is known about them.
// Nothing is omitted.

// The value range is widened to 0-12 to carry two kinds of auxiliary value.
// A cage total needs up to 12: the rank-6 cage is the single cell R1C1, so the
// highest total on the board is at most 2*6 = 12 and every other total is
// strictly smaller. 0 is the "not a doubler" sentinel on the overlay below.
const shape = new Shape('6x6', '0-12');
const graph = cellGraph(shape);

// VB holds the extra value a doubler contributes: 0 on an ordinary cell, and a
// copy of the cell's own digit on a doubler. So effective value = digit + VB,
// which keeps the cage totals linear.
const doubled = graph.makeOverlay('VB');
const totals = new Var('T', 'cage totals', 6);

// Cage cells and the printed rank labels, transcribed from the drawn cages.
const cages = [
  { cells: ['R2C2', 'R3C1', 'R3C2', 'R4C2'], rank: null },
  { cells: ['R2C4', 'R2C5'], rank: null },
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R5C5'], rank: null },
  { cells: ['R5C2', 'R6C2'], rank: null },
  { cells: ['R1C1'], rank: 6 },
  { cells: ['R6C5'], rank: 1 },
];
const totalOf = index => totals.cell(index + 1);
const rankIndex = rank => cages.findIndex(cage => cage.rank === rank);

// A cell's overlay value is 0, or the digit itself when that cell is a doubler.
const isDoublerValue = Pair.fnToKey(
  (digit, extra) => extra === 0 || extra === digit, shape);
const isLess = Pair.fnToKey((a, b) => a < b, shape);

const lowest = rankIndex(1);
const highest = rankIndex(6);
const otherCages = skip => cages.map((cage, index) => index).filter(i => i !== skip);

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6)),
  doubled.toVar('doubler extra value'),
  doubled.makeReplicate(new Given(doubled.at('R1C1'), 0, 1, 2, 3, 4, 5, 6)),
  totals,
  // A total is at least 1 (cage F is a single cell) and at most 12, as above.
  ...totals.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)),
  ...graph.cells().map(
    cell => new Pair(isDoublerValue, 'doubler extra value', cell, doubled.at(cell))),
  // One doubler per row, column and box: five of the six overlay cells are 0.
  ...graph.rowsColumnsBoxes().map(
    cells => new ContainExact('0_0_0_0_0', ...doubled.at(cells))),
  // Each digit doubled once: each of 1-6 appears exactly once across the
  // overlay, which also fixes the number of doublers at six.
  new ContainExact('1_2_3_4_5_6', ...doubled.cells()),
  ...cages.filter(cage => cage.cells.length > 1).map(
    cage => new AllDifferent(...cage.cells)),
  ...cages.map((cage, index) => new EqualSum(
    [...cage.cells, ...doubled.at(cage.cells)], [totalOf(index)])),
  new AllDifferent(...totals.cells()),
  ...otherCages(lowest).map(
    index => new Pair(isLess, 'rank-1-total-is-lowest', totalOf(lowest), totalOf(index))),
  ...otherCages(highest).map(
    index => new Pair(isLess, 'rank-6-total-is-highest', totalOf(index), totalOf(highest))),
];
