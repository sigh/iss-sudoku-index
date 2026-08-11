// Title: Cave Panem
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=p-nRIDd0wBI
// Source: https://app.crackingthecryptic.com/sudoku/7pLTpF6tpP

// Normal sudoku rules apply. Seven outside clues are Sandwich sums (digits
// strictly between the 1 and the 9 in that row/column). Every orthogonally
// adjacent pair of cells must not sum to 5 or to 10.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

const sandwiches = [
  Sandwich.fromCells(3, graph.row(1), geometry),
  Sandwich.fromCells(25, graph.row(5), geometry),
  Sandwich.fromCells(10, graph.column(2), geometry),
  Sandwich.fromCells(10, graph.column(3), geometry),
  Sandwich.fromCells(19, graph.column(5), geometry),
  Sandwich.fromCells(10, graph.column(8), geometry),
  Sandwich.fromCells(10, graph.column(9), geometry),
]; // Transcribed from the seven drawn outside-clue overlays.

// Every orthogonal edge of the grid (rightward and downward, which together
// cover each adjacent pair once), replicated from one template edge per
// direction rather than instantiated by hand.
const allCells = graph.cells();
const notFiveOrTenKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const rightAnchors = allCells.filter(cell => graph.step(cell, 0, 1) !== null);
const rightEdges = graph.makeReplicate(
  new Pair(notFiveOrTenKey, 'adjacent cells do not sum to 5 or 10',
    'R1C1', graph.step('R1C1', 0, 1)),
  rightAnchors,
);
const downAnchors = allCells.filter(cell => graph.step(cell, 1, 0) !== null);
const downEdges = graph.makeReplicate(
  new Pair(notFiveOrTenKey, 'adjacent cells do not sum to 5 or 10',
    'R1C1', graph.step('R1C1', 1, 0)),
  downAnchors,
);

return [
  shape,
  ...sandwiches,
  rightEdges,
  downEdges,
];
