// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JvEh37dS1xw
// Source: https://cracking-the-cryptic.web.app/sudoku/gmj9DJPFGh

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Two arrows of the same colour pointing toward one another in a row, a
// column or a diagonal mark a sandwich: the two boundary cells are also the
// digits of the sum of all the cells between them, in either order (e.g.
// boundary digits 3 and 7 mean the between-cells sum to 37 or 73). Digits
// may repeat in diagonal sandwiches, so no extra all-different is added for
// diagonal boundary pairs; row/column boundary pairs already differ by the
// row/column all-different constraint.
//
// The drawn arrow ticks (colour + direction, one per grid cell corner) were
// paired by same-colour, same-line, opposing-direction geometry into the 22
// boundary pairs below, grouped by drawn colour. One further arrow entry
// carries no coordinates and marks no cell; it is inert and contributes no
// 23rd sandwich.

// [colour, boundaryA, boundaryB, betweenCells]
const SANDWICHES = [
  // Grey (12)
  ['grey', 'R1C1', 'R1C7', ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6']],
  ['grey', 'R1C1', 'R9C1', ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1']],
  ['grey', 'R1C3', 'R1C7', ['R1C4', 'R1C5', 'R1C6']],
  ['grey', 'R1C4', 'R6C4', ['R2C4', 'R3C4', 'R4C4', 'R5C4']],
  ['grey', 'R1C8', 'R4C8', ['R2C8', 'R3C8']],
  ['grey', 'R5C3', 'R5C7', ['R5C4', 'R5C5', 'R5C6']],
  ['grey', 'R6C6', 'R6C9', ['R6C7', 'R6C8']],
  ['grey', 'R2C5', 'R7C5', ['R3C5', 'R4C5', 'R5C5', 'R6C5']],
  ['grey', 'R4C9', 'R9C9', ['R5C9', 'R6C9', 'R7C9', 'R8C9']],
  ['grey', 'R4C3', 'R4C9', ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8']],
  ['grey', 'R9C6', 'R9C9', ['R9C7', 'R9C8']],
  ['grey', 'R9C3', 'R9C9', ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8']],
  // Blue (4)
  ['blue', 'R1C1', 'R1C9', ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8']],
  ['blue', 'R1C3', 'R1C9', ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8']],
  ['blue', 'R4C1', 'R7C1', ['R5C1', 'R6C1']],
  ['blue', 'R2C5', 'R6C9', ['R3C6', 'R4C7', 'R5C8']], // diagonal
  // Red (4)
  ['red', 'R3C1', 'R8C1', ['R4C1', 'R5C1', 'R6C1', 'R7C1']],
  ['red', 'R1C1', 'R8C8', ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7']], // main diagonal
  ['red', 'R5C2', 'R5C8', ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7']],
  ['red', 'R4C5', 'R4C8', ['R4C6', 'R4C7']],
  // Black (2)
  ['black', 'R3C5', 'R7C1', ['R4C4', 'R5C3', 'R6C2']], // diagonal
  ['black', 'R4C8', 'R9C3', ['R5C7', 'R6C6', 'R7C5', 'R8C4']], // diagonal
];

// Boundary digits a, b (in either order) form the 2-digit total of the
// between-cells: Or of two Sum(0, ...) equations, one per order, using
// coefficients -10/-1 on whichever boundary cell is the tens/ones digit.
function sandwichConstraint(a, b, betweenCells) {
  return new Or([
    new Sum(0, ...betweenCells, [a, -10], [b, -1]),
    new Sum(0, ...betweenCells, [a, -1], [b, -10]),
  ]);
}

return [
  new Shape('9x9'),
  ...SANDWICHES.map(([, a, b, between]) => sandwichConstraint(a, b, between)),
];
