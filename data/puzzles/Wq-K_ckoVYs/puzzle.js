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

// Rows and columns here may repeat a digit, which a Sudoku-type main grid
// cannot express (its rows/columns are unconditionally all-different), so
// the grid is Raw: no implicit constraints. The drawn canvas is a 10x10
// square with its four corners cut off and 24 more cells shaded; those 28
// non-field cells carry no rule, so they are pinned to a single value each --
// otherwise they would range freely over 1-9 and multiply every real
// solution by 9^28.
const shape = new Shape('10x10', 9, 'Raw');
const cell = (row, col) => makeCellId(row, col);
const cells = (list) => list.map(([r, c]) => cell(r, c));

// The eight bolded regions, read off the thick outlines. Their union is
// exactly the set of unshaded cells, so the field is derived from them.
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

const rowsAndColumns = [
  ...Array.from({length: 10}, (_, r) =>
    Array.from({length: 10}, (_, c) => [r + 1, c + 1])
      .filter(([r2, c2]) => inField.has(key(r2, c2)))),
  ...Array.from({length: 10}, (_, c) =>
    Array.from({length: 10}, (_, r) => [r + 1, c + 1])
      .filter(([r2, c2]) => inField.has(key(r2, c2)))),
].map(cells);

const nonField = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    if (!inField.has(key(r, c))) nonField.push(cell(r, c));
  }
}

// Complete each short row/column to nine with fresh unconstrained Var cells,
// then tie all 28 completed units
// (rows, columns, regions) to one multiset with SameValues, which compares
// counts so repeats are respected. Full-length units and the regions equal
// the multiset outright; a short unit's real digits plus its padding do.
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

// Padding cells carry no puzzle meaning, so permuting one unit's padding
// would otherwise duplicate every solution: the runs are 4,3,3,4 long on both
// axes, about 4.3e8 spurious copies of each real solution. Ordering each run
// non-decreasing keeps one representative -- a pin on an artifact of the
// encoding, not on puzzle content.
const nonDecreasing = Pair.fnToKey((a, b) => a <= b, 9);

// Arrows, circle cell first. Two arrows share the R2C6 circle. Shaded cells
// crossed by a shaft carry no digit and so are not arm cells: R2C5 on the
// arrow to R1C3, and R2C7/R2C8 on the arrow to R1C9.
const arrows = [
  [[6,5],[7,4],[7,3]], [[5,5],[4,4],[3,4]], [[5,6],[4,7],[4,8]],
  [[6,6],[7,7],[8,7]], [[5,10],[6,9],[7,8]], [[6,1],[5,2],[4,3]],
  [[2,6],[1,4],[1,3]], [[3,1],[2,1],[2,2]], [[9,5],[10,4],[10,3],[9,2]],
  [[2,6],[1,9]], [[9,9],[9,10]],
];

// The two grey squares drawn on the field.
const squares = [[3,7],[7,1]];

// White dots, as drawn on cell edges. Each pair is orthogonally adjacent on
// the real board, so WhiteDot's own adjacency check applies.
const dots = [
  [[1,3],[1,4]], [[2,9],[2,10]], [[4,7],[4,8]], [[6,3],[6,4]],
  [[6,9],[6,10]], [[10,7],[10,8]], [[4,8],[5,8]], [[7,7],[8,7]],
];

return [
  shape,
  ...nonField.map(c => new Given(c, 1)),
  padding,
  new SameValues(units.length, ...units.flat()),
  ...padRuns.filter(run => run.length > 1)
    .map(run => new Pair(nonDecreasing, 'padding order', ...run)),
  ...arrows.map(arrow => new Arrow(...cells(arrow))),
  ...squares.map(square => new Given(cell(...square), 2, 4, 6, 8)),
  ...dots.map(dot => new WhiteDot(...cells(dot))),
];
