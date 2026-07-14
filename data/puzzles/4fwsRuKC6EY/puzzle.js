// Title: Simple Miracle
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=4fwsRuKC6EY
// Source: https://sudokupad.app/mgfzel558v

// Normal Sudoku. Equal digits may not be a knight's move apart. Neighbours on
// every south-west to north-east diagonal differ by 1 or 8.

// Difference 8 is possible only for the pair 1 and 9, so this is cyclic
// consecutiveness over the digits 1-9.
const cyclicConsecutive = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || Math.abs(a - b) === 8,
  9,
);

const graph = cellGraph('9x9');
const positiveDiagonals = [
  ...graph.column(1).slice(1).map(cell => graph.ray(cell, -1, 1)),
  ...graph.row(9).slice(1, -1).map(cell => graph.ray(cell, -1, 1)),
];

return [
  new Shape('9x9'),
  new Given('R8C2', 1),
  new Given('R9C6', 2),
  new AntiKnight(),
  ...positiveDiagonals.map(cells => new Pair(
    cyclicConsecutive,
    'cyclic-consecutive-positive-diagonal',
    ...cells,
  )),
];
