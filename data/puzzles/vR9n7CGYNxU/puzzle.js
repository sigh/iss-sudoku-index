// Title: Inner Circles
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=vR9n7CGYNxU
// Source: https://sudokupad.app/912ee99op9

// Normal Sudoku with the three givens. Each coloured dot relates its cell to
// some orthogonal neighbour. On an edge between two dot-free cells, none of
// the three dot relations may hold: all possible dots are shown, but a dotted
// cell with multiple possible relations displays only one of them.
const blackDots = ['R6C2', 'R6C3', 'R7C4', 'R7C5', 'R7C8', 'R8C5', 'R8C8', 'R9C5'];
const whiteDots = ['R3C6', 'R4C6', 'R5C5', 'R5C6', 'R7C3', 'R8C4', 'R9C8'];
const greyDots = ['R9C4'];
const dottedCells = new Set([...blackDots, ...whiteDots, ...greyDots]);
const graph = cellGraph('9x9');
const twoToOne = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const noDotRelation = Pair.fnToKey(
  (a, b) => !(a === 2 * b || b === 2 * a || Math.abs(a - b) === 1 || a + b === 5),
  9,
);

// Dot locations are transcribed from the black, white, and grey circles.
const dotConstraints = (cells, Constraint) => cells.map(cell => new Or(
  graph.neighbours(cell).map(neighbour => new Constraint(cell, neighbour))
));
const horizontalStarts = [];
const verticalStarts = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const cell = makeCellId(row, col);
    if (col < 9 && !dottedCells.has(cell) && !dottedCells.has(makeCellId(row, col + 1))) {
      horizontalStarts.push(cell);
    }
    if (row < 9 && !dottedCells.has(cell) && !dottedCells.has(makeCellId(row + 1, col))) {
      verticalStarts.push(cell);
    }
  }
}
// The two templates cover every horizontal or vertical dot-free edge.
const noDotConstraints = [
  graph.makeReplicate(
    [new Pair(noDotRelation, 'no dot relation', 'R1C1', 'R1C2')],
    horizontalStarts,
  ),
  graph.makeReplicate(
    [new Pair(noDotRelation, 'no dot relation', 'R1C1', 'R2C1')],
    verticalStarts,
  ),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 7),
  new Given('R2C3', 9),
  new Given('R4C7', 6),
  ...dotConstraints(blackDots, BlackDot),
  ...dotConstraints(whiteDots, WhiteDot),
  ...dotConstraints(greyDots, V),
  ...noDotConstraints,
];
