// Title: Carpets Sudoku
// Author: Jacki
// Video: https://www.youtube.com/watch?v=FzQA6WiwsAs
// Source: https://cracking-the-cryptic.web.app/sudoku/3dfPdhdfLg

// Normal sudoku rules apply. Six spiral "carpet" lines are drawn (one each
// in the top-left, top-middle, top-right, middle-right, bottom-right and
// bottom-left boxes); the rules state each can "unroll along the edge it is
// against, so that the digits on it will be the same." Two other CTC
// "carpet" puzzles use the identical mechanic with a worked example
// spelling out the reading: unroll = start at the spiral's outer-corner
// cell and continue straight in the direction of its own second cell for 9
// cells, which reproduces a full row or column, holding the same digits in
// the same order as the spiral. The opposite direction runs off the grid
// for every spiral here, so the outer corner is each spiral's only
// possible start. Each spiral's first 1-3 cells already lie on its own
// target line (same cell, no constraint needed); the remaining positions
// pair a spiral cell with a different target cell.
const spirals = [
  ['R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2'], // top-left
  ['R1C6', 'R2C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R2C5'], // top-middle
  ['R3C9', 'R3C8', 'R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'], // top-right
  ['R6C9', 'R6C8', 'R6C7', 'R5C7', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R5C8'], // middle-right
  ['R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C8'], // bottom-right
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R8C2'], // bottom-left
];

const unrollPairs = spirals.flatMap(spiral => {
  const start = parseCellId(spiral[0]);
  const next = parseCellId(spiral[1]);
  const dr = next.row - start.row;
  const dc = next.col - start.col;
  const straight = spiral.map((_, k) =>
    makeCellId(start.row + dr * k, start.col + dc * k));
  return spiral
    .map((cell, k) => [cell, straight[k]])
    .filter(([a, b]) => a !== b);
});

const unroll = unrollPairs.map(([a, b]) => new SameValues(2, a, b));

return [
  new Shape('9x9'),

  new Given('R4C4', 1), new Given('R4C5', 2), new Given('R4C6', 3),
  new Given('R5C4', 8),                       new Given('R5C6', 4),
  new Given('R6C4', 7), new Given('R6C5', 6), new Given('R6C6', 5),

  ...unroll,
];
