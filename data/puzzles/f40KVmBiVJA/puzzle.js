// Title: Kropki Matrix
// Author: Blobz
// Video: https://www.youtube.com/watch?v=f40KVmBiVJA
// Source: https://sudokupad.app/blobz/kropki-matrix
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes -- the
// payload's nine regions match the default box layout exactly). Black dots
// separate digits where one is double the other (no negative constraint:
// undotted pairs are unconstrained). In cages, digits do not repeat and sum
// to the given total.

// Nine black Kropki dots, each on a vertical edge between two cells in the
// same column, arranged as a 3x3 matrix of dots (the puzzle's namesake).
const blackDots = [
  ['R2C3', 'R3C3'], ['R2C5', 'R3C5'], ['R2C7', 'R3C7'],
  ['R5C3', 'R6C3'], ['R5C5', 'R6C5'], ['R5C7', 'R6C7'],
  ['R8C3', 'R9C3'], ['R8C5', 'R9C5'], ['R8C7', 'R9C7'],
].map(cells => new BlackDot(...cells));

// Nine killer cages: distinct digits summing to the given total.
const cages = [
  [22, 'R3C1', 'R4C1', 'R5C1'],
  [22, 'R3C9', 'R4C9', 'R5C9'],
  [22, 'R8C1', 'R9C1', 'R9C2'],
  [22, 'R8C8', 'R9C8', 'R9C9'],
  [8, 'R5C2', 'R6C2', 'R7C2'],
  [8, 'R3C8', 'R4C8', 'R5C8'],
  [8, 'R3C5', 'R3C6', 'R4C6'],
  [5, 'R9C5', 'R9C6'],
  [17, 'R6C5', 'R6C6'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...blackDots,
  ...cages,
];
