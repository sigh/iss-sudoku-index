// Title: Shikaku-doku
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=jxQHjZwGDGI
// Source: https://sudokupad.app/james-sinclair/shikaku-doku

// Rules encoded here:
//  - Normal sudoku.
//  - Shikaku: the grid is cut into rectangles of orthogonally connected cells;
//    every cell lies in exactly one rectangle; each rectangle holds exactly one
//    circle; the digit in that circle is the rectangle's cell count; digits do
//    not repeat inside a rectangle.
//  - Digits do not repeat on the marked diagonal (the drawn line runs R9C1-R1C9).
//  - Each cage's digits sum to the small number in its top-left corner. The
//    rules do not forbid repeats in a cage, so Sum rather than Cage; every drawn
//    cage lies within a single row or column, so its cells differ regardless.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 19 drawn white circles, one per Shikaku region.
const circles = [
  'R1C2', 'R1C9', 'R2C3', 'R2C8', 'R3C7', 'R4C6', 'R5C1', 'R5C5', 'R6C4',
  'R6C9', 'R7C3', 'R7C9', 'R8C1', 'R8C2', 'R8C5', 'R8C6', 'R9C1', 'R9C2',
  'R9C4',
];

// The drawn cages, as [corner total, cells].
const cageClues = [
  [13, ['R8C5', 'R8C6']],
  [17, ['R4C4', 'R4C5']],
  [17, ['R7C1', 'R7C2']],
  [7, ['R2C5', 'R3C5']],
  [4, ['R6C9', 'R7C9']],
  [16, ['R5C7', 'R5C8']],
  [11, ['R9C5', 'R9C6']],
  [10, ['R8C3', 'R9C3']],
  [12, ['R2C9', 'R3C9']],
];

const circleSet = new Set(circles);

// Every rectangle that could be the region of `circle`: it lies in the grid,
// covers `circle`, holds no second circle ("each region contains exactly one
// circle"), and has at most 9 cells, since its cell count is a circled digit.
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
// that conflict graph greedily (densest circle first) needs 9 labels, so the
// labels fit the grid's own 1-9 range and no widened Shape is required.
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

  // Pick one rectangle per circle: it fixes the circled digit to the
  // rectangle's cell count, stamps its label on every covered cell, and (when
  // the rectangle spans more than one row and column, so that rows and columns
  // do not already separate its cells) keeps its digits distinct.
  ...circles.map((circle, i) => new Or(
    rects[i].map(({ height, width, cells }) => new And([
      new Given(circle, height * width),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
      ...(height > 1 && width > 1 ? [new AllDifferent(...cells)] : []),
    ]))
  )),
  // The rectangles are pairwise disjoint by the labels above, so requiring the
  // 19 circled digits to total 81 is what makes them cover every cell.
  new Sum(81, ...circles),

  new Diagonal(1),

  ...cageClues.map(([total, cells]) => new Sum(total, ...cells)),
];
