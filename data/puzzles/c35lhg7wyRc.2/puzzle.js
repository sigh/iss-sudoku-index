// Title: Revolution
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=c35lhg7wyRc
// Source: https://app.crackingthecryptic.com/sudoku/8jGgTPfJgd

// Normal sudoku rules apply (standard 3x3 boxes, default row/column/box
// all-different): Shape('9x9') plus the givens below.
// "Identical digits cannot be diagonally adjacent", encoded as a two-cell
// AllDifferent per diagonally-adjacent edge (both diagonal directions),
// stamped with one Replicate per diagonal offset to shorten the encoding.
// AntiKing would express the same thing: its extra orthogonal king-move
// pairs already share a row or column, so normal sudoku forbids them anyway
// and the addition is vacuous. This spelling states only the drawn rule.

const graph = cellGraph('9x9');

const diagonalNonRepeat = [[1, 1], [1, -1]].flatMap(([dR, dC]) => {
  const starts = graph.cells().filter(cell => graph.step(cell, dR, dC));
  const origin = starts[0];
  const target = graph.step(origin, dR, dC);
  return new Replicate(
    [new AllDifferent(origin, target)],
    Replicate.encodeTargetCells(starts, origin, graph),
    origin,
  );
});

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle grid.
  new Given('R1C7', 2), new Given('R1C9', 7),
  new Given('R2C3', 3), new Given('R2C6', 9),
  new Given('R3C1', 8), new Given('R3C8', 5),
  new Given('R4C4', 1), new Given('R4C5', 2), new Given('R4C6', 3),
  new Given('R5C4', 8), new Given('R5C6', 4),
  new Given('R6C4', 7), new Given('R6C5', 6), new Given('R6C6', 5),
  new Given('R7C2', 1), new Given('R7C9', 4),
  new Given('R8C4', 9), new Given('R8C7', 7),
  new Given('R9C1', 3), new Given('R9C3', 6),

  ...diagonalNonRepeat,
];
