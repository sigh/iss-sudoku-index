// Title: Jul 25, 2022: Pirate Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=S38_J6HNu58
// Source: https://tinyurl.com/mr3mmjfz

// Normal sudoku rules apply (default rows/cols/boxes). The digit 5 may be
// orthogonally adjacent only to digits less than 5: for every adjacent pair
// where either cell is 5, the other cell must be 1-4 -- so two 5s may not be
// orthogonally adjacent either, since neither is less than 5.

// Givens, transcribed from the drawn grid.
const givens = [
  ['R1C7', 2], ['R1C8', 1],
  ['R2C1', 6], ['R2C2', 7], ['R2C8', 3], ['R2C9', 4],
  ['R3C2', 1], ['R3C3', 5],
  ['R4C7', 1],
  ['R5C5', 5],
  ['R6C3', 1],
  ['R7C7', 5], ['R7C8', 2],
  ['R8C1', 2], ['R8C2', 8], ['R8C8', 6], ['R8C9', 7],
  ['R9C2', 4], ['R9C3', 3],
];

// Every orthogonal edge of the grid, covered by two Replicate groups: the
// rightward-neighbour template shifted onto every cell with a cell to its
// right, and the downward-neighbour template shifted onto every cell with a
// cell below it (block() returns null past the grid edge, so the boundary
// cells drop out of each start list).
const graph = cellGraph('9x9');
const rightStarts = graph.cells().filter(cell => graph.block(cell, 1, 2));
const downStarts = graph.cells().filter(cell => graph.block(cell, 2, 1));

const pirateKey = Pair.fnToKey(
  (a, b) => (a !== 5 || b < 5) && (b !== 5 || a < 5), 9);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Replicate(
    [new Pair(pirateKey, 'pirate', rightStarts[0], graph.step(rightStarts[0], 0, 1))],
    Replicate.encodeTargetCells(rightStarts, rightStarts[0], graph),
    rightStarts[0],
  ),
  new Replicate(
    [new Pair(pirateKey, 'pirate', downStarts[0], graph.step(downStarts[0], 1, 0))],
    Replicate.encodeTargetCells(downStarts, downStarts[0], graph),
    downStarts[0],
  ),
];
