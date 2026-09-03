// Title: Balance
// Author: Scojo
// Video: https://www.youtube.com/watch?v=Bl8vZpsyucg
// Source: https://sudokupad.app/3ma2z9n9lr

// Rules encoded here, in full:
//  - Normal sudoku: 1-9 once each in every row, column and 3x3 box.
//  - Balance Cells: nine cells, one in every row, column and box, each holding
//    a different digit. The VALUE of a Balance Cell is the arithmetic mean of
//    the up to 4 digits orthogonally adjacent to it, regardless of its own
//    digit. Every other cell's value is its own digit.
//  - Global Balance: the values of all 81 cells sum to 405.
//  - Killer: the values in a cage sum to the total in its top-left corner;
//    digits may not repeat within a cage, though values may.
// Nothing is omitted.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ROWS = DIGITS;
// A mean over 2, 3 or 4 neighbours is a fraction; 12 = lcm(2, 3, 4) clears every
// denominator, so all the sums below are over 12 * value.
const SCALE = 12;
// A scaled mean reaches 12 * 9 = 108, past any ISS value range, so it is carried
// as two base-11 var digits: hi * 11 + lo, with lo <= 10 making the split unique.
const BASE = 11;

// 0 is needed as the "not a Balance Cell" marker and 10 as a base-11 digit;
// the grid's own cells are restricted back to 1-9 below.
const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const allCells = graph.cells();

// The Balance Cell marker: 0 on an ordinary cell, the cell's own digit on a
// Balance Cell. Holding the digit (rather than a plain flag) lets one
// ContainExact state "the nine Balance Cells hold nine different digits".
const mark = graph.makeOverlay('VM');
// One pair of var cells per row, holding 12 * (value of that row's Balance Cell).
const meanHi = new Var('H', 'scaled balance mean, base-11 high digit', 9);
const meanLo = new Var('L', 'scaled balance mean, base-11 low digit', 9);

// Cages as drawn: the cells outlined, and the total printed in the top-left
// corner of each outline.
const cages = [
  { total: 5, cells: ['R2C3', 'R3C2', 'R3C3'] },
  { total: 4, cells: ['R6C6', 'R7C6', 'R7C7'] },
  { total: 18, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'] },
  { total: 9, cells: ['R5C4', 'R6C4'] },
  { total: 9, cells: ['R4C5', 'R4C6'] },
  { total: 18, cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'] },
  {
    total: 54,
    cells: ['R4C1', 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R7C2', 'R8C2',
      'R9C2'],
  },
  { total: 8, cells: ['R3C4', 'R3C5', 'R3C6'] },
  { total: 16, cells: ['R5C9', 'R6C9'] },
  { total: 15, cells: ['R5C8', 'R6C8'] },
  { total: 10, cells: ['R1C7', 'R1C8'] },
  { total: 14, cells: ['R1C6', 'R2C6'] },
  { total: 23, cells: ['R1C4', 'R1C5', 'R2C4', 'R2C5'] },
];

// The scaled value of a Balance Cell, as Sum terms: (12 / neighbour count)
// times each orthogonal neighbour's digit.
function meanTerms(cell, sign = 1) {
  const neighbours = graph.neighbours(cell);
  return neighbours.map(n => [n, sign * SCALE / neighbours.length]);
}

const houses = graph.rowsColumnsBoxes();
const housesOf = new Map(allCells.map(cell => [cell, new Set()]));
houses.forEach((house, i) => house.forEach(cell => housesOf.get(cell).add(i)));
const shareHouse = (a, b) =>
  [...housesOf.get(a)].some(house => housesOf.get(b).has(house));

// Every set of cage cells that could be its Balance Cells: any set with no two
// in a common row, column or box. The placement constraints below rule out the
// rest, so this disjunction is complete, and each branch pins the marker of
// every cage cell so the branch taken is the grid's actual arrangement.
function balanceSubsets(cells) {
  let subsets = [[]];
  for (const cell of cells) {
    subsets = subsets.concat(
      subsets
        .filter(subset => subset.every(other => !shareHouse(cell, other)))
        .map(subset => [...subset, cell]));
  }
  return subsets;
}

const markedAs = (cell, isBalance) =>
  new Given(mark.at(cell), ...(isBalance ? DIGITS : [0]));

function cageValueTotal(cage) {
  return new Or(balanceSubsets(cage.cells).map(balance => new And([
    ...cage.cells.map(cell => markedAs(cell, balance.includes(cell))),
    new Sum(
      SCALE * cage.total,
      ...cage.cells.filter(cell => !balance.includes(cell))
        .map(cell => [cell, SCALE]),
      ...balance.flatMap(cell => meanTerms(cell))),
  ])));
}

return [
  shape,
  mark.toVar('balance cell markers'),
  meanHi,
  meanLo,

  // Playable digits are 1-9; the widened range exists only for the vars.
  graph.makeReplicate(new Given(allCells[0], ...DIGITS)),
  // A marker is 0 or its own cell's digit, so 10 never reaches the marker layer.
  // One Pair per cell: Replicate cannot span the grid and the marker group.
  ...allCells.map(cell => new Pair(
    Pair.fnToKey((marker, digit) => marker === 0 || marker === digit, shape),
    'balance marker', mark.at(cell), cell)),

  // One Balance Cell per house: eight of the nine markers are 0.
  ...houses.map(house => new ContainExact(
    new Array(8).fill(0).join('_'), ...mark.at(house))),
  // Nine Balance Cells holding nine different digits: each digit marked once.
  new ContainExact(DIGITS.join('_'), ...mark.cells()),

  // Global Balance. Every cell's value is its digit except the nine Balance
  // Cells, so sum(values) = 405 - sum(balance digits) + sum(balance means).
  // Sudoku fixes sum(digits) = 405 and the marks fix sum(balance digits) = 45,
  // so "sum(values) = 405" is exactly "the nine balance means sum to 45".
  new Sum(
    SCALE * 45,
    ...ROWS.map(r => [meanHi.cell(r), BASE]),
    ...ROWS.map(r => [meanLo.cell(r), 1])),
  // ... where row r's pair of vars holds 12 * the mean at that row's Balance
  // Cell. Exactly one marker per row is non-zero, so only the true branch's
  // guard can hold.
  ...ROWS.map(r => new Or(graph.row(r).map(cell => new And([
    new Given(mark.at(cell), ...DIGITS),
    new Sum(0, [meanHi.cell(r), BASE], [meanLo.cell(r), 1],
      ...meanTerms(cell, -1)),
  ])))),

  // Killer cages: digits distinct, values summing to the printed total.
  ...cages.map(cage => new AllDifferent(...cage.cells)),
  ...cages.map(cageValueTotal),
];
