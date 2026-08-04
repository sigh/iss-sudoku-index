// Title: Jan. 30, 2023: Pirate Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=wq0uqMK6c34
// Source: https://tinyurl.com/4b4ycysp

// Normal sudoku rules apply. Each 5 in the grid is orthogonally adjacent only
// to low (1-4) digits; a 5 is never orthogonally adjacent to a high (6-9)
// digit. Two 5s may still sit next to each other -- the rule only restricts
// high digits, and 5 is itself neither high nor low.

const graph = cellGraph('9x9');
const gridCells = graph.cells();

// Givens, transcribed from the payload's grid cell values.
const givens = {
  R1C2: 5, R1C7: 9, R1C9: 2,
  R3C1: 1, R3C3: 7, R3C8: 5,
  R4C2: 6, R4C6: 2,
  R6C4: 5, R6C7: 6, R6C9: 8,
  R7C1: 5, R7C3: 6, R7C8: 8,
  R9C2: 3, R9C7: 5, R9C9: 4,
};

// Adjacency rule: a cell pair is rejected iff one side is 5 and the other is
// 6-9. Symmetric in (a, b) since the pair's cell order is arbitrary.
const noFiveNextToHigh = Pair.fnToKey(
  (a, b) => !((a === 5 && b >= 6) || (b === 5 && a >= 6)), 9);

// One Pair template per edge direction (rightward, downward), stamped over
// every cell that has that neighbour via Replicate -- the 144 edges are two
// shifted copies of one 2-cell template anchored at R1C1, not 144 distinct
// shapes. graph.makeReplicate() anchors the template at graph.cells()[0]
// (R1C1), which has both a right and a down neighbour, so it doubles as the
// template origin for each direction.
const origin = gridCells[0];
const rightStarts = gridCells.filter(cell => graph.step(cell, 0, 1) !== null);
const downStarts = gridCells.filter(cell => graph.step(cell, 1, 0) !== null);

const adjacencyPairs = [
  graph.makeReplicate(
    new Pair(noFiveNextToHigh, 'five-adjacency', origin, graph.step(origin, 0, 1)),
    rightStarts,
  ),
  graph.makeReplicate(
    new Pair(noFiveNextToHigh, 'five-adjacency', origin, graph.step(origin, 1, 0)),
    downStarts,
  ),
];

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...adjacencyPairs,
];
