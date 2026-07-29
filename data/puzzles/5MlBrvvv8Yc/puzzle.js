// Title: Euclidean Windmill
// Author: Botaku
// Video: https://www.youtube.com/watch?v=5MlBrvvv8Yc
// Source: https://sudokupad.app/r433rBpLPG

// Normal Sudoku rules apply. For equal digits N at horizontal and vertical
// separations X and Y, X*X + Y*Y must be at least N. The offsets below are the
// only cell pairs with squared distance below 9; farther pairs satisfy every N.
const graph = cellGraph('9x9');
const spacingTemplates = [
  [0, 0, 0, 1, 1], [0, 0, 1, 0, 1],
  [0, 0, 1, 1, 2], [1, 0, 0, 1, 2],
  [0, 0, 0, 2, 4], [0, 0, 2, 0, 4],
  [0, 0, 1, 2, 5], [1, 0, 0, 2, 5], [0, 0, 2, 1, 5], [2, 0, 0, 1, 5],
  [0, 0, 2, 2, 8], [2, 0, 0, 2, 8],
];
const spacingKeys = Object.fromEntries(
  [1, 2, 4, 5, 8].map(distanceSquared => [
    distanceSquared,
    Pair.fnToKey((a, b) => a !== b || a <= distanceSquared, 9),
  ])
);
const euclideanSpacing = spacingTemplates.map(([rowA, colA, rowB, colB, distanceSquared]) => {
  const templateOrigin = 'R1C1';
  const targets = graph.cells().filter(cell =>
    graph.step(cell, Math.max(rowA, rowB), Math.max(colA, colB))
  );
  // Each Replicate stamps one relative cell-pair offset wherever both cells fit.
  return graph.makeReplicate(
    new Pair(
      spacingKeys[distanceSquared],
      'Euclidean spacing',
      graph.step(templateOrigin, rowA, colA),
      graph.step(templateOrigin, rowB, colB),
    ),
    targets,
  );
});

return [
  new Shape('9x9'),
  // Givens transcribed from the source grid.
  new Given('R1C2', 6), new Given('R2C3', 7), new Given('R2C9', 3),
  new Given('R3C4', 8), new Given('R3C8', 6), new Given('R4C7', 2),
  new Given('R6C3', 4), new Given('R7C2', 7), new Given('R7C6', 5),
  new Given('R8C1', 6), new Given('R8C7', 4), new Given('R9C8', 3),
  ...euclideanSpacing,
];
