// Title: Sum Sets Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=I4cjqZG9zfw
// Source: https://app.crackingthecryptic.com/sudoku/jnb34B883R

// Normal sudoku rules apply (regions are the default 3x3 boxes). Every
// marked cage forbids repeated digits among its own cells -- a one-cell cage
// needs nothing beyond that -- and every marked cage's total must differ
// from every other marked cage's total. No cage carries a printed total.

// Cage cells, one array per marked cage; all 23 are drawn with no printed
// total.
const cages = [
  ['R1C1'],
  ['R1C4', 'R1C5'],
  ['R1C9'],
  ['R2C5', 'R2C6'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R3C7'],
  ['R4C9', 'R5C9'],
  ['R5C7', 'R6C7', 'R6C8', 'R5C8', 'R6C9', 'R7C8'],
  ['R7C7'],
  ['R9C9'],
  ['R9C5', 'R9C6'],
  ['R8C5', 'R8C4'],
  ['R9C1'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R7C3'],
  ['R3C3'],
  ['R3C2', 'R4C2', 'R4C1', 'R4C3', 'R5C2', 'R5C3'],
  ['R5C1', 'R6C1'],
  ['R6C3', 'R6C4'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R5C6', 'R6C6', 'R6C5'],
  ['R5C5'],
  ['R4C6', 'R4C7'],
];

// "Digits cannot repeat within a cage." A one-cell cage adds no local
// constraint.
const cageDistinctness = cages
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// A cage total can reach 39 (six distinct digits from 1-9), past ISS's
// 16-value cap on any single cell/Var domain, so no cage's raw total is ever
// held in one cell. Each cage instead gets a tens-digit and a ones-digit
// Var; tying them to the cage's own cells with a coefficient Sum recovers
// the real total (base-10 place value) without ever materializing a value
// above 9.
const tensVar = new Var('T', 'cage total tens digit', cages.length);
const onesVar = new Var('O', 'cage total ones digit', cages.length);

function totalTie(cells, index) {
  return new Sum(
    0, ...cells,
    [tensVar.cell(index + 1), -10],
    [onesVar.cell(index + 1), -1]);
}

// [min, max] reachable total for a cage of this size (some `size` distinct
// digits from 1-9); used only to skip cage pairs whose totals can never
// collide, since a smaller/larger cage may still be forced into the same
// range.
function totalRange(size) {
  return [(size * (size + 1)) / 2, (size * (19 - size)) / 2];
}
const ranges = cages.map(cells => totalRange(cells.length));

function overlaps([aMin, aMax], [bMin, bMax]) {
  return aMin <= bMax && bMin <= aMax;
}

// Two cages' totals collide only when both their tens and ones digits match,
// so "different total" is "tens differ OR ones differ" -- two independent
// binary inequalities, no combined key needed. valueOffset 0 matches the
// widened Shape's 0-9 alphabet below.
const notEqual = Pair.fnToKey((a, b) => a !== b, 10, 0);
function distinctTotals(i, j) {
  return new Or([
    new Pair(
      notEqual, `cage${i}-cage${j}-tens`,
      tensVar.cell(i + 1), tensVar.cell(j + 1)),
    new Pair(
      notEqual, `cage${i}-cage${j}-ones`,
      onesVar.cell(i + 1), onesVar.cell(j + 1)),
  ]);
}

const crossCageDistinctness = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    if (overlaps(ranges[i], ranges[j])) {
      crossCageDistinctness.push(distinctTotals(i, j));
    }
  }
}

function* range(from, to) {
  for (let v = from; v <= to; v++) yield v;
}

// Widening the grid alphabet to 0-9 for the tens/ones Vars widens the main
// grid's alphabet too; replicate one Given(1-9) template onto every real
// grid cell to hold it to the true digit range.
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const gridDigitRange = graph.makeReplicate(
  [new Given(gridCells[0], ...range(1, 9))], gridCells);

return [
  new Shape('9x9', '0-9'),
  gridDigitRange,

  // Givens.
  new Given('R1C3', 5),
  new Given('R2C1', 4),
  new Given('R2C2', 2),
  new Given('R2C9', 6),
  new Given('R8C1', 2),
  new Given('R8C8', 4),
  new Given('R8C9', 8),
  new Given('R9C7', 5),

  tensVar,
  onesVar,
  ...cages.map((cells, i) => totalTie(cells, i)),
  ...cageDistinctness,
  ...crossCageDistinctness,
];
