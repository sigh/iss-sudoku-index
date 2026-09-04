// Title: Numbered Rooms
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=fzS99RfGy8I
// Source: https://f-puzzles.com/?id=yj72k5d8

// Normal sudoku rules: each row and column holds 1-5 once each (a 5x5 grid
// has no valid box tiling, so a bare Shape('5x5') already omits boxes -- a
// Latin square). No givens are printed in the grid.
//
// Nine outside clues read as "Numbered Rooms": the shown digit must sit in
// the Nth cell looking into the row/column from that side, where N is the
// digit already in the first cell of that direction (the cell nearest the
// clue) -- exactly ISS's built-in NumberedRoom.
const graph = cellGraph('5x5');
const geometry = cellGeometry('5x5');

// Cells listed from the clue side into the grid (NumberedRoom is directional).
const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

return [
  new Shape('5x5'),

  // Outside "Numbered Rooms" clues, transcribed from the source's margin
  // badges (left of R1/R2/R3 = 1; above C3/C4/C5 = 3; right of R2/R3/R4 = 2).
  numberedRoom(1, 'R1C1', 0, 1),   // left, R1
  numberedRoom(1, 'R2C1', 0, 1),   // left, R2
  numberedRoom(1, 'R3C1', 0, 1),   // left, R3
  numberedRoom(3, 'R1C3', 1, 0),   // top, C3
  numberedRoom(3, 'R1C4', 1, 0),   // top, C4
  numberedRoom(3, 'R1C5', 1, 0),   // top, C5
  numberedRoom(2, 'R2C5', 0, -1),  // right, R2
  numberedRoom(2, 'R3C5', 0, -1),  // right, R3
  numberedRoom(2, 'R4C5', 0, -1),  // right, R4
];
