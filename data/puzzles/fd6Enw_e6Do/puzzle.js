// Title: Shikaku Sudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=fd6Enw_e6Do
// Source: https://app.crackingthecryptic.com/sudoku/743Jt9n2BJ

// Rules encoded here:
//  - Normal sudoku.
//  - The grid is cut into rectangular cages of orthogonally connected cells;
//    every cell lies in exactly one cage; each cage holds exactly one circle;
//    a cage's digits sum to its circled total, when one is drawn, and never
//    repeat.
// Nothing is omitted: 14 circles carry a printed total; the R5C5 circle is
// drawn without one ("sums to the total in the circle (if given)"), so only
// its no-repeat requirement applies.

const graph = cellGraph('9x9');

// The 8 printed givens.
const givens = [
  ['R1C1', 6], ['R2C8', 7], ['R4C5', 6], ['R5C4', 9],
  ['R5C6', 7], ['R6C5', 8], ['R8C2', 2], ['R9C9', 6],
];

// The 15 drawn circles as [cell, total]; provenance: overlay text pairs each
// total with its circle underlay, except R5C5 whose circle carries no text.
const circles = [
  ['R1C2', 28], ['R2C1', 26], ['R2C5', 8], ['R3C3', 18], ['R1C7', 37],
  ['R2C9', 40], ['R4C1', 38], ['R8C1', 23], ['R9C3', 41], ['R8C5', 24],
  ['R7C7', 38], ['R6C9', 27], ['R8C9', 26], ['R9C8', 24], ['R5C5', null],
];
const circleCells = circles.map(([cell]) => cell);
const circleSet = new Set(circleCells);

// Every rectangle that could be `circle`'s cage: on the grid, covering
// `circle`, holding no second circle ("exactly one circle per cage"), and at
// most 9 cells -- a cage's digits can't repeat, so it can't exceed the digit
// range.
const candidateRects = (circle) => {
  const { row, col } = parseCellId(circle);
  const rects = [];
  for (let height = 1; height <= 9; height++) {
    for (let width = 1; height * width <= 9; width++) {
      for (let top = Math.max(1, row - height + 1); top <= row; top++) {
        for (let left = Math.max(1, col - width + 1); left <= col; left++) {
          const cells = graph.block(makeCellId(top, left), height, width);
          if (cells === null) continue;
          if (cells.filter(cell => circleSet.has(cell)).length !== 1) continue;
          rects.push({ height, width, cells });
        }
      }
    }
  }
  return rects;
};
const rects = circleCells.map(candidateRects);

// Region labels: every cell carries the label of the cage covering it, so two
// cages can never claim the same cell. Two circles need distinct labels only
// if some candidate rectangle of one can meet some candidate rectangle of the
// other; otherwise their cages are already disjoint by geometry and sharing a
// label costs nothing. Greedy-colouring the conflict graph (densest circle
// first) needs 9 labels here, so they fit the grid's own 1-9 range.
const rectSets = rects.map(rs => rs.map(({ cells }) => new Set(cells)));
const canMeet = (i, j) => rectSets[i].some(
  a => rectSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = circleCells.map(
  (_, i) => circleCells.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(circleCells.length);
for (const i of circleCells.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
const numLabels = Math.max(...labels);
if (numLabels > 9) throw new Error(`need ${numLabels} region labels, only 9 fit`);

// One region label per grid cell.
const region = graph.makeOverlay('VR');
// One cage cell-count per circle. The circled digit here is a sum, not a
// cell count, so tiling coverage needs its own layer to total against.
const size = graph.makeOverlay('VZ', circleCells);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  region.toVar('Region'),
  size.toVar('Size'),

  // Pick one rectangle per circle: it fixes the cage's total (when drawn) and
  // forbids repeats within it, stamps its label on every covered cell, and
  // records its cell count.
  ...circles.map(([circle, total], i) => new Or(
    rects[i].map(({ height, width, cells }) => new And([
      ...(total === null ? [] : [new Cage(total, ...cells)]),
      ...(total === null && height > 1 && width > 1
        ? [new AllDifferent(...cells)] : []),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
      new Given(size.at(circle), height * width),
    ]))
  )),
  // The cages are pairwise disjoint by the labels above, so requiring their
  // cell counts to total 81 is what makes them tile the whole grid.
  new Sum(81, ...size.cells()),
];
