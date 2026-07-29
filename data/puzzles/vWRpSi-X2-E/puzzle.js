// Title: Oopsy
// Author: ArchieG
// Video: https://www.youtube.com/watch?v=vWRpSi-X2-E
// Source: https://app.crackingthecryptic.com/Hgnj2QNJPj

// The displayed 9x9 grid is held in VG because its one erroneous cell violates
// the main grid's unconditional row, column, and box all-different baseline.
// Exactly one candidate is the error: its row, column, and box have one duplicate;
// every other row, column, and box is all-different. The marked cage and givens
// cannot contain that candidate. X marks join pairs summing to 10; the cage totals 52.

const graph = cellGraph('9x9');
const grid = graph.makeOverlay('VG');
const cell = (row, col) => grid.at(makeCellId(row, col)); // lint-ok: overlay-at-make-cell-id
const row = r => Array.from({ length: 9 }, (_, c) => cell(r, c + 1));
const col = c => Array.from({ length: 9 }, (_, r) => cell(r + 1, c));
// lint-ok: manual-box-arithmetic
const box = (br, bc) => Array.from({ length: 3 }, (_, dr) =>
  Array.from({ length: 3 }, (_, dc) => cell(br * 3 + dr + 1, bc * 3 + dc + 1))).flat(); // lint-ok: manual-box-arithmetic
const units = [
  ...Array.from({ length: 9 }, (_, r) => row(r + 1)),
  ...Array.from({ length: 9 }, (_, c) => col(c + 1)),
  ...Array.from({ length: 3 }, (_, br) =>
    Array.from({ length: 3 }, (_, bc) => box(br, bc))).flat(),
];
const id = (r, c) => `${r},${c}`;
const givenCells = new Set(['1,4', '4,2', '7,7', '8,9', '9,4', '9,5']);
const cageCells = [cell(1, 6), cell(2, 6), cell(3, 6), cell(3, 7),
  cell(3, 8), cell(3, 9), cell(4, 7), cell(4, 8)];
// For a selected error cell, each affected unit has an otherwise all-different
// remainder and one equal partner; all unaffected units remain all-different.
const errorCase = error => new And(units.flatMap(unit => {
  if (!unit.includes(error)) return [new AllDifferent(...unit)];
  const rest = unit.filter(c => c !== error);
  return [new AllDifferent(...rest), new Or(rest.map(c => new SameValues(2, error, c)))];
}));
// The custom Pair predicate is the stated X-mark sum rule.
const sum10 = Pair.fnToKey((a, b) => a + b === 10, cellGeometry());
const markedX = [[3,2,4,2], [2,6,3,6], [3,6,3,7], [3,7,4,7], [4,7,4,8],
  [2,8,3,8], [5,8,6,8], [7,8,7,9], [8,8,9,8], [6,6,7,6], [6,6,6,7],
  [5,6,5,7], [5,4,5,5], [6,4,7,4], [6,3,7,3], [6,1,6,2], [8,1,8,2],
  [8,3,8,4], [7,5,7,6], [1,5,1,6], [2,4,3,4]];
const protectedCells = new Set([
  ...givenCells, '1,6', '2,6', '3,6', '3,7', '3,8', '3,9', '4,7', '4,8',
]);
const candidates = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => [r + 1, c + 1])).flat()
  .filter(([r, c]) => !protectedCells.has(id(r, c)))
  .map(([r, c]) => cell(r, c));
const xPairs = markedX.map(pair => {
  const [r1, c1, r2, c2] = pair;
  return new Pair(sum10, 'X sum 10', cell(r1, c1), cell(r2, c2));
});

return [
  new Shape('1x1', 9),
  new Given('R1C1', 1),
  grid.toVar('displayed grid'),
  new Given(cell(1, 4), 8), new Given(cell(4, 2), 7), new Given(cell(7, 7), 5),
  new Given(cell(8, 9), 1), new Given(cell(9, 4), 3), new Given(cell(9, 5), 6),
  new Sum(52, ...cageCells),
  ...xPairs,
  new Or(candidates.map(errorCase)),
];
