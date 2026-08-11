// Title: Numbered Rooms Sudoku 2
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=6hEUMb7DKB4
// Source: https://app.crackingthecryptic.com/sudoku/tMHDPtqHgG
//
// Normal sudoku rules apply. A clue's digit must appear in the Xth position
// looking into the grid in the row/column, where X is the digit in the
// first position (the cell nearest the clue's side). This is exactly ISS's
// built-in NumberedRoom outside clue.
//
// Cells are listed from the clue side into the grid (NumberedRoom is
// directional), using ray() to build each full row/column in the clue's
// looking-in direction. Values transcribed from the drawn outside-grid
// circle clues, keyed by row/column lane and side.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

return [
  new Shape('9x9'),

  // Top clues (looking down into the column, starting at row 1).
  numberedRoom(3, 'R1C1', 1, 0),
  numberedRoom(5, 'R1C2', 1, 0),
  numberedRoom(9, 'R1C3', 1, 0),
  numberedRoom(5, 'R1C4', 1, 0),
  numberedRoom(9, 'R1C5', 1, 0),
  numberedRoom(5, 'R1C6', 1, 0),
  numberedRoom(5, 'R1C8', 1, 0),

  // Bottom clues (looking up into the column, starting at row 9).
  numberedRoom(8, 'R9C2', -1, 0),
  numberedRoom(8, 'R9C4', -1, 0),
  numberedRoom(3, 'R9C5', -1, 0),
  numberedRoom(8, 'R9C6', -1, 0),
  numberedRoom(9, 'R9C7', -1, 0),
  numberedRoom(8, 'R9C8', -1, 0),

  // Left clues (looking right into the row, starting at column 1).
  numberedRoom(7, 'R1C1', 0, 1),
  numberedRoom(4, 'R4C1', 0, 1),
  numberedRoom(3, 'R7C1', 0, 1),
  numberedRoom(9, 'R9C1', 0, 1),

  // Right clues (looking left into the row, starting at column 9).
  numberedRoom(7, 'R1C9', 0, -1),
  numberedRoom(5, 'R2C9', 0, -1),
  numberedRoom(1, 'R3C9', 0, -1),
];
