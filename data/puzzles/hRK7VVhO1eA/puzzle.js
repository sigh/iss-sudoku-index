// Title: Ghost Cages
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=hRK7VVhO1eA
// Source: https://sudokupad.app/66g31006zr

// Rules encoded here:
//   Normal sudoku rules apply.
//   The dashed lines are part of non-overlapping rectangular cages hidden in
//   the grid. Digits in a cage do not repeat, and sum to the number
//   represented by one or more cells in its upper left corner (read from left
//   to right). (Eg a cage summing to 27 has a 2 in its upper leftmost cell and
//   a 7 to its right.)
// Nothing is omitted.

const graph = cellGraph('9x9');

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// Drawn data: the nine dashed corner marks, each named by the cell whose
// top-left corner the mark sits on. Every mark is an L whose arms leave the
// vertex heading right and down, so the vertex is the top-left corner of the
// cage the ink belongs to.
const corners = [
  'R1C7', 'R2C5', 'R3C3', 'R3C7', 'R4C2', 'R5C7', 'R7C3', 'R7C5', 'R8C7',
];
const K = corners.length;

// The two unknowns per cage. One Var cell each holds the cage's width and
// height in cells; the shape disjunction below is what pins them, and the
// overlap rule is stated in terms of them.
const cageWidth = new Var('W', 'Cage width', K);
const cageHeight = new Var('H', 'Cage height', K);

// On every drawn corner the rightward arm is still fully opaque where it
// crosses the grid line one cell right of the vertex, so that ink is on the
// cage's top edge and the top edge spans more than one cell. No downward arm
// reaches the grid line one cell below its vertex, so height has no drawn
// lower bound.
const MIN_WIDTH = 2;
// "Digits in a cage do not repeat" caps a cage at 9 cells.
const MAX_CELLS = 9;

// Every width/height a cage anchored at this corner could have: inside the
// grid, at least MIN_WIDTH wide, at most MAX_CELLS cells.
const cageShapes = (corner) => {
  const { row, col } = parseCellId(corner);
  const shapes = [];
  for (let w = MIN_WIDTH; w <= 10 - col; w++) {
    for (let h = 1; h * w <= MAX_CELLS && h <= 10 - row; h++) {
      shapes.push([w, h]);
    }
  }
  return shapes;
};

// One cage: pick a shape, and for that shape state the cage's own two rules.
// The total is read from the cage's top row starting at the corner cell. Of
// the "one or more cells" reads only the 2-cell one can hold: a 1-cell read
// makes the total equal its own top-left digit, which the rest of a cage of at
// least MIN_WIDTH cells already exceeds, and a 3-cell read is at least 100
// while 9 distinct digits sum to at most 45.
const cageRules = (corner, i) => {
  const { row, col } = parseCellId(corner);
  const first = corner;
  const second = makeCellId(row, col + 1);
  return new Or(cageShapes(corner).map(([w, h]) => {
    const cells = graph.block(corner, h, w);
    return new And([
      new Given(cageWidth.cell(i + 1), w),
      new Given(cageHeight.cell(i + 1), h),
      new AllDifferent(...cells),
      // sum(cage) = 10*first + second
      new Sum(0, ...cells, [first, -10], [second, -1]),
    ]);
  }));
};

// Two cages are non-overlapping exactly when their row spans are disjoint or
// their column spans are disjoint. Both corners are fixed, so each of those
// four ways is a bound on a single width or height Var: the upper cage's
// height stops above the lower corner's row, or the left cage's width stops
// left of the right corner's column.
const nonOverlapping = (i, j) => {
  const a = parseCellId(corners[i]);
  const b = parseCellId(corners[j]);
  const options = [];
  if (a.row < b.row) {
    options.push(new Given(cageHeight.cell(i + 1), ...range(1, b.row - a.row)));
  }
  if (b.row < a.row) {
    options.push(new Given(cageHeight.cell(j + 1), ...range(1, a.row - b.row)));
  }
  if (a.col + MIN_WIDTH <= b.col) {
    options.push(
      new Given(cageWidth.cell(i + 1), ...range(MIN_WIDTH, b.col - a.col)));
  }
  if (b.col + MIN_WIDTH <= a.col) {
    options.push(
      new Given(cageWidth.cell(j + 1), ...range(MIN_WIDTH, a.col - b.col)));
  }
  return new Or(options);
};

const cagePairs = corners.flatMap(
  (_, i) => range(i + 1, K - 1).map(j => nonOverlapping(i, j)));

return [
  new Shape('9x9'),

  new Given('R3C2', 9),
  new Given('R4C4', 8),
  new Given('R5C6', 6),
  new Given('R7C8', 9),

  cageWidth,
  cageHeight,
  ...corners.map(cageRules),
  ...cagePairs,
];
