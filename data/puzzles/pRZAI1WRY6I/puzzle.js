// Surrounded by oddness by Jonesy
// https://sudokupad.app/sxsm_Jonesy_2f6c172993418e41c32c837e410402ed
// https://www.youtube.com/watch?v=pRZAI1WRY6I
//
// Rules:
// Normal Sudoku rules apply.
// Orthogonally adjacent cells may not both contain even digits.
// Digits along an arrow sum to the digit in its circle.

const arrows = [
  ['R6C5', 'R5C4', 'R5C5', 'R5C6'],
  ['R4C6', 'R4C7', 'R3C7', 'R3C8'],
  ['R4C4', 'R4C3', 'R3C3', 'R3C2'],
  ['R9C1', 'R8C1', 'R8C2', 'R8C3'],
  ['R9C9', 'R8C8', 'R7C7'],
  ['R6C7', 'R6C6', 'R7C6'],
];

const graph = cellGraph();

// Every orthogonally-adjacent pair, once: the horizontal and vertical dominoes
// starting at each cell.
const dominoes = graph.cells()
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(domino => domino !== null);

const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);

return [
  ...arrows.map(cells => new Arrow(...cells)),
  ...dominoes.map(domino => new Pair(notBothEven, '', ...domino)),
];
