// Title: Ship's Wheel
// Author: Qodec
// Video: https://www.youtube.com/watch?v=gxLC7I1DlEE
// Source: https://app.crackingthecryptic.com/sudoku/QbR6pNt3jh

// Rules encoded here:
//  - Normal sudoku.
//  - Digits do not repeat on either main diagonal (both drawn in blue: R1C1-R9C9
//    and R9C1-R1C9).
//  - Shikaku: the grid is cut into rectangles of orthogonally connected cells;
//    every cell lies in exactly one rectangle; each rectangle holds exactly one
//    circle; the digit finally placed in that circle is the rectangle's cell
//    count; rectangles do not overlap; digits may repeat in a rectangle unless
//    another rule (row/column/box/diagonal) forbids it.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 20 drawn white circles, one per Shikaku region, read row-major.
const circles = [
  'R2C2', 'R2C5', 'R2C8',
  'R3C4', 'R3C5', 'R3C6',
  'R4C3', 'R4C7',
  'R5C2', 'R5C3', 'R5C7', 'R5C8',
  'R6C3', 'R6C7',
  'R7C4', 'R7C5', 'R7C6',
  'R8C2', 'R8C5', 'R8C8',
];
const circleSet = new Set(circles);

// Every rectangle that could be the region of `circle`: it lies in the grid,
// covers `circle`, holds no second circle ("each rectangle contains exactly
// one circle"), and has at most 9 cells, since its cell count is a circled
// digit (1-9).
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

const rects = circles.map(candidateRects);

// Region labels. Each cell carries the label of the region covering it, so two
// regions can never claim the same cell: a cell in both would need two labels.
// Two circles need distinct labels only if some candidate rectangle of one can
// meet some candidate rectangle of the other; otherwise their regions are
// already disjoint by geometry and the shared label loses nothing. Colouring
// that conflict graph greedily (densest circle first) needs the labels below,
// which fit the grid's own 1-9 range so no widened Shape is required.
const rectSets = rects.map(rs => rs.map(({ cells }) => new Set(cells)));
const canMeet = (i, j) => rectSets[i].some(
  a => rectSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = circles.map(
  (_, i) => circles.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(circles.length);
for (const i of circles.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
const numLabels = Math.max(...labels);
if (numLabels > 9) throw new Error(`need ${numLabels} region labels, only 9 fit`);

// One label cell per grid cell.
const region = graph.makeOverlay('VR');

return [
  new Shape('9x9'),
  region.toVar('Region'),

  // Two givens sit on circled cells (R3C4=2, R4C3=5): these are ordinary
  // Givens on the main grid, and since each circled cell's digit is pinned to
  // its own rectangle's area by the Or/And below, they narrow which branch of
  // that circle's Or can hold, exactly like any other given digit would.
  new Given('R3C3', 8),
  new Given('R3C4', 2),
  new Given('R4C3', 5),

  // Pick one rectangle per circle: it fixes the circled digit to the
  // rectangle's cell count and stamps its label on every covered cell. No
  // extra AllDifferent is added for the rectangle itself -- the rules say
  // digits may repeat in a rectangle unless row/column/box/diagonal already
  // forbid it, so only those existing rules constrain distinctness here.
  ...circles.map((circle, i) => new Or(
    rects[i].map(({ height, width, cells }) => new And([
      new Given(circle, height * width),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
    ]))
  )),
  // The rectangles are pairwise disjoint by the labels above, so requiring the
  // 20 circled digits to total 81 is what makes them cover every cell.
  new Sum(81, ...circles),

  new Diagonal(1),
  new Diagonal(-1),
];
