// Title: Duplicates
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=d1RdXuL-EX8
// Source: https://sudokupad.app/jdcz0c4rtb

// Digits 1-9 fill every cell. Row n and column n contain exactly n distinct
// digits. Cage digits are distinct and total their displayed number when one
// is given. White dots join consecutive digits; blue diamonds join equal
// digits. Unmarked adjacencies carry no negative-dot rule.
//
// The row/column rule permits duplicates, unlike ISS's automatic main-grid
// all-different groups. The 9x9 answer is therefore a Var grid; the pinned
// 1x1 main grid is only a placeholder.

const SIZE = 9;
const GRID = new Var('G', 'Duplicates grid', '9x9');
const cell = (r, c) => GRID.cell(r, c); // 1-indexed row and column
const row = (r) => Array.from({ length: SIZE }, (_, c) => cell(r, c + 1));
const column = (c) => Array.from({ length: SIZE }, (_, r) => cell(r + 1, c));

// This NFA stores the set of digit values seen in a nine-cell row or column.
// The accepting state has the required number of set bits.
const distinctCountNFA = (required) => NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => seen | (1 << (value - 1)),
  accept: (seen) => seen.toString(2).split('1').length - 1 === required,
  maxDepth: SIZE,
}, SIZE);
const rowAndColumnCounts = Array.from({ length: SIZE }, (_, i) => {
  const required = i + 1;
  const encoded = distinctCountNFA(required);
  return [
    new NFA(encoded, `row ${required} distinct digits`, row(required)),
    new NFA(encoded, `column ${required} distinct digits`, column(required)),
  ];
}).flat();

// Cages transcribed from the drawn cage cell lists. A null total means the
// source rule supplies only the no-repeat condition.
const CAGES = [
  { total: null, cells: [[2, 2], [2, 3], [3, 2], [3, 3]] },
  { total: null, cells: [[2, 4], [3, 4], [4, 2], [4, 3], [4, 4]] },
  { total: 31, cells: [[2, 8], [2, 9], [3, 8], [3, 9], [4, 8], [4, 9]] },
  { total: 25, cells: [[7, 3], [8, 3], [8, 4], [9, 3], [9, 4]] },
  { total: null, cells: [[4, 5], [4, 6], [4, 7], [5, 4], [5, 5], [5, 6], [5, 7], [6, 4], [7, 4]] },
  { total: null, cells: [[8, 2], [9, 2]] },
  { total: 35, cells: [[6, 9], [7, 9], [8, 9], [9, 6], [9, 7], [9, 8], [9, 9]] },
  { total: null, cells: [[5, 8], [5, 9], [6, 8], [7, 7], [7, 8], [8, 5], [8, 6], [8, 7], [9, 5]] },
  { total: 20, cells: [[5, 2], [5, 3], [6, 2], [6, 3]] },
  { total: 17, cells: [[1, 5], [2, 5], [3, 5]] },
  { total: 18, cells: [[1, 6], [2, 6], [3, 6]] },
  { total: 25, cells: [[6, 5], [6, 6], [6, 7], [7, 5], [7, 6]] },
];
const cages = CAGES.map(({ total, cells }) => {
  const cellsInCage = cells.map(([r, c]) => cell(r, c));
  return total === null
    ? new AllDifferent(...cellsInCage)
    : new Cage(total, ...cellsInCage);
});

// Dot and diamond locations transcribed from their edge-centered overlays.
const WHITE_DOTS = [
  [[5, 3], [5, 4]], [[7, 5], [8, 5]],
  [[3, 6], [3, 7]], [[5, 6], [6, 6]],
];
const BLUE_DIAMONDS = [
  [[6, 4], [6, 5]], [[5, 7], [6, 7]],
  [[4, 7], [4, 8]], [[3, 5], [4, 5]],
];
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, SIZE);
const whiteDots = WHITE_DOTS.map(([a, b]) =>
  new Pair(consecutiveKey, 'white dot', cell(...a), cell(...b)));
const blueDiamonds = BLUE_DIAMONDS.map(([a, b]) =>
  new SameValues(2, cell(...a), cell(...b)));

return [
  new Shape('1x1', SIZE),
  GRID,
  new Given('R1C1', 1),
  ...rowAndColumnCounts,
  ...cages,
  ...whiteDots,
  ...blueDiamonds,
];
