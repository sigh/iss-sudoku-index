// Title: Searching For Secrets
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=TDZ8gK_Vqu0
// Source: https://app.crackingthecryptic.com/sudoku/68G9P3HpjT
//
// Normal sudoku rules apply on the plain 9x9 grid (standard boxes; no jigsaw
// regions). Two killer cages: digits do not repeat in a cage, and the cage
// shows its sum -- exactly Cage(sum, ...cells). Five palindrome lines (a
// line reads the same from both directions) -- exactly Palindrome(...cells).
// Ten outside clues read as "Numbered Rooms": the shown digit must sit in
// the Nth cell looking into the row/column from that side, where N is the
// digit already in the first cell of that direction -- exactly ISS's
// built-in NumberedRoom.
//
// Omission: "each palindrome has its own colour and lines of the same
// colour are connected" is drawn geometry only, not a separate constraint
// on its own -- and moot here besides, since all five lines use distinct
// colours (thistle, lightsteelblue, hotpink, khaki, mediumaquamarine), so no
// two lines are ever the same colour to connect.
//
// Fog-of-war is solving UI (see the source's "FOGLIGHT" cage stub over the
// same cells as the 10-cage) and is not part of the final-grid rules, so it
// is not encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cells listed from the clue side into the grid (NumberedRoom is directional).
const numberedRoom = (value, startCell, dRow, dCol) =>
  NumberedRoom.fromCells(value, graph.ray(startCell, dRow, dCol), geometry);

return [
  new Shape('9x9'),

  // Killer cages (source `cages` entries with unique:true; the sum is drawn).
  new Cage(10, 'R1C1', 'R1C2', 'R1C3', 'R2C1'),
  new Cage(17, 'R2C3', 'R3C3', 'R4C2', 'R4C3'),

  // Palindrome lines (source `lines`, one colour each).
  new Palindrome('R3C6', 'R2C7', 'R1C7'),
  new Palindrome('R7C1', 'R7C2', 'R8C3', 'R7C4', 'R8C5', 'R9C5'),
  new Palindrome('R3C2', 'R2C3', 'R2C4', 'R3C4', 'R4C5', 'R5C4', 'R5C3'),
  new Palindrome('R6C5', 'R6C6', 'R6C7', 'R7C8', 'R8C8', 'R8C7', 'R9C6'),
  new Palindrome(
    'R1C4', 'R1C5', 'R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8', 'R5C7'),

  // Outside "Numbered Rooms" clues (source overlays outside the frame).
  numberedRoom(4, 'R1C1', 1, 0),   // top, C1
  numberedRoom(5, 'R1C2', 1, 0),   // top, C2
  numberedRoom(4, 'R1C6', 1, 0),   // top, C6
  numberedRoom(5, 'R1C8', 1, 0),   // top, C8
  numberedRoom(2, 'R9C2', -1, 0),  // bottom, C2
  numberedRoom(3, 'R9C4', -1, 0),  // bottom, C4
  numberedRoom(3, 'R9C1', 0, 1),   // left, R9
  numberedRoom(5, 'R1C9', 0, -1),  // right, R1
  numberedRoom(5, 'R4C9', 0, -1),  // right, R4
  numberedRoom(6, 'R9C9', 0, -1),  // right, R9
];
