// Title: Advent Calendar (full puzzle)
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=LIiST_VvbCk
// Source: https://sudokupad.app/PPtTtQg476

// Digits 1-9. Cages have non-repeating digits and the displayed total or
// parity; arrow arms total their circled cell. A cell may contribute either
// its digit or twice its digit, representing a possible mean-mini doubler.
// Omitted: determining the mean-mini/Sudoku-box layout, the required doubler
// positions, and the three-stage mean-mini/Quattroquadri construction.

// The final rows and columns can repeat digits, so the 12x12 answer cannot
// use ISS's all-different main grid. VG is the row-major answer layer; the
// pinned 1x1 main grid is only a placeholder.
const SHAPE = new Shape('1x1', '0-9');
const GRID = new Var('G', 'Grid', '12x12');
const ADDS = new Var('A', 'DoublerAddends', '12x12');
const ref = cellGraph('12x12');
const gridLayer = ref.makeOverlay('VG');
const at = (r, c) => GRID.cell(r, c);
const add = (r, c) => ADDS.cell(r, c);
const cells = (points) => points.map(([r, c]) => at(r, c));
const terms = (points, sign = 1) => points.flatMap(([r, c]) =>
  sign === 1 ? [at(r, c), add(r, c)] : [[at(r, c), -1], [add(r, c), -1]]);

// A doubler addend is either 0 or its cell's digit. This lets the recovered
// numeric clues use the rule's effective values without guessing which cells
// are the stage-three doublers.
const doublerKey = Pair.fnToKey((digit, extra) =>
  extra === 0 || extra === digit, SHAPE);
const doublerLinks = GRID.cells().map((cell, i) =>
  new Pair(doublerKey, 'possible doubler', cell, ADDS.cells()[i]));

// Drawn cages, [total|null for parity cages, cells]; source coordinates are
// R/C values transcribed from the cage array.
const CAGES = [
  [16, [[2,1],[2,2],[2,3]]], [9, [[3,4],[3,5]]],
  [13, [[1,5],[1,6]]], [11, [[4,6],[5,6]]],
  [7, [[5,4],[5,5]]], [11, [[4,1],[5,1],[6,1]]],
  [10, [[6,2],[6,3]]], [13, [[1,10],[1,11],[2,10]]],
  [5, [[3,10],[3,11]]], [12, [[1,8],[2,8]]],
  [12, [[4,8],[4,9]]], [12, [[4,10],[5,10]]],
  [6, [[4,11],[5,11]]], [13, [[5,12],[6,11],[6,12]]],
  [13, [[11,2],[11,3],[12,2]]], [11, [[11,1],[12,1]]],
  [14, [[8,3],[9,2],[9,3]]], [10, [[7,1],[7,2]]],
  [14, [[11,4],[11,5],[11,6]]], [12, [[12,5],[12,6]]],
  [null, [[8,6],[9,6]]], [15, [[9,7],[9,8]]],
  [null, [[8,7]]], [null, [[7,8],[7,9]]],
  [18, [[7,11],[8,10],[8,11]]], [13, [[9,11],[9,12]]],
  [3, [[12,12]]], [14, [[11,11],[11,12]]],
  [11, [[10,10],[10,11]]], [14, [[11,7],[11,8],[12,8]]],
  [10, [[11,9],[12,9]]], [null, [[2,12],[3,12]]],
];
const cages = CAGES.flatMap(([total, points], index) => {
  const digitCells = cells(points);
  const result = [new AllDifferent(...digitCells)];
  if (total === null) {
    // The unnumbered cages remain distinct; their displayed parity is omitted.
  } else {
    result.push(new Sum(total, ...terms(points)));
  }
  return result;
});

// Circle followed by its arm, from the recovered arrow geometry. The final
// raw arrow stroke duplicates the last segment of arrow 8 and has no circle.
const ARROWS = [
  [[1,2], [[2,3],[3,2]]], [[2,4], [[2,5],[3,5]]],
  [[6,4], [[5,4],[5,5],[6,5]]], [[4,2], [[5,2],[6,2],[6,1]]],
  [[3,12], [[3,11],[3,10],[2,10]]], [[1,7], [[2,8],[1,9]]],
  [[3,9], [[2,9],[2,8]]], [[5,7], [[5,8],[6,9]]],
  [[6,7], [[6,8],[5,7]]], [[11,1], [[10,2],[11,3],[11,2]]],
  [[7,9], [[8,8],[9,7]]], [[9,3], [[9,2],[8,3],[7,2]]],
  [[7,5], [[8,4],[9,5],[8,5]]], [[7,6], [[8,5],[9,6]]],
  [[11,5], [[10,5],[10,6]]], [[9,12], [[8,12],[7,12]]],
  [[11,9], [[10,9],[11,8],[11,7]]],
];
const arrows = ARROWS.map(([bulb, arm]) =>
  new EqualSum(terms([bulb]), terms(arm)));

return [
  SHAPE,
  GRID,
  ADDS,
  new Given('R1C1', 1),
  gridLayer.makeReplicate(new Given(gridLayer.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...doublerLinks,
  ...cages,
  ...arrows,
];
