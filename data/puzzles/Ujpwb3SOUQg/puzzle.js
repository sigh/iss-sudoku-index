// Title: Who's the man in the mirror ?
// Author: Christounet
// Video: https://www.youtube.com/watch?v=Ujpwb3SOUQg
// Source: https://app.crackingthecryptic.com/sudoku/48bg9rh8jm

// Normal sudoku. Every cage's cells sum, by value, to its top-left total;
// digits (not values) may not repeat within a cage. One cell in every row,
// column and box is a mirror cell: its value is 10 minus its digit, every
// other cell's value equals its digit. The nine mirror cells (one per row)
// hold nine different digits.
//
// Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const mirr = graph.makeOverlay('VM');   // 1 = ordinary cell, 2 = mirror cell
const val = graph.makeOverlay('VL');    // the cell's value (mirrored or not)

// The 13 dashed killer cages, each listed top-left cell first, matching the
// drawn total's corner.
const CAGES = [
  { total: 10, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'] },
  { total: 10, cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'] },
  { total: 10, cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'] },
  { total: 10, cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'] },
  { total: 32, cells: ['R3C5', 'R3C6', 'R3C7', 'R4C6', 'R4C7'] },
  { total: 17, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R5C3'] },
  { total: 39, cells: ['R6C3', 'R6C4', 'R7C3', 'R7C4', 'R7C5'] },
  { total: 22, cells: ['R5C7', 'R6C6', 'R6C7', 'R7C6', 'R7C7'] },
  { total: 12, cells: ['R4C5', 'R5C5', 'R6C5'] },
  { total: 20, cells: ['R4C1', 'R5C1', 'R6C1'] },
  { total: 17, cells: ['R4C9', 'R5C9', 'R6C9'] },
  { total: 24, cells: ['R1C5', 'R1C6', 'R2C5'] },
  { total: 9, cells: ['R8C5', 'R9C4', 'R9C5'] },
];
// "Digits may not repeat in cages (but values may repeat)" splits the two
// halves of the killer-cage rule onto two different quantities: distinctness
// is the plain grid digit, while the total sums the value layer below.
const cageDistinct = CAGES.map(c => new AllDifferent(...c.cells));
const cageSums = CAGES.map(c => new Sum(c.total, ...val.at(c.cells)));

// One mirror cell per row, column and box. No drawn mark says which cell --
// the flag is free, discovered like any other digit.
const mirrorHouses = graph.rowsColumnsBoxes().map(
  house => new ContainExact(String(2), ...mirr.at(house)));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// VD<n> is row n's mirror digit; with exactly one mirror cell in the row (via
// mirrorHouses above) it is forced to that cell's digit and nothing else, so
// "each digit 1-9 is mirrored once" is one AllDifferent over the nine rows.
const mirrorDigit = n => 'VD' + n;
const mirrorDigitKey = cached('mirror-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === 2 };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, 9));
const mirrorDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(mirrorDigitKey, 'mirror-digit',
    mirr.at(cell), cell, mirrorDigit(n + 1))));

// A cell's value is 10 minus its digit when it is a mirror cell, its digit
// otherwise.
const valueKey = cached('cell-value', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, mirror: value === 2 };
    if (s.k === 1) return { k: 2, want: s.mirror ? 10 - value : value };
    if (s.k !== 2) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, 9));
const cellValues = gridCells.map(cell =>
  new NFA(valueKey, 'cell-value', mirr.at(cell), cell, val.at(cell)));

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  mirr.toVar('mirror cells'),
  val.toVar('cell value'),
  new Var('D', 'mirror digit by row', 9),
];
const domains = [
  mirr.makeReplicate(new Given(mirr.at(gridCells[0]), 1, 2)),
  val.makeReplicate(new Given(val.at(gridCells[0]), ...range(1, 9))),
  ...range(1, 9).map(n => new Given(mirrorDigit(n), ...range(1, 9))),
];

return [
  shape,
  ...layers,
  ...domains,
  ...cageDistinct,
  ...cageSums,
  ...mirrorHouses,
  new AllDifferent(...range(1, 9).map(mirrorDigit)),
  ...mirrorDigits,
  ...cellValues,
];
