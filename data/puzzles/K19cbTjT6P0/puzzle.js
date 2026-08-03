// Title: Colorado 8
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=K19cbTjT6P0
// Source: https://app.crackingthecryptic.com/sudoku/GhDbrNPh8h

// Normal sudoku rules apply. Adjacent cells joined by a drawn "X" sum to 10
// (X), and by a drawn "V" sum to 5 (V). The rules state not every such pair
// is marked, so no negative constraint applies to unmarked adjacent pairs --
// only the drawn edges are encoded.
//
// The clue below column 5 is self-referential (XSum): letting X be the
// digit in R9C5 (the cell nearest the clue), the clue is the sum of the
// nearest X cells of the column, counted from R9C5 upward.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// X-marked edges (sum to 10). One pair per drawn "X" mark on the board.
const xPairs = [
  ['R1C1', 'R1C2'],
  ['R1C3', 'R2C3'],
  ['R1C7', 'R2C7'],
  ['R2C6', 'R3C6'],
  ['R3C5', 'R4C5'],
  ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8'],
  ['R3C8', 'R3C9'],
  ['R5C2', 'R6C2'],
  ['R6C3', 'R7C3'],
  ['R7C4', 'R8C4'],
  ['R8C5', 'R8C6'],
  ['R8C8', 'R9C8'],
  ['R6C9', 'R7C9'],
  ['R6C8', 'R6C9'],
];

// V-marked edges (sum to 5). One pair per drawn "V" mark on the board.
const vPairs = [
  ['R1C3', 'R1C4'],
  ['R1C9', 'R2C9'],
  ['R3C5', 'R3C6'],
  ['R3C1', 'R4C1'],
  ['R4C1', 'R4C2'],
  ['R4C4', 'R5C4'],
  ['R5C5', 'R5C6'],
  ['R6C7', 'R6C8'],
  ['R6C1', 'R6C2'],
  ['R7C3', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  // Outside clue "37" below column 5: nearest cell is R9C5, read upward.
  XSum.fromCells(37, graph.ray('R9C5', -1, 0), geometry),
];
