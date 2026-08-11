// Title: Some On Some Off
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=wOmbGt5JpjU
// Source: https://app.crackingthecryptic.com/sudoku/RTtJntrbQL

// Normal sudoku rules apply, standard 3x3 boxes, no givens.
// "Along a main diagonal (marked in blue) digits cannot repeat": both
// diagonals are drawn, identically styled solid blue, so both are encoded.
// "Digits along an arrow must sum to the digit in that arrow's circle":
// each list below starts with the circle (bulb) cell, followed by the arm
// cells in drawn path order.
const arrows = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C3', 'R3C2', 'R2C1'],
  ['R1C5', 'R1C6', 'R2C6', 'R3C7'],
  ['R4C5', 'R5C4', 'R6C3', 'R7C2'],
  ['R5C3', 'R4C2', 'R3C1'],
  ['R4C7', 'R5C7', 'R5C6'],
  ['R9C8', 'R8C7', 'R7C6', 'R6C6', 'R7C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1), // main diagonal, R1C1-R9C9
  new Diagonal(1), // anti-diagonal, R9C1-R1C9
  ...arrows.map(cells => new Arrow(...cells)),
];
