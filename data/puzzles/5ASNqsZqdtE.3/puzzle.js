// Title: First Impression
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=5ASNqsZqdtE
// Source: https://tinyurl.com/2a3w5ude

// Normal sudoku rules (default row/column/box groups from Shape).
// A digit in a grey cell must be greater than both the first cell of its
// row (column 1) and the first cell of its column (row 1). None of the
// grey cells lie in row 1 or column 1, so every grey cell has a distinct
// row-first and column-first cell to compare against.

const givens = {
  R1C1: 9, R2C5: 5, R2C8: 1, R3C4: 3, R4C3: 4, R5C2: 2,
  R5C8: 9, R6C7: 8, R7C6: 7, R8C2: 3, R8C5: 6, R9C9: 1,
};

// Grey cells, transcribed from the puzzle's per-cell grey shading.
const greyCells = [
  'R2C3', 'R2C5', 'R3C2', 'R3C4', 'R3C7', 'R4C3', 'R4C6', 'R5C2', 'R5C5',
  'R5C8', 'R6C4', 'R6C7', 'R7C3', 'R7C6', 'R7C8', 'R8C5', 'R8C7',
];

// a > b, over the 1-9 value range.
const greaterThanKey = Pair.fnToKey((a, b) => a > b, 9);

const firstImpressionPairs = greyCells.flatMap(cellId => {
  const { row, col } = parseCellId(cellId);
  const rowFirst = makeCellId(row, 1);
  const colFirst = makeCellId(1, col);
  return [
    new Pair(greaterThanKey, 'grey > row-first', cellId, rowFirst),
    new Pair(greaterThanKey, 'grey > col-first', cellId, colFirst),
  ];
});

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, v]) => new Given(cell, v)),
  ...firstImpressionPairs,
];
