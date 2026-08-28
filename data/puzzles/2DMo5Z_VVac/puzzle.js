// Title: The Cup Of Helga Hufflepuff
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=2DMo5Z_VVac
// Source: https://cracking-the-cryptic.web.app/sudoku/t44mhh2GnP

// Normal sudoku rules apply (standard 3x3 boxes, no given digits). Adjacent
// digits along the marked grey lines have a difference of at least five.
// Clues outside the grid indicate the sum of all digits sandwiched between
// the 1 and the 9 in the respective row or column.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Seven grey lines (drawn geometry, R1-9/C1-9); each a simple path.
const greyLines = [
  ['R1C1', 'R2C2'],
  ['R2C4', 'R1C5', 'R2C6'],
  ['R2C8', 'R1C9'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R3C3', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R4C6', 'R3C7'],
  ['R7C3', 'R8C2', 'R9C3', 'R9C4', 'R9C5', 'R8C6', 'R7C5'],
];

return [
  new Shape('9x9'),

  ...greyLines.map(cells => new Whisper(5, ...cells)),

  Sandwich.fromCells(20, graph.row('R3C1'), geometry),
  Sandwich.fromCells(27, graph.row('R5C1'), geometry),
  Sandwich.fromCells(9, graph.row('R9C1'), geometry),
  Sandwich.fromCells(3, graph.column('R1C2'), geometry),
  Sandwich.fromCells(35, graph.column('R1C5'), geometry),
];
