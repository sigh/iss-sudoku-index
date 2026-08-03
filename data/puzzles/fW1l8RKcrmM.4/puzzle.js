// Title: Apr. 24, 2023: The Phisto King
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=fW1l8RKcrmM
// Source: https://tinyurl.com/3t27zjw7

// Normal sudoku rules apply.
// Pro-King: grey cells must diagonally (king-move) touch at least one other
// cell holding the same digit. This is an existential match, not a negative
// constraint -- it does not forbid any other diagonal repeat. Encoded as one
// Or(...) per grey cell, over a SameValues(2, cell, neighbour) alternative
// for each of its diagonal neighbours.

const givens = [
  ['R1C1', 5], ['R1C6', 1], ['R1C9', 8],
  ['R3C3', 1], ['R3C4', 2], ['R3C5', 3], ['R3C6', 4], ['R3C7', 5],
  ['R4C3', 2], ['R4C7', 6],
  ['R5C3', 3], ['R5C7', 7],
  ['R6C3', 4], ['R6C7', 8],
  ['R7C3', 5], ['R7C4', 6], ['R7C5', 7], ['R7C6', 8], ['R7C7', 9],
  ['R9C1', 2], ['R9C4', 9], ['R9C9', 5],
];

// Grey cells (drawn #A8A8A8): every cell on the border of the R3-R7 x C3-C7
// block, i.e. that 5x5 block minus its inner 3x3 (R4-R6 x C4-C6).
const graph = cellGraph('9x9');
const greyCells = [];
for (let r = 3; r <= 7; r++) {
  for (let c = 3; c <= 7; c++) {
    if (r === 3 || r === 7 || c === 3 || c === 7) greyCells.push(makeCellId(r, c));
  }
}

// step() returns null past the grid edge; every diagonal neighbour of a grey
// cell falls inside this 9x9 grid, but the filter is kept so this still holds
// if the ring ever moved nearer an edge.
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const greyDiagonalMatches = greyCells.map(cell => new Or(
  DIAGONALS
    .map(([dr, dc]) => graph.step(cell, dr, dc))
    .filter(diag => diag != null)
    .map(diag => new SameValues(2, cell, diag))));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...greyDiagonalMatches,
];
