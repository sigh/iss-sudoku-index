// Title: Killer Convergence
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=zxT9wi6z8nc
// Source: https://app.crackingthecryptic.com/sudoku/fRrnrqL873

// Normal sudoku rules apply (rows, columns and boxes all-different).
//
// Three numbers are printed outside the grid: 13 left of row 4, 13 above
// column 7, 16 right of row 7. Per the rules each number does double duty --
// "Clues outside the grid are sandwich clues and little killer clues in both
// directions":
//   (a) Sandwich total for the row/column it sits beside -- the sum of the
//       digits strictly between the 1 and the 9 in that line.
//   (b) Little killer total on *each* of the two diagonals that run from the
//       number into the grid: "On each diagonal from the number, the digits
//       must sum to the number provided. Digits can repeat along these
//       diagonals." Both diagonals are required, not one of them -- "each
//       diagonal" / "in both directions".
//
// No rule is omitted.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const sandwiches = [
  Sandwich.fromCells(13, graph.row(4), geometry),
  Sandwich.fromCells(16, graph.row(7), geometry),
  Sandwich.fromCells(13, graph.column(7), geometry),
];

// A number printed in an outside lane cell sits beside a row/column but
// between two diagonals: the diagonal "from the number" starts at the cell
// diagonally adjacent to it, not at the orthogonally adjacent cell of the
// lane it labels. So the 13 left of row 4 (lane cell R4C0) runs up-right
// from R3C1 and down-right from R5C1; row 4's own cells are on neither.
const littleKiller = (total, start, dRow, dCol) =>
  LittleKiller.fromCells(total, graph.ray(start, dRow, dCol), geometry);

const leftOfRow4 = [
  littleKiller(13, 'R3C1', -1, 1),  // R3C1 R2C2 R1C3
  littleKiller(13, 'R5C1', 1, 1),   // R5C1 R6C2 R7C3 R8C4 R9C5
];
const aboveColumn7 = [
  littleKiller(13, 'R1C6', 1, -1),  // R1C6 R2C5 R3C4 R4C3 R5C2 R6C1
  littleKiller(13, 'R1C8', 1, 1),   // R1C8 R2C9
];
const rightOfRow7 = [
  littleKiller(16, 'R6C9', -1, -1), // R6C9 R5C8 R4C7 R3C6 R2C5 R1C4
  littleKiller(16, 'R8C9', 1, -1),  // R8C9 R9C8
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C9', 4),
  new Given('R3C3', 1),
  new Given('R7C7', 5),
  new Given('R9C1', 5),

  ...sandwiches,
  ...leftOfRow4,
  ...aboveColumn7,
  ...rightOfRow7,
];
