// Title: Feb 11, 2022: Double X
// Author: clover!
// Video: https://www.youtube.com/watch?v=0lKUNou9vuk
// Source: https://tinyurl.com/2p9erx78

// Normal sudoku rules apply (rows, columns, boxes all-different). Additionally,
// digits may not repeat along any of the four straight diagonal lines drawn on
// the grid. The lines are broken diagonals offset by one cell from the two
// main corner-to-corner diagonals, so this is not the built-in Diagonal
// (corner-to-corner) constraint -- each line is modelled as its own
// AllDifferent group over the 8 cells it covers.

const givens = [
  new Given('R1C1', 1), new Given('R1C3', 4),
  new Given('R2C2', 5), new Given('R2C9', 8),
  new Given('R3C1', 2), new Given('R3C3', 3), new Given('R3C7', 6),
  new Given('R4C7', 3), new Given('R4C9', 4),
  new Given('R5C5', 1),
  new Given('R6C1', 7), new Given('R6C3', 2),
  new Given('R7C3', 8), new Given('R7C7', 2), new Given('R7C9', 3),
  new Given('R8C1', 9), new Given('R8C5', 6), new Given('R8C8', 4),
  new Given('R9C7', 5), new Given('R9C9', 1),
];

// Diagonal lines, transcribed from the drawn line geometry (4 lines).
const diagonalLines = [
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
].map((cells) => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...diagonalLines,
];
