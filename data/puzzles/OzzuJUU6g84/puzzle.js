// Title: Miracle Of Eleven
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=OzzuJUU6g84
// Source: https://sudokupad.app/z44mcyjr8y

// Normal Sudoku rules apply. Orthogonal neighbours are non-consecutive.
// Southwest-to-northeast diagonal neighbours have a sum of at most 11.
const graph = cellGraph();
const positiveDiagonalStarts = graph.cells().filter(
  cell => graph.step(cell, 1, 1));
const atMostEleven = Pair.fnToKey((a, b) => a + b <= 11, 9);
const positiveDiagonalRule = graph.makeReplicate(
  new Pair(atMostEleven, 'sum at most 11', 'R1C2', 'R2C1'),
  positiveDiagonalStarts);

return [
  new Given('R4C5', 3),
  new Given('R6C5', 8),
  new AntiConsecutive(),
  positiveDiagonalRule,
];
