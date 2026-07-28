// Title: That's 3 in the Corner
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=x6RrwaOb0Iw
// Source: https://sudokupad.app/dk0wreok2y

// Normal Sudoku rules apply. Orthogonally adjacent cells within each 3x3 box
// differ by at least 3. One undrawn eight-cell arrow starts in box 1 and ends
// in box 9; its shaft sums to its one-cell circle.
const atLeastThreeApart = Pair.fnToKey((a, b) => Math.abs(a - b) >= 3, 9);
const graph = cellGraph('9x9');

// The horizontal and vertical edges of the drawn standard box 1; replicate
// these edges to the top-left cell of every standard box.
const boxOne = graph.box(1);
const boxOneEdges = boxOne.flatMap(cell =>
  [[cell, graph.step(cell, 0, 1)], [cell, graph.step(cell, 1, 0)]]
    .filter(([, neighbour]) => neighbour !== null && boxOne.includes(neighbour)));
const boxDifferenceRule = graph.makeReplicate(
  boxOneEdges.map(cells =>
    new Pair(atLeastThreeApart, 'difference at least 3', ...cells)),
  graph.boxes().map(box => box[0]),
);

// An eight-cell straight route from box 1 to box 9 can start at either R1/R2
// and C1/C2; the arrow rule requires at least one of those four routes.
const candidateArrows = ['R1C1', 'R1C2', 'R2C1', 'R2C2']
  .map(start => new Arrow(...graph.ray(start, 1, 1).slice(0, 8)));

return [
  new Shape('9x9'),
  new Given('R9C1', 3),
  boxDifferenceRule,
  new Or(candidateArrows),
];
