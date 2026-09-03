// Title: Foggy Segmented Yin Yang Snake
// Author: apetersen
// Video: https://www.youtube.com/watch?v=MekxGJEgSqI
// Source: https://sudokupad.app/zm4m78m9xh

// Normal sudoku, with no given digits.
//
// A one-cell-wide snake of orthogonally connected cells is drawn; it does not
// branch and does not touch itself. The cells off the snake form a single
// orthogonally connected area. No 2x2 region is entirely snake or entirely
// non-snake.
//
// Digits separated by a white dot are consecutive, and the two cells of a dot
// are one snake cell and one non-snake cell.
//
// Box borders divide the snake into segments, and every segment has the same
// sum.
//
// The fog covering the grid, and the digits that clear it, are display only:
// they change nothing about the finished grid, so nothing is encoded for them.
//
// "Touch itself" is read as orthogonal contact. Read as including diagonal
// contact it would forbid every 90-degree turn, since the two cells either
// side of a turn are diagonally adjacent while being two apart along the
// snake. The snake would then be a straight line lying inside one row or one
// column, and every 2x2 region missing that row or column would be entirely
// non-snake, which the rules forbid; so that reading admits no solution.
//
// Solver-discovered state:
//   YY   the shading, from the YinYang constraint: 1 = snake, 2 = non-snake
//   VN1, VN2  the common segment sum N, as 9*VN1 + VN2 - 9 (see below)

const SNAKE = 1;      // YinYang shades are the grid's two lowest values,
const NONSNAKE = 2;   // and every YY cell holds one of them.

// The twelve white dots drawn in the source, each as its two cells.
const DOTS = [
  ['R1C1', 'R2C1'],
  ['R7C2', 'R7C1'],
  ['R8C2', 'R7C2'],
  ['R8C2', 'R9C2'],
  ['R5C3', 'R6C3'],
  ['R4C3', 'R4C4'],
  ['R5C4', 'R4C4'],
  ['R8C7', 'R7C7'],
  ['R5C7', 'R5C6'],
  ['R4C8', 'R4C9'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R9C5'],
];

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const shade = graph.makeOverlay('YY');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const repeat = (value, n) => Array(n).fill(value).join(',');

// -- The segments of a box -------------------------------------------------

// A segment is a maximal run of consecutive snake cells lying inside one box.
// The snake never touches itself, so two snake cells that are orthogonally
// adjacent are consecutive along it; two different runs inside one box are
// therefore never adjacent, and the segments of a box are exactly the
// orthogonally connected components of the snake within that box. A component
// of the snake is also a path: no branching means at most two neighbours, and
// a cycle would be a snake with no ends.
//
// So enumerate every subset of a box that induces a path. Such a subset is a
// segment exactly when all its cells are snake and every box cell touching it
// is not, and the constraint below is that implication.
const pathSubsetsOf = (boxCells) => {
  const inBox = new Set(boxCells);
  const neighbours = new Map(boxCells.map(
    (cell) => [cell, graph.neighbours(cell).filter((n) => inBox.has(n))]));
  const subsets = [];
  for (let mask = 1; mask < (1 << boxCells.length); mask++) {
    const subset = boxCells.filter((_, i) => mask & (1 << i));
    const chosen = new Set(subset);
    const degrees = subset.map(
      (cell) => neighbours.get(cell).filter((n) => chosen.has(n)).length);
    if (degrees.some((d) => d > 2)) continue;              // no branching
    if (degrees.reduce((a, b) => a + b, 0) / 2 !== subset.length - 1) continue;
    if (!graph.connected(subset)) continue;                // one run, no cycle
    subsets.push(subset);
  }
  return subsets;
};

const segmentCandidates = graph.boxes().flatMap((boxCells) => {
  const inBox = new Set(boxCells);
  return pathSubsetsOf(boxCells).map((subset) => {
    const chosen = new Set(subset);
    const touching = boxCells.filter((cell) => !chosen.has(cell)
      && graph.neighbours(cell).some((n) => chosen.has(n)));
    return { subset, touching };
  });
});

// Segment sums are held as 9*VN1 + VN2 - 9 so that both Vars stay inside the
// grid's 1-9 range: VN2 is the low base-9 place plus one, VN1 the high place
// plus one. One Var cannot hold N directly (a Var takes the grid's nine
// values, and N reaches the largest segment sum below).
const BASE = 9;
const MAX_SEGMENT_CELLS = Math.max(
  ...segmentCandidates.map(({ subset }) => subset.length));
// The cells of a segment lie in one box, so they hold distinct digits.
const MAX_SEGMENT_SUM = range(10 - MAX_SEGMENT_CELLS, 9)
  .reduce((a, b) => a + b, 0);
const hiOf = (n) => Math.floor((n - 1) / BASE) + 1;

const targetDomain = [
  new Given('VN1', ...range(1, hiOf(MAX_SEGMENT_SUM))),
  new Given('VN2', ...range(1, BASE)),
];

const equalSegmentSums = segmentCandidates.map(({ subset, touching }) => new Or([
  ...shade.at(subset).map((cell) => new Given(cell, NONSNAKE)),
  ...shade.at(touching).map((cell) => new Given(cell, SNAKE)),
  new Sum(BASE, ['VN1', BASE], ['VN2', 1], ...subset.map((cell) => [cell, -1])),
]));

// -- The snake -------------------------------------------------------------

// The snake does not branch and does not touch itself: no snake cell has three
// snake neighbours. Stated as the count of non-snake neighbours it forces.
const noBranchOrTouch = cells.flatMap((cell) => {
  const neighbours = graph.neighbours(cell);
  if (neighbours.length < 3) return [];
  return [new Or([
    new Given(shade.at(cell), NONSNAKE),
    new ContainAtLeast(repeat(NONSNAKE, neighbours.length - 2),
      ...shade.at(neighbours)),
  ])];
});

// A snake has two ends, so some snake cell has at most one snake neighbour.
// With the shaded region connected and no cell over two neighbours, that is
// what separates a snake from a closed loop.
const hasAnEnd = new Or(cells.map((cell) => {
  const neighbours = graph.neighbours(cell);
  return new And([
    new Given(shade.at(cell), SNAKE),
    new ContainAtLeast(repeat(NONSNAKE, neighbours.length - 1),
      ...shade.at(neighbours)),
  ]);
}));

// -- White dots ------------------------------------------------------------

const dotRules = DOTS.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  // With two shades, "one snake cell and one non-snake cell" is all-different.
  new AllDifferent(...shade.at([a, b])),
]);

return [
  shape,
  // The shading: both shades one orthogonally connected region, and no 2x2
  // region entirely one shade.
  new YinYang(),
  new Var('N', 'segment sum', 2),
  ...targetDomain,
  ...noBranchOrTouch,
  hasAnEnd,
  ...dotRules,
  ...equalSegmentSums,
];
