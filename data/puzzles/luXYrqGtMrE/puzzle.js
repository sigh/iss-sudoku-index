// Title: What's Between the Little Grey Cells?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=luXYrqGtMrE
// Source: https://cracking-the-cryptic.web.app/sudoku/MqD8qJNqJm

// Normal sudoku rules (default 9x9 with default 3x3 boxes).
// "Cells separating grey cells have values between those in the grey
// cells": the grid draws 21 shaded cells but no connecting lines, so a
// "separating" cell is read as any plain cell that sits directly between
// two grey cells with nothing else between them -- along a row, column, or
// diagonal (grey - X - grey, X not itself grey). Every grey cell
// participates in at least one such triple under this reading; a
// row/column-only reading would leave R7C1 and R9C3 unconstrained, which
// this reading avoids. Each triple is a Between(endpoint, mid, endpoint):
// the mid cell must be strictly between the two grey endpoints' values.
// Triples transcribed from the drawn grey-cell shading.
const betweenTriples = [
  // Rows
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C5', 'R2C6', 'R2C7'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R8C1', 'R8C2', 'R8C3'],
  ['R8C3', 'R8C4', 'R8C5'],
  ['R9C7', 'R9C8', 'R9C9'],
  // Columns
  ['R3C2', 'R4C2', 'R5C2'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R5C8', 'R6C8', 'R7C8'],
  // Diagonals
  ['R3C2', 'R4C3', 'R5C4'],
  ['R2C7', 'R3C6', 'R4C5'],
  ['R3C8', 'R4C7', 'R5C6'],
  ['R6C5', 'R7C4', 'R8C3'],
  ['R5C6', 'R6C7', 'R7C8'],
  ['R7C1', 'R8C2', 'R9C3'],
];

const givens = [
  ['R1C2', 7], ['R1C4', 5], ['R1C9', 4],
  ['R3C1', 8],
  ['R4C5', 8],
  ['R5C2', 8], ['R5C8', 6],
  ['R6C2', 5], ['R6C3', 3],
  ['R7C8', 9],
  ['R9C1', 7],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenTriples.map(cells => new Between(...cells)),
];
