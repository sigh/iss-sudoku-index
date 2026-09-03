// Title: Budowa
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=1leqvgtT3_w
// Source: https://sudokupad.app/yp4js8z1ck

// Rules encoded:
//  * Chaos Construction: divide the grid into regions of 9 orthogonally
//    connected cells, every cell in exactly one region; digits 1-9 appear once
//    in each row, column and region.  There are no boxes and no givens.
//  * Kreska: two digits adjacent along a line are either consecutive and in
//    different regions, or in a 1:2 ratio and in the same region.  The rules'
//    note that an adjacent 1 and 2 may satisfy either condition needs no
//    special case: that pair passes both digit tests, so the disjunction below
//    already leaves its region relation free.
// Nothing is omitted.

// The eight drawn cyan strokes, each as its cell path in drawn order.
// `closed` marks a stroke whose path returns to its first cell, so its
// wrap-around pair is a line adjacency too.  Consecutive cells on a stroke are
// sometimes diagonal neighbours, so "adjacent along a line" is taken as
// consecutive-along-the-stroke rather than orthogonal adjacency.
const LINES = [
  { cells: ['R2C8', 'R2C9'], closed: false },
  { cells: ['R3C7', 'R3C6', 'R4C5', 'R5C6', 'R5C7'], closed: false },
  { cells: ['R4C6', 'R4C7'], closed: false },
  { cells: ['R6C9', 'R6C8', 'R5C8'], closed: false },
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R2C7', 'R2C6', 'R2C5'], closed: true },
  { cells: ['R5C4', 'R4C4', 'R3C4', 'R3C3', 'R3C2', 'R4C3'], closed: true },
  { cells: ['R3C1', 'R4C1', 'R5C1', 'R4C2'], closed: true },
  { cells: ['R2C2', 'R1C3', 'R1C2', 'R1C1'], closed: true },
];

const linePairs = LINES.flatMap(({ cells, closed }) => {
  const path = closed ? [...cells, cells[0]] : cells;
  return path.slice(1).map((cell, i) => [path[i], cell]);
});

const shape = new Shape('9x9');

// Digit tests for the two halves of the Kreska rule.  Both run over main-grid
// cells, so the key is built with the grid's own value range.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, shape);

// ChaosConstruction exposes the region label of each grid cell as a paired
// 'CC' cell, so "same/different region" is an equality/inequality between the
// two labels.
const cc = cellGraph('9x9').makeOverlay('CC');

const kreska = linePairs.map(([a, b]) => {
  const [labelA, labelB] = cc.at([a, b]);
  return new Or([
    new And([
      new Pair(consecutiveKey, 'Consecutive', a, b),
      new AllDifferent(labelA, labelB),
    ]),
    new And([
      new Pair(ratioKey, 'Ratio 1:2', a, b),
      new SameValues(2, labelA, labelB),
    ]),
  ]);
});

return [
  shape,
  new ChaosConstruction(),
  new NoBoxes(),
  ...kreska,
];
