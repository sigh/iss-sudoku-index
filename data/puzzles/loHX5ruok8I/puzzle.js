// Title: Killocator
// Author: Starwarigami
// Video: https://www.youtube.com/watch?v=loHX5ruok8I
// Source: https://app.crackingthecryptic.com/sudoku/tLRrPprg8T

// Rules encoded here:
//   - Normal Sudoku (Shape's default rows, columns and boxes).
//   - Digits may not repeat in a cage.
//   - Every cage total is a 2-digit number xy, and the digit at row x column y
//     equals the number of cells in that cage.
// No totals are printed and there are no givens; nothing is omitted.

// Drawn cages, transcribed from the 19 caged regions on the board. Two cells,
// R7C2 and R7C6, are in no cage.
const CAGES = [
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C4', 'R2C4', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R1C5', 'R2C5'],
  ['R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9'],
  ['R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R5C7', 'R5C8', 'R6C7', 'R6C8', 'R6C9'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R4C4', 'R4C5'],
  ['R7C5', 'R8C5'],
  ['R5C5', 'R5C6'],
  ['R7C3', 'R7C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C6', 'R1C7'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6'],
];

// Totals a cage of `size` distinct digits 1-9 could carry and still be readable
// as "xy": at least 10 (two digits), at most 99, and not a multiple of 10
// (column y = 0 does not exist). The size bounds are the smallest and largest
// sums of `size` distinct digits, so they exclude only arithmetically
// impossible totals, not legal readings.
function candidateTotals(size) {
  const min = (size * (size + 1)) / 2;
  let max = 0;
  for (let d = 9; d > 9 - size; d--) max += d;
  const totals = [];
  for (let s = Math.max(min, 10); s <= Math.min(max, 99); s++) {
    if (s % 10 !== 0) totals.push(s);
  }
  return totals;
}

// The total is unprinted, so each cage becomes a disjunction over the totals it
// could take. Each branch fixes the total and, in the same breath, the cell the
// total's digits name: tens digit = row, units digit = column, holding the
// cage's cell count.
function totalPointsAtSizeCell(cells) {
  const size = cells.length;
  return new Or(candidateTotals(size).map(total => new And([
    new Sum(total, ...cells),
    new Given(makeCellId(Math.floor(total / 10), total % 10), size),
  ])));
}

// One drawn cage (R7C7-R9C9) covers box 9 exactly, so Sudoku already forbids
// repeats there; only the other cages need a stated AllDifferent.
function coversWholeBox(cells) {
  const boxes = new Set(cells.map(id => {
    const { row, col } = parseCellId(id);
    return `${Math.floor((row - 1) / 3)},${Math.floor((col - 1) / 3)}`;
  }));
  return cells.length === 9 && boxes.size === 1;
}

return [
  new Shape('9x9'),
  ...CAGES.filter(cells => !coversWholeBox(cells))
    .map(cells => new AllDifferent(...cells)),
  ...CAGES.map(totalPointsAtSizeCell),
];
