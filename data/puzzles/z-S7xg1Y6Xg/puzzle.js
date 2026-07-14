// Title: 10 Million Views
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=z-S7xg1Y6Xg
// Source: https://sudokupad.app/14uqnkivwz

// Normal sudoku rules apply. Along a main diagonal (marked in blue), digits
// may not repeat. Digits along an arrow sum to the digit in that arrow's
// circle. The green central 3x3 box forms a "magic square": each row,
// column and 3-cell main diagonal of this box must sum to the same total.
//
// Both diagonals are drawn in blue (and both are backed by a hidden
// all-different cage), so both are encoded as non-repeating even though the
// rule text names "a main diagonal" in the singular.

const graph = cellGraph('9x9');

// The green central box: its rows, columns, and both 3-cell diagonals must
// all share the same total (a magic square). Derived from the box cells
// rather than hand-listing R4C4 etc.
const box5 = graph.box(5);
const magicSquareSegments = [
  // Rows.
  box5.slice(0, 3),
  box5.slice(3, 6),
  box5.slice(6, 9),
  // Columns.
  [box5[0], box5[3], box5[6]],
  [box5[1], box5[4], box5[7]],
  [box5[2], box5[5], box5[8]],
  // Diagonals.
  [box5[0], box5[4], box5[8]],
  [box5[2], box5[4], box5[6]],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C8', 9),
  new Given('R8C4', 2),
  new Given('R8C6', 7),

  // Both main diagonals: no repeated digits.
  new Diagonal(1),
  new Diagonal(-1),

  // One arrow per corner box: the circle sits on the box's centre cell and
  // the arm loops through the other three cells nearest the grid's centre.
  new Arrow('R2C2', 'R2C3', 'R3C3', 'R3C2'),
  new Arrow('R2C8', 'R3C8', 'R3C7', 'R2C7'),
  new Arrow('R8C2', 'R7C2', 'R7C3', 'R8C3'),
  new Arrow('R8C8', 'R8C7', 'R7C7', 'R7C8'),

  // Magic square: the box's own all-different then forces the common sum.
  new EqualSum(...magicSquareSegments),
];
