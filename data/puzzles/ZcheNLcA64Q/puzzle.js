// Title: Point of View
// Author: Nordy
// Video: https://www.youtube.com/watch?v=ZcheNLcA64Q
// Source: https://app.crackingthecryptic.com/TrgbQfmrtH

// Rules encoded here, in full; nothing is omitted. The grid has no givens.
//   Normal sudoku rules apply.
//   Digits along each blue line have an equal sum N within each box the line
//     passes through. Different lines may have different sums.
//   Digits joined by a white dot are consecutive.
//   Digits joined by a black dot are in a ratio of 2:1.
//   Along the marked diagonal, digits cannot repeat.

// Traced from the six thick blue strokes, each of which is a closed square
// outline: two small squares drawn around a grid vertex (4 cells each) and four
// larger squares drawn around a centre cell (8 cells each). Listed in the order
// the stroke walks them, beginning at the corner the stroke starts from.
const blueLoops = [
  ['R2C6', 'R2C7', 'R3C7', 'R3C6'],
  ['R7C3', 'R7C4', 'R8C4', 'R8C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R5C3', 'R4C3'],
  ['R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R5C6', 'R5C5', 'R4C5'],
  ['R5C3', 'R5C4', 'R5C5', 'R6C5', 'R7C5', 'R7C4', 'R7C3', 'R6C3'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R6C5'],
];

const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return ((row - 1) / 3 | 0) * 3 + ((col - 1) / 3 | 0);
};

// A closed loop has no first cell, so the digits it places in a box form a
// single cyclic run and the rule equates one sum per box visited.
// RegionSumLine partitions its argument list by walking it in order, so each
// loop is rotated until its first and last cells lie in different boxes; every
// cyclic run is then contiguous within the list. Treating the drawn starting
// corner as a split point instead is unsatisfiable: on the R2C6 loop it would
// make {R2C6} and {R3C6, R2C6} two box-2 runs of equal sum, forcing R3C6 = 0.
const rotateToBoxChange = (loop) => {
  for (let i = 0; i < loop.length; i++) {
    const rotated = loop.slice(i).concat(loop.slice(0, i));
    if (boxOf(rotated[0]) !== boxOf(rotated[rotated.length - 1])) return rotated;
  }
  throw new Error('loop stays within one box: ' + loop.join(','));
};

return [
  new Shape('9x9'),

  // Thin blue stroke drawn corner to corner, from R9C1 up to R1C9.
  new Diagonal(1),

  ...blueLoops.map(loop => new RegionSumLine(...rotateToBoxChange(loop))),

  // Edge dots on the central column: white between R1C5/R2C5, black between
  // R8C5/R9C5.
  new WhiteDot('R1C5', 'R2C5'),
  new BlackDot('R8C5', 'R9C5'),
];
