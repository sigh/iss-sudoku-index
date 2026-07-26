// Title: Into the blue
// Author: 28 degrees
// Video: https://www.youtube.com/watch?v=8_tgUC-4-0U
// Source: https://sudokupad.app/0tiit8lofl

// Normal sudoku rules apply. No given digits.
//
// Region sum lines: box borders divide each blue line into segments with an
// equal sum. RegionSumLine enforces this per line, splitting at box borders
// on its own. Cell paths below are transcribed from the drawn line data.
//
// Global indexing: along each row, a digit X in column Y means digit Y (in
// that row) appears in column X. Indexing('C', ...cells) instantiates this
// relation once per grid cell: for cell (R,C) with value V, cell (R,V) has
// value C -- exactly the stated rule with C=Y, V=X. Passing every grid cell
// as a control cell covers the relation for every row and column.

const regionSumLines = [
  ['R2C4', 'R3C5', 'R4C6', 'R5C5'],
  ['R4C4', 'R5C4', 'R5C3', 'R6C3', 'R7C3', 'R7C2'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8'],
].map(cells => new RegionSumLine(...cells));

const globalIndexing = new Indexing('C', ...cellGraph('9x9').cells());

return [
  new Shape('9x9'),
  ...regionSumLines,
  globalIndexing,
];
