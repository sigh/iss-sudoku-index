// Title: One-Fog-Nine
// Author: Meggen033
// Video: https://www.youtube.com/watch?v=7_qbk2klar8
// Source: https://sudokupad.app/wyqe8cjb01

// Normal Sudoku rules apply. Column-1, column-5, and column-9 digits index
// the 1, 5, and 9 respectively in their own row. Killer cages have distinct
// digits summing to their printed totals. Black dots are 2:1 ratios, with all
// all black dots shown. Fog/reveal presentation is omitted as UI-only.
const column = col => Array.from({length: 9}, (_, row) => makeCellId(row + 1, col));

// Cage cells and totals transcribed from the drawn killer cages.
const cages = [
  [9, 'R4C2', 'R4C3'],
  [7, 'R7C3', 'R7C4'],
  [9, 'R8C1', 'R9C1'],
  [7, 'R8C9', 'R9C9'],
  [11, 'R8C3', 'R8C4'],
];

// Each pair is a drawn black dot.
const blackDots = [
  ['R5C2', 'R5C1'], ['R7C4', 'R7C5'], ['R3C2', 'R4C2'],
  ['R2C3', 'R2C2'], ['R1C6', 'R1C5'], ['R3C9', 'R3C8'],
  ['R6C4', 'R5C4'], ['R6C3', 'R6C4'], ['R9C7', 'R9C8'],
  ['R5C8', 'R4C8'],
];

// "All black dots are shown" excludes only unmarked 2:1 ratios, not
// unmarked consecutive pairs. The remaining orthogonal edges come from the grid
// geometry after removing the drawn-dot pairs.
const edgeKey = ([a, b]) => [a, b].sort().join('-');
const blackDotKeys = new Set(blackDots.map(edgeKey));
const graph = cellGraph('9x9');
const horizontalStarts = Array.from({length: 9}, (_, row) =>
  Array.from({length: 8}, (_, col) => [
    makeCellId(row + 1, col + 1), makeCellId(row + 1, col + 2),
  ])).flat().filter(edge => !blackDotKeys.has(edgeKey(edge))).map(edge => edge[0]);
const verticalStarts = Array.from({length: 8}, (_, row) =>
  Array.from({length: 9}, (_, col) => [
    makeCellId(row + 1, col + 1), makeCellId(row + 2, col + 1),
  ])).flat().filter(edge => !blackDotKeys.has(edgeKey(edge))).map(edge => edge[0]);
const noBlackDot = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);

return [
  new Shape('9x9'),
  new Indexing('C', ...column(1)),
  new Indexing('C', ...column(5)),
  new Indexing('C', ...column(9)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  graph.makeReplicate(
    new Pair(noBlackDot, 'no black dot', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(noBlackDot, 'no black dot', 'R1C1', 'R2C1'), verticalStarts),
];
