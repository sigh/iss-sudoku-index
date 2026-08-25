// Title: X-Sum Little Killer
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=KyHHUHLqjIw
// Source: https://app.crackingthecryptic.com/webapp/gtp2Rd8jfp

// Standard 9x9 sudoku (rows/cols/boxes). Thermo() enforces strictly
// increasing digits from the bulb. Sum() enforces each cage's total (no
// stated in-cage distinctness). Each outside diagonal ray shows the sum of
// its first X cells (nearest the badge first), where X is the value of the
// ray's first cell -- built from Given/Sum/And/Or below since it is a
// Little-Killer-direction ray rather than a row/column, which is all the
// built-in XSum class supports.

// One diagonal "X-Sum" ray: for each possible value i of the first cell,
// require that first cell == i and that the following i-1 cells sum to
// (total - i); disjoin over every i the ray is long enough to support. This
// mirrors the standard X-Sum reading applied to a diagonal cell order.
function xSumRay(cells, total) {
  const branches = [];
  for (let i = 1; i <= cells.length; i++) {
    const rem = total - i;
    if (rem < 0) break;
    branches.push(new And([
      new Given(cells[0], i),
      new Sum(rem, ...cells.slice(1, i)),
    ]));
  }
  return new Or(branches);
}

// Diagonal rays, nearest-to-badge cell first. Transcribed from each outside
// badge and the diagonal it sits against.
const rays = [
  [3, ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9']],
  [12, ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9']],
  [5, ['R4C1', 'R3C2', 'R2C3', 'R1C4']],
  [27, ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7']],
  [22, ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9']],
  [28, ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9']],
  [14, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  [11, ['R3C9', 'R2C8', 'R1C7']],
  [22, ['R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3']],
  [19, ['R9C7', 'R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2', 'R3C1']],
];

// Cages: cells + total, transcribed from the drawn cage outlines.
const cages = [
  [3, ['R8C5', 'R8C6']],
  [9, ['R7C4', 'R8C4']],
  [23, ['R9C4', 'R9C5', 'R9C6']],
  [23, ['R5C2', 'R6C2', 'R6C3']],
  [24, ['R1C9', 'R2C9', 'R2C8']],
  [14, ['R4C8', 'R4C9']],
  [3, ['R9C8', 'R9C9']],
];

return [
  new Shape('9x9'),

  ...rays.map(([total, cells]) => xSumRay(cells, total)),

  ...cages.map(([total, cells]) => new Sum(total, ...cells)),

  new Thermo('R4C2', 'R3C2', 'R2C2', 'R1C2', 'R2C3', 'R3C4'),
  new Thermo('R6C8', 'R6C7', 'R7C6', 'R6C6', 'R5C6'),
  new Thermo('R5C1', 'R6C1', 'R7C1', 'R8C2', 'R8C1'),
];
