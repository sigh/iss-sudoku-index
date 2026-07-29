// Title: Mad 4 Diagonalz
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=AA8IY4sNSuw
// Source: https://sudokupad.app/pblc50fmga

// Normal Sudoku rules apply. Square-marked cells contain even digits.
// Of the even digits, only 4 may repeat anywhere along a diagonal. Thus each
// diagonal pair rejects equal 2s, 6s, and 8s, while equal odd digits and 4s pass.

const givens = [
  ['R1C4', 7], ['R1C6', 5], ['R1C9', 4], ['R2C1', 1], ['R3C9', 7],
  ['R4C1', 3], ['R4C7', 7], ['R5C1', 5], ['R5C6', 7], ['R6C1', 7],
  ['R7C4', 1], ['R7C6', 6], ['R7C9', 2], ['R8C4', 4], ['R8C8', 7],
];

// Square fills from the drawn underlays.
const evenSquares = [
  'R1C2', 'R1C5', 'R3C3', 'R3C4', 'R5C5', 'R6C8', 'R8C2', 'R8C9',
];

const graph = cellGraph('9x9');
const noRepeatedNonFourEven = Pair.fnToKey(
  (a, b) => a !== b || a % 2 !== 0 || a === 4, 9);

// For every diagonal separation and slope, replicate the two-cell relation at
// each origin where the second cell remains in the grid. The down-left template
// begins at its top-right cell, so its Replicate origin moves with its length.
const diagonalPairs = Array.from({ length: 8 }, (_, i) => i + 1).flatMap(distance => {
  const downRightOrigins = graph.cells().filter(cell => graph.step(cell, distance, distance));
  const downLeftOrigins = graph.cells().filter(cell => graph.step(cell, distance, -distance));
  const downLeftOrigin = makeCellId(1, 1 + distance);
  return [
    graph.makeReplicate(
      new Pair(noRepeatedNonFourEven, 'diagonal even repeat',
        'R1C1', makeCellId(1 + distance, 1 + distance)),
      downRightOrigins),
    // lint-ok: bare-replicate-constructor
    new Replicate(
      [new Pair(noRepeatedNonFourEven, 'diagonal even repeat',
        downLeftOrigin, makeCellId(1 + distance, 1))],
      Replicate.encodeTargetCells(downLeftOrigins, downLeftOrigin, graph),
      downLeftOrigin),
  ];
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...evenSquares.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...diagonalPairs,
];
