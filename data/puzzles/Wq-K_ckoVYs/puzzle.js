// Title: SET PIECE
// Author: Wisteria Fall
// Video: https://www.youtube.com/watch?v=Wq-K_ckoVYs
// Source: https://sudokupad.app/w1n9shvh3t

// Rules encoded below, in order:
//   * one multiset of nine digits from 1-9 (repeats allowed) holds for the
//     whole puzzle, and every row, column and bolded region of the field is a
//     valid subset of it;
//   * digits on an arrow sum to the digit in the connected circle;
//   * squares contain even digits;
//   * white dots separate consecutive digits.
// Shaded cells hold no digit, so they are absent from every row, column and
// region listed here. Nothing is omitted.

// Rows and columns of this puzzle may repeat a digit, which the ISS main grid
// cannot express, so the 72 field cells live in a Var group and the 1x1 main
// grid is inert scaffolding.
const shape = new Shape('1x1', 9);
const digits = new Var('G', 'field cells', '9x8');

// The eight bolded regions, read off the thick outlines. Their union is exactly
// the set of unshaded cells, so the field is derived from them.
const regions = [
  [[1,2],[1,3],[1,4],[1,5],[2,1],[2,2],[3,1],[4,1],[5,1]],
  [[1,6],[1,7],[1,8],[1,9],[2,9],[2,10],[3,10],[4,10],[5,10]],
  [[2,6],[3,6],[3,7],[4,6],[4,7],[4,8],[5,6],[5,7],[5,8]],
  [[3,4],[4,3],[4,4],[5,2],[5,3],[5,4],[6,3],[6,4],[7,3]],
  [[3,5],[4,5],[5,5],[6,5],[7,4],[7,5],[8,4],[8,5],[9,5]],
  [[6,1],[7,1],[8,1],[9,1],[9,2],[10,2],[10,3],[10,4],[10,5]],
  [[6,6],[6,7],[6,8],[6,9],[7,6],[7,7],[7,8],[8,6],[8,7]],
  [[6,10],[7,10],[8,10],[9,9],[9,10],[10,6],[10,7],[10,8],[10,9]],
];

const key = (r, c) => `${r},${c}`;
const inField = new Set(regions.flat().map(([r, c]) => key(r, c)));
// Var cells are numbered in field reading order, so VG1..VG72 spell the answer.
const cellIds = new Map();
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    if (inField.has(key(r, c))) cellIds.set(key(r, c), digits.cell(cellIds.size + 1));
  }
}
const cell = (r, c) => cellIds.get(key(r, c));
const cells = (list) => list.map(([r, c]) => cell(r, c));

const rowsAndColumns = [
  ...Array.from({length: 10}, (_, r) =>
    Array.from({length: 10}, (_, c) => cell(r + 1, c + 1)).filter(Boolean)),
  ...Array.from({length: 10}, (_, c) =>
    Array.from({length: 10}, (_, r) => cell(r + 1, c + 1)).filter(Boolean)),
];

// A row or column shorter than nine cells is a strict subset of the multiset.
// Completing it with fresh unconstrained cells and then requiring all 28
// completed units to hold the same nine values (SameValues compares counts, so
// repeats are respected) says exactly that: the unit's digits plus something
// else are the multiset. Full-length units and the regions equal it outright.
const shortfalls = rowsAndColumns.map(unit => 9 - unit.length);
const padding = new Var('P', 'multiset padding',
  shortfalls.reduce((total, n) => total + n, 0));
const padStarts = shortfalls.reduce((acc, n) => [...acc, acc[acc.length - 1] + n], [0]);
const padRuns = shortfalls.map((n, i) =>
  Array.from({length: n}, (_, k) => padding.cell(padStarts[i] + k + 1)));
const units = [
  ...rowsAndColumns.map((unit, i) => unit.concat(padRuns[i])),
  ...regions.map(cells),
];

// Padding cells carry no puzzle meaning, so permuting one unit's padding would
// otherwise duplicate every solution. Ordering each run keeps one representative.
const nonDecreasing = Pair.fnToKey((a, b) => a <= b, 9);

// Arrows, circle cell first. Two arrows share the R2C6 circle. Shaded cells
// crossed by a shaft carry no digit and so are not arm cells: R2C5 on the arrow
// to R1C3, and R2C7/R2C8 on the arrow to R1C9.
const arrows = [
  [[6,5],[7,4],[7,3]], [[5,5],[4,4],[3,4]], [[5,6],[4,7],[4,8]],
  [[6,6],[7,7],[8,7]], [[5,10],[6,9],[7,8]], [[6,1],[5,2],[4,3]],
  [[2,6],[1,4],[1,3]], [[3,1],[2,1],[2,2]], [[9,5],[10,4],[10,3],[9,2]],
  [[2,6],[1,9]], [[9,9],[9,10]],
];

// The two grey squares drawn on the field.
const squares = [[3,7],[7,1]];

// White dots, as drawn on cell edges.
const dots = [
  [[1,3],[1,4]], [[2,9],[2,10]], [[4,7],[4,8]], [[6,3],[6,4]],
  [[6,9],[6,10]], [[10,7],[10,8]], [[4,8],[5,8]], [[7,7],[8,7]],
];
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

return [
  shape,
  new Given('R1C1', 1), // Pins the inert main grid to a single value.
  digits,
  padding,
  new SameValues(units.length, ...units.flat()),
  ...padRuns.filter(run => run.length > 1)
    .map(run => new Pair(nonDecreasing, 'padding order', ...run)),
  ...arrows.map(arrow => new Arrow(...cells(arrow))),
  ...squares.map(square => new Given(cell(...square), 2, 4, 6, 8)),
  ...dots.map(dot => new Pair(consecutive, 'white dot', ...cells(dot))),
];
