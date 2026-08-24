// Title: Flower Sudoku
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=NymqLridhgg
// Source: https://app.crackingthecryptic.com/sudoku/jjb2D9jnLf

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). For each red "flower" cell, the sum of its orthogonal neighbours
// (repeats allowed) equals the clue value plus the cell's own digit, i.e.
// clue = (sum of orthogonal neighbours) - (own digit). A clue of 0 (R1C2) is
// exactly "neighbours sum equals the cell", so that one is EqualSum over the
// two segments; every other clue carries a nonzero constant offset that
// EqualSum cannot express, so those use a coefficient Sum (neighbours at
// coefficient 1, the cell itself at coefficient -1, equal to the clue).
const graph = cellGraph('9x9');

// Flower cell -> clue value, transcribed from the co-located red-filled
// cell and its printed number.
const flowerClues = [
  ['R1C1', 14],
  ['R1C2', 0],
  ['R2C8', 16],
  ['R3C7', 2],
  ['R4C2', 30],
  ['R4C6', -2],
  ['R7C7', 24],
  ['R8C2', 3],
  ['R8C6', 4],
];

const flowerConstraints = flowerClues.map(([cell, clue]) => {
  const neighbours = graph.neighbours(cell);
  return clue === 0
    ? new EqualSum(neighbours, [cell])
    : new Sum(clue, ...neighbours, [cell, -1]);
});

return [
  new Shape('9x9'),
  ...flowerConstraints,
];
