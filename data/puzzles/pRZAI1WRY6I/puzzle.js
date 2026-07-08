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

// Every orthogonally-adjacent pair, once: replicated horizontal and vertical
// templates starting at each valid cell.
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));

const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);

return [
  ...arrows.map(cells => new Arrow(...cells)),
  new Replicate([new Pair(notBothEven, '', 'R1C1', 'R1C2')],
    Replicate.encodeTargetCells(horizontalStarts, 'R1C1', graph), 'R1C1'),
  new Replicate([new Pair(notBothEven, '', 'R1C1', 'R2C1')],
    Replicate.encodeTargetCells(verticalStarts, 'R1C1', graph), 'R1C1'),
];
