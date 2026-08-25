// Title: Hidden Arrows
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=18ow5Y4E75U
// Source: https://app.crackingthecryptic.com/webapp/rH87NM4mrg

// Normal sudoku. 8 cages: each cage's digits sum to the printed total, and
// digits do not repeat within a cage (Cage handles both). Each cage also
// hides a standard arrow clue: one end of the cage is a circle, the rest of
// the cage is the arm running from the circle to the other end, and the arm
// digits sum to the (possibly multi-digit) number in the circle. Neither
// which end is the circle nor how many cells it occupies is given -- both
// are worked out by the solver, so every (end, circle-length) reading is
// encoded as one branch of an Or per cage.
//
// Each cage is a simple snake of orthogonally-adjacent cells with exactly two
// ends (no branching) -- a plain geometric fact about the drawn cage shape,
// computed below from the cage's own cell list, not assumed. Reading a
// circle's digits "in the direction of the arrow" means: starting at the far
// end of the circle (away from the arm) and reading toward the arm, most
// significant digit first.
//
// The circle can only be 1 or 2 digits here: any 3+ digit circle value is at
// least 100 (leading digit >= 1), while the largest cage has 7 cells, so a
// 3+ digit circle leaves at most 4 arm cells, whose digits are distinct and
// from 1-9 and so sum to at most 9+8+7+6 = 30 < 100. That reading can never
// hold, so it is not a live candidate and is left out of the Or.

// Cage cell lists, transcribed from the payload's `cages` array (converting
// its 0-indexed [row, col] pairs to R#C# ids), with each cage's printed
// total.
const cageData = [
  { cells: ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R4C1', 'R5C1', 'R5C2'], total: 40 },
  { cells: ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R8C4'], total: 35 },
  { cells: ['R3C4', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R7C6'], total: 32 },
  { cells: ['R1C7', 'R2C7', 'R2C8', 'R2C9'], total: 16 },
  { cells: ['R3C9', 'R4C9', 'R5C9'], total: 12 },
  { cells: ['R3C6', 'R3C7', 'R3C8', 'R4C8', 'R5C8'], total: 25 },
  { cells: ['R7C7', 'R7C8', 'R7C9', 'R8C5', 'R8C6', 'R8C7', 'R8C9'], total: 38 },
  { cells: ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4'], total: 24 },
];

const graph = cellGraph('9x9');

// Recover the cage's own path order from its cell set: a cage is a simple
// snake (every cell has at most 2 orthogonal neighbours within the cage), so
// walking from either end gives the unique traversal, independent of the
// order the cells happen to be listed in.
function orderPath(cells) {
  const set = new Set(cells);
  const neighboursOf = cell => graph.neighbours(cell).filter(n => set.has(n));
  const end = cells.find(cell => neighboursOf(cell).length <= 1) ?? cells[0];
  const path = [end];
  const visited = new Set([end]);
  while (path.length < cells.length) {
    const next = neighboursOf(path[path.length - 1]).find(n => !visited.has(n));
    path.push(next);
    visited.add(next);
  }
  return path;
}

// One branch: `circleCells` (in reading order, most significant first) is
// the multi-digit circle value; `armCells` (any order) sum to it. A 1-cell
// circle has no place-value weighting, so it is a plain two-segment equal
// sum; a multi-cell circle needs the place-value coefficients.
function arrowBranch(armCells, circleCells) {
  if (circleCells.length === 1) {
    return new EqualSum(armCells, circleCells);
  }
  const coeffCells = circleCells.map(
    (cell, i) => [cell, -(10 ** (circleCells.length - 1 - i))]);
  return new Sum(0, ...armCells, ...coeffCells);
}

function hiddenArrowCage({ cells, total }) {
  const path = orderPath(cells);
  const len = path.length;
  const branches = [];
  for (const k of [1, 2]) {
    if (k > len - 1) continue;
    // Circle at the path's start: reads start -> end (into the arm).
    branches.push(arrowBranch(path.slice(k), path.slice(0, k)));
    // Circle at the path's end: reads end -> start (into the arm), so the
    // circle cells are taken in reverse path order.
    branches.push(arrowBranch(path.slice(0, len - k), path.slice(len - k).reverse()));
  }
  return [
    new Cage(total, ...cells),
    new Or(branches),
  ];
}

return [
  new Shape('9x9'),
  ...cageData.flatMap(hiddenArrowCage),
];
