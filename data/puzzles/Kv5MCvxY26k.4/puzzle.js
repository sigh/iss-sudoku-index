// Title: August 19, 2021:Numbered Rooms
// Author: clover!
// Video: https://www.youtube.com/watch?v=Kv5MCvxY26k
// Source: https://tinyurl.com/bz2rt5eb

// Normal sudoku rules apply. Sixteen outside clues read as "Numbered
// Rooms": the shown digit must sit in the Nth cell looking into the
// row/column from that side, where N is the digit already in the first
// cell of that direction (the cell nearest the clue) -- exactly ISS's
// built-in NumberedRoom.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cells listed from the clue side into the grid (NumberedRoom is directional).
const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

return [
  new Shape('9x9'),

  // Givens (source `grid` values with given:true).
  new Given('R1C4', 6),
  new Given('R1C5', 7),
  new Given('R1C6', 8),
  new Given('R2C2', 1),
  new Given('R4C4', 4),
  new Given('R4C6', 1),
  new Given('R6C4', 7),
  new Given('R6C6', 6),
  new Given('R8C8', 9),
  new Given('R9C4', 5),
  new Given('R9C5', 6),
  new Given('R9C6', 7),

  // Outside "Numbered Rooms" clues (source `text` entries in the margin
  // ring: R0/R10 above/below a column, C0/C10 left/right of a row).
  numberedRoom(1, 'R1C1', 0, 1),   // left, R1
  numberedRoom(1, 'R1C1', 1, 0),   // top, C1
  numberedRoom(6, 'R3C1', 0, 1),   // left, R3
  numberedRoom(6, 'R3C9', 0, -1),  // right, R3
  numberedRoom(6, 'R1C3', 1, 0),   // top, C3
  numberedRoom(2, 'R1C5', 1, 0),   // top, C5
  numberedRoom(9, 'R5C1', 0, 1),   // left, R5
  numberedRoom(9, 'R5C9', 0, -1),  // right, R5
  numberedRoom(6, 'R9C2', -1, 0),  // bottom, C2
  numberedRoom(3, 'R9C5', -1, 0),  // bottom, C5
  numberedRoom(5, 'R7C1', 0, 1),   // left, R7
  numberedRoom(5, 'R7C9', 0, -1),  // right, R7
  numberedRoom(3, 'R9C7', -1, 0),  // bottom, C7
  numberedRoom(5, 'R1C8', 1, 0),   // top, C8
  numberedRoom(2, 'R9C9', -1, 0),  // bottom, C9
  numberedRoom(2, 'R9C9', 0, -1),  // right, R9
];
