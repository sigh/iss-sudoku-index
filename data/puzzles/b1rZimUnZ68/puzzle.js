// Title: Numbered Rooms Sudoku
// Author: JonaS2010
// Video: https://www.youtube.com/watch?v=b1rZimUnZ68
// Source: https://sudokupad.app/420s9bg0dc
//
// Normal sudoku rules apply. A clue's digit must appear in the Nth position
// looking into the grid in the row/column, where N is the digit in the first
// position (the cell nearest the clue). This is exactly ISS's built-in
// NumberedRoom outside clue.
//
// Cells are listed from the clue side into the grid (NumberedRoom is
// directional), using ray() to build each full row/column in the clue's
// looking-in direction.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

return [
  new Shape('9x9'),

  // Top clues (looking down into the column, starting at row 1).
  numberedRoom(2, 'R1C1', 1, 0),
  numberedRoom(4, 'R1C2', 1, 0),
  numberedRoom(2, 'R1C3', 1, 0),
  numberedRoom(4, 'R1C4', 1, 0),
  numberedRoom(2, 'R1C6', 1, 0),
  numberedRoom(4, 'R1C7', 1, 0),
  numberedRoom(2, 'R1C8', 1, 0),
  numberedRoom(4, 'R1C9', 1, 0),

  // Bottom clues (looking up into the column, starting at row 9).
  numberedRoom(2, 'R9C2', -1, 0),
  numberedRoom(4, 'R9C4', -1, 0),
  numberedRoom(5, 'R9C5', -1, 0),
  numberedRoom(7, 'R9C6', -1, 0),

  // Left clues (looking right into the row, starting at column 1).
  numberedRoom(7, 'R3C1', 0, 1),
  numberedRoom(2, 'R4C1', 0, 1),
  numberedRoom(9, 'R5C1', 0, 1),
  numberedRoom(5, 'R6C1', 0, 1),
  numberedRoom(2, 'R9C1', 0, 1),

  // Right clues (looking left into the row, starting at column 9).
  numberedRoom(2, 'R4C9', 0, -1),
  numberedRoom(8, 'R9C9', 0, -1),
];
